import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { ReportCategory } from '../../types/report';
import type { AutoTags } from '../../types/report';
import { useCamera } from '../../hooks/useCamera';
import { useGeolocation } from '../../hooks/useGeolocation';
import 'leaflet/dist/leaflet.css';
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

// Custom marker icon for pinning
const pinIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

function MapPicker({ onLocationSelect, initialPos }: { onLocationSelect: (lat: number, lng: number) => void; initialPos: [number, number] }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function EmergencyMode({ onSubmit, onCancel }: EmergencyModeProps) {
    const [category] = useState<ReportCategory>(ReportCategory.RISING_WATER);
    const [description, setDescription] = useState('');
    const [photoDataURLs, setPhotoDataURLs] = useState<string[]>([]);
    const [pinnedLocation, setPinnedLocation] = useState<{ lat: number; lng: number } | null>(null);

    const [viewMode, setViewMode] = useState<'SELECTION' | 'CAMERA' | 'PREVIEW' | 'MAP'>('SELECTION');

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
        setPhotoDataURLs(prev => {
            const next = prev.filter((_, i) => i !== index);
            if (next.length === 0) setViewMode('SELECTION');
            return next;
        });
    };

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataURL = reader.result as string;
            setPhotoDataURLs(prev => [...prev, dataURL]);
            setViewMode('PREVIEW');
        };
        reader.readAsDataURL(file);
    }, []);

    // ── Selection Handlers ──
    const handleSelectCamera = () => setViewMode('CAMERA');
    const handleSelectGallery = () => fileInputRef.current?.click();
    const handleSelectMap = () => setViewMode('MAP');

    const handleSubmit = () => {
        const finalLat = pinnedLocation?.lat || geo.lat || 3.163845;
        const finalLng = pinnedLocation?.lng || geo.lng || 101.70193;

        const autoTags: AutoTags = {
            lat: finalLat,
            lng: finalLng,
            accuracy: pinnedLocation ? 1.0 : (geo.accuracy ?? 0), // Pinned location is considered precise
            timestamp: new Date().toISOString(),
            compassHeading: geo.heading,
        };
        onSubmit({ photoDataURLs, category, description, autoTags });
    };

    const canSubmit = category !== undefined && photoDataURLs.length > 0;
    const currentPos: [number, number] = [pinnedLocation?.lat || geo.lat || 3.163845, pinnedLocation?.lng || geo.lng || 101.70193];

    return (
        <div className="emergency-mode">
            <div className="emergency-evidence-layer">
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

                    <div className="auto-tags">
                        <div className={`auto-tag ${pinnedLocation ? 'border-cyan-500 text-cyan-400' : ''}`}>
                            <span className="auto-tag-icon">📍</span>
                            {pinnedLocation ? 'Pinned: ' : ''}{currentPos[0].toFixed(4)}, {currentPos[1].toFixed(4)}
                            {pinnedLocation && <button className="ml-2 text-[10px] underline" onClick={() => setPinnedLocation(null)}>Reset</button>}
                        </div>
                        <div className="auto-tag">
                            <span className="auto-tag-icon">🕐</span>
                            {new Date().toLocaleTimeString()}
                        </div>
                        <button 
                            className={`auto-tag auto-tag--btn ${viewMode === 'MAP' ? 'active' : ''}`}
                            onClick={() => setViewMode('MAP')}
                        >
                            <span className="auto-tag-icon">🗺️</span>
                            {pinnedLocation ? 'Change Pin' : 'Manual Pin'}
                        </button>

                    </div>
                </div>

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
                            <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
                            {isActive && (
                                <div className="camera-overlay">
                                    <div className="camera-crosshair" />
                                    <button className="capture-btn" onClick={handleCapture} aria-label="Capture photo" id="capture-btn">📸</button>
                                    <button className="back-btn-floating" onClick={() => setViewMode(photoDataURLs.length > 0 ? 'PREVIEW' : 'SELECTION')}>↩</button>
                                </div>
                            )}
                            {camError && (
                                <div className="camera-error">
                                    <div className="camera-error-icon">📷</div>
                                    <p>{camError}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. PREVIEW VIEW */}
                    {viewMode === 'PREVIEW' && (
                        <div className="photo-preview-container">
                            <div className="preview-grid">
                                {photoDataURLs.map((url, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={url} alt={`Evidence ${index + 1}`} />
                                        <button className="delete-photo-btn" onClick={() => handleDeletePhoto(index)} aria-label="Delete photo">✕</button>
                                        <div className="preview-index-badge">{index + 1} / {photoDataURLs.length}</div>
                                    </div>
                                ))}
                            </div>
                            <button className="add-more-card" onClick={() => setViewMode('SELECTION')} aria-label="Add more photos"><span className="add-more-icon">+</span></button>
                        </div>
                    )}

                    {/* 4. MAP PICKER VIEW */}
                    {viewMode === 'MAP' && (
                        <div className="emergency-map-picker">
                            <MapContainer center={currentPos} zoom={16} style={{ width: '100%', height: '100%' }}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                                <Marker position={currentPos} icon={pinIcon} />
                                <MapPicker onLocationSelect={(lat, lng) => setPinnedLocation({ lat, lng })} initialPos={currentPos} />
                            </MapContainer>
                            <div className="map-picker-overlay">
                                <div className="map-picker-hint">Tap on map to pin location</div>
                                <button className="map-confirm-btn" onClick={() => setViewMode(photoDataURLs.length > 0 ? 'PREVIEW' : 'SELECTION')}>
                                    Confirm Location
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="emergency-briefing-panel">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] tracking-[0.25em] uppercase opacity-70">
                        <span>📝</span>
                        <span>SITUATION BRIEFING</span>
                    </div>
                    <div className="relative flex-1 flex flex-col">
                        <textarea
                            className="desc-input w-full flex-1 min-h-[140px] bg-white border border-[#C7D0DA] rounded-2xl p-5 text-slate-900 text-lg resize-none focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 leading-relaxed shadow-sm"
                            placeholder="What's happening? (e.g. Water is knee-deep and rising quickly...)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            id="report-description"
                        />
                        <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 font-mono opacity-50">
                            {description.length} CHARS
                        </div>
                    </div>
                </div>

                <div className="submit-bar">
                    <button
                        className={`w-full py-5 rounded-2xl font-black text-white text-xl tracking-wider uppercase transition-all duration-500 shadow-2xl flex flex-col items-center justify-center gap-1 group relative overflow-hidden
                            ${canSubmit
                                ? 'bg-gradient-to-br from-red-600 via-red-500 to-orange-600 hover:scale-[1.02] active:scale-[0.98] shadow-red-600/40 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                            }`}
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        id="submit-report-btn"
                    >
                        {canSubmit && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        )}
                        <span className="relative z-10">SUBMIT REPORT</span>
                        <span className="text-[10px] opacity-70 font-bold tracking-widest normal-case relative z-10">
                            {photoDataURLs.length > 0 ? `${photoDataURLs.length} EVIDENCE FILES ATTACHED` : 'EVIDENCE REQUIRED'}
                        </span>
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-slate-500 font-bold tracking-widest opacity-60">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        AI SENTINEL ACTIVE
                    </div>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="emergency-file-input" />
            </div>
        </div>
    );
}
