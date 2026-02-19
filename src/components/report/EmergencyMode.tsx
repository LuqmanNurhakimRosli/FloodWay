import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReportCategory } from '../../types/report';
import type { AutoTags } from '../../types/report';
import { useCamera } from '../../hooks/useCamera';
import { useGeolocation } from '../../hooks/useGeolocation';
import './EmergencyMode.css';

interface EmergencyModeProps {
    onSubmit: (data: {
        photoDataURLs: string[];
        category: ReportCategory;
        description: string;
        autoTags: AutoTags;
    }) => void;
    onCancel: () => void;
}

export default function EmergencyMode({ onSubmit, onCancel }: EmergencyModeProps) {
    const [category] = useState<ReportCategory>(ReportCategory.RISING_WATER);
    const [description, setDescription] = useState('');
    const [photoDataURLs, setPhotoDataURLs] = useState<string[]>([]);

    const [viewMode, setViewMode] = useState<'SELECTION' | 'CAMERA' | 'PREVIEW'>('SELECTION');

    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isActive, error: camError, startCamera, capturePhoto, stopCamera } = useCamera();
    const geo = useGeolocation();

    // Start camera only when in CAMERA mode
    useEffect(() => {
        if (viewMode === 'CAMERA') {
            startCamera(videoRef.current);
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [viewMode, startCamera, stopCamera]);

    const handleCapture = useCallback(() => {
        const result = capturePhoto();
        if (result.dataURL) {
            setPhotoDataURLs(prev => [...prev, result.dataURL!]);
            setViewMode('PREVIEW');
            stopCamera();
        }
    }, [capturePhoto, stopCamera]);



    const handleDeletePhoto = (index: number) => {
        setPhotoDataURLs(prev => prev.filter((_, i) => i !== index));
        if (photoDataURLs.length <= 1) {
            // If we deleted the last one, maybe go back to selection? 
            // Or just stay in preview with empty list? 
            // Let's stay in preview but show a prompt to add photos.
        }
    };

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPhotoDataURLs(prev => [...prev, url]);
        setViewMode('PREVIEW');
    }, []);

    // ── Selection Handlers ──
    const handleSelectCamera = () => setViewMode('CAMERA');
    const handleSelectGallery = () => fileInputRef.current?.click();

    const handleSubmit = () => {
        const autoTags: AutoTags = {
            lat: 3.163845,
            lng: 101.70193,
            accuracy: geo.accuracy ?? 0,
            timestamp: new Date().toISOString(),
            compassHeading: geo.heading,
        };
        onSubmit({ photoDataURLs, category, description, autoTags });
    };



    const canSubmit = category !== undefined && photoDataURLs.length > 0;

    return (
        <div className="emergency-mode">
            {/* ── Top Half: Controls ── */}
            {/* ── Evidence Layer (Instagram Inspired) ── */}
            <div className="emergency-evidence-layer">
                {/* ── Top Header and Info ── */}
                <div className="emergency-info-panel">
                    <div className="emergency-header">
                        <div className="emergency-title">
                            <span className="emergency-title-pulse" />
                            EMERGENCY SENTINEL
                        </div>
                        <button className="emergency-cancel" onClick={onCancel} id="emergency-cancel-btn">
                            ✕ CLOSE
                        </button>
                    </div>

                    {/* Auto Tags */}
                    <div className="auto-tags">
                        <div className="auto-tag">
                            <span className="auto-tag-icon">📍</span>
                            {geo.lat ? `${geo.lat.toFixed(4)}, ${geo.lng?.toFixed(4)}` : 'Locating...'}
                        </div>
                        <div className="auto-tag">
                            <span className="auto-tag-icon">🕐</span>
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>

                {/* ── Content Area: Camera/Selection (NOW AT TOP) ── */}
                <div className="emergency-visual-area">
                    {/* 1. SELECTION VIEW */}
                    {viewMode === 'SELECTION' && (
                        <div className="emergency-selection">
                            <div className="selection-prompt">
                                {photoDataURLs.length > 0 ? 'Add More Evidence' : 'Select Evidence Source'}
                            </div>
                            <div className="selection-buttons">
                                <button className="selection-btn camera" onClick={handleSelectCamera}>
                                    <span className="selection-icon">📸</span>
                                    <span className="selection-label">Use Camera</span>
                                </button>
                                <button className="selection-btn gallery" onClick={handleSelectGallery}>
                                    <span className="selection-icon">🖼️</span>
                                    <span className="selection-label">Upload Photo</span>
                                </button>
                            </div>
                            {photoDataURLs.length > 0 && (
                                <button className="back-to-preview-btn" onClick={() => setViewMode('PREVIEW')}>
                                    Back to Review ({photoDataURLs.length})
                                </button>
                            )}
                        </div>
                    )}

                    {/* 2. CAMERA VIEW */}
                    {viewMode === 'CAMERA' && (
                        <div className="emergency-camera-view">
                            <video
                                ref={videoRef}
                                className="camera-video"
                                autoPlay
                                playsInline
                                muted
                            />
                            {isActive && (
                                <div className="camera-overlay">
                                    <div className="camera-crosshair" />
                                    <button
                                        className="capture-btn"
                                        onClick={handleCapture}
                                        aria-label="Capture photo"
                                        id="capture-btn"
                                    >
                                        📸
                                    </button>
                                    <button
                                        className="back-btn-floating"
                                        onClick={() => setViewMode(photoDataURLs.length > 0 ? 'PREVIEW' : 'SELECTION')}
                                    >
                                        ↩
                                    </button>
                                </div>
                            )}
                            {camError && (
                                <div className="camera-error">
                                    <div className="camera-error-icon">📷</div>
                                    <p>Camera access denied</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. PREVIEW VIEW (Multi-Image) */}
                    {viewMode === 'PREVIEW' && (
                        <div className="photo-preview-container">
                            <div className="preview-grid">
                                {photoDataURLs.map((url, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={url} alt={`Evidence ${index + 1}`} />
                                        <button
                                            className="delete-photo-btn"
                                            onClick={() => handleDeletePhoto(index)}
                                            aria-label="Delete photo"
                                        >
                                            ✕
                                        </button>
                                        <div className="preview-index-badge">{index + 1} / {photoDataURLs.length}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating Add Button */}
                            <button className="add-more-card" onClick={() => setViewMode('SELECTION')} aria-label="Add more photos">
                                <span className="add-more-icon">+</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Briefing Panel (Description) ── */}
                <div className="flex flex-col flex-1 p-6 gap-4 overflow-y-auto">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider uppercase">
                        <span>📝</span>
                        <span>SITUATION BRIEFING</span>
                    </div>
                    <textarea
                        className="w-full flex-1 min-h-[120px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-base resize-none focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-gray-500"
                        placeholder="Describe the situation... (e.g. Water rising quickly)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        id="report-description"
                    />

                    {/* ── Submit Button (Now inside panel) ── */}
                    <button
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg tracking-wide uppercase transition-all duration-300 shadow-lg flex flex-col items-center justify-center gap-1
                            ${canSubmit
                                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 hover:-translate-y-0.5 shadow-red-600/30'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                            }`}
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        id="submit-report-btn"
                    >
                        <span>SUBMIT REPORT</span>
                        <span className="text-xs opacity-80 font-medium normal-case">
                            {photoDataURLs.length > 0 ? `${photoDataURLs.length} Photos Attached` : 'Evidence Required'}
                        </span>
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                        AI verification will begin immediately after submission.
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="emergency-file-input"
                />
            </div>
        </div>
    );
}
