
import React, { useState, useRef } from 'react';
import { analyzeFloodImage, type AIAnalysis } from '../utils/openai';
import type { ReportFormOutput } from '../types';
import './ReportForm.css';

interface UserLocation {
    lat: number;
    lng: number;
    accuracy?: number;
}

interface ReportFormProps {
    userLocation?: UserLocation;
    onSubmit?: (data: ReportFormOutput) => void;
    onSafe?: () => void;
    onCancel?: () => void;
}

// Hardcoded location for prototype sync as requested
const SYNC_LOCATION = {
    latitude: 3.16158,
    longitude: 101.701254
};

const ReportForm: React.FC<ReportFormProps> = ({ userLocation, onSubmit, onSafe, onCancel }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [description, setDescription] = useState<string>('');
    const [needsRescue, setNeedsRescue] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<AIAnalysis | null>(null);
    const [showResult, setShowResult] = useState<boolean>(false);
    const [safeMessage, setSafeMessage] = useState<string | null>(null);
    const [generatedReport, setGeneratedReport] = useState<ReportFormOutput | null>(null);

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSafetyCheck = () => {
        // Log the safe check-in
        const timestamp = new Date().toISOString();
        const location = {
            latitude: userLocation?.lat || SYNC_LOCATION.latitude,
            longitude: userLocation?.lng || SYNC_LOCATION.longitude
        };

        console.log("SAFE MARKER SENT:", {
            type: "SAFE_CHECK_IN",
            user_id: "user_demo_01",
            timestamp,
            location
        });

        // Show UI feedback
        setSafeMessage("You kept yourself safe! Location marked.");

        // Wait then notify parent
        setTimeout(() => {
            setSafeMessage(null);
            if (onSafe) onSafe();
        }, 2000);
    };

    const handleSubmit = async () => {
        if (!description && !imagePreview) {
            alert("Please add a photo or description.");
            return;
        }

        setIsLoading(true);

        // 1. Minimum wait time (2 seconds)
        const waitPromise = new Promise(resolve => setTimeout(resolve, 2000));

        // 2. AI Analysis
        // If imagePreview is present, it's a base64 data URL.
        const analysisPromise = analyzeFloodImage(imagePreview, description);

        try {
            const [_, analysis] = await Promise.all([waitPromise, analysisPromise]);

            setResult(analysis);

            // 3. Construct the "Golden Record" JSON
            const reportData: ReportFormOutput = {
                report_id: `rpt_${Math.floor(Math.random() * 1000)}`,
                user_id: "user_demo_01",
                timestamp: new Date().toISOString(),

                // 1. FROM MAIN APP (Props) -> User wants specific fallback for sync
                location: {
                    latitude: SYNC_LOCATION.latitude, // using the hardcoded sync location
                    longitude: SYNC_LOCATION.longitude,
                    accuracy: userLocation?.accuracy || 12.5
                },

                // 2. FROM THIS COMPONENT (User Input)
                user_input: {
                    image_blob: imagePreview ? "blob:http://captured_image" : null,
                    description: description,
                    needs_rescue: needsRescue
                },

                // 3. MOCKED/REAL AI RESPONSE
                ai_analysis: {
                    detected_type: analysis.detected_type,
                    severity: analysis.severity,
                    is_verified: analysis.is_verified,
                    ai_feedback: analysis.ai_feedback
                }
            };

            setGeneratedReport(reportData);
            console.log("FINAL REPORT JSON:", JSON.stringify(reportData, null, 2));

            setShowResult(true);

        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit report. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const closeResult = () => {
        setShowResult(false);
        // User saw the result, now we can proceed with app navigation
        if (onSubmit && generatedReport) {
            onSubmit(generatedReport);
        } else if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="report-form-container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <div className="loading-text">AI Analyzing Scene...</div>
                </div>
            )}

            {showResult && result && (
                <div className="result-modal">
                    <div className="result-icon">
                        {result.detected_type === "Flash Flood" ? "🌊" :
                            result.detected_type === "Rising Water" ? "💧" : "✅"}
                    </div>
                    <div className="result-title">
                        {result.detected_type}
                    </div>
                    <div className="result-desc">
                        {result.severity} Severity • {result.is_verified ? "Verified" : "Unverified"}
                    </div>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>"{result.ai_feedback}"</p>
                    <button className="submit-btn" onClick={closeResult} style={{ width: '100%' }}>
                        Close
                    </button>
                </div>
            )}

            {safeMessage && (
                <div className="result-modal" style={{ borderColor: 'var(--accent-green)' }}>
                    <div className="result-icon">💚</div>
                    <div className="result-title">You are Safe!</div>
                    <div className="result-desc">{safeMessage}</div>
                </div>
            )}

            <div className="report-form-header">
                <h2>New Flood Report</h2>
                <p>Help your community stay safe</p>
            </div>

            {/* Camera / Image Section */}
            <div className="camera-section" onClick={handleCameraClick}>
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    className="camera-input"
                    onChange={handleFileChange}
                />

                {imagePreview ? (
                    <>
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                        <button className="remove-image-btn" onClick={handleRemoveImage}>×</button>
                    </>
                ) : (
                    <div className="camera-label">
                        {/* Simple Camera Icon SVG */}
                        <svg viewBox="0 0 24 24" className="camera-icon">
                            <path d="M4 8h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zm0 2v10h16V10H4zm8 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                        </svg>
                        <span>Tap to Take Photo</span>
                    </div>
                )}
            </div>

            {/* Description Input */}
            <div className="input-group">
                <label className="input-label">Describe Situation</label>
                <textarea
                    className="text-input"
                    placeholder="E.g., Water entering house, road blocked..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {/* Needs Rescue Toggle */}
            <div className="rescue-toggle-group">
                <div className="rescue-label">
                    <span className="rescue-title">Needs Rescue?</span>
                    <span className="rescue-desc">Prioritizes your report for responders</span>
                </div>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={needsRescue}
                        onChange={(e) => setNeedsRescue(e.target.checked)}
                    />
                    <span className="slider"></span>
                </label>
            </div>

            {/* Submit Button */}
            <button className="submit-btn" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Report'}
            </button>

            {/* Winning Feature: I Am Safe */}
            <button className="safe-btn" onClick={handleSafetyCheck}>
                I am Safe
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer' }}>Cancel</button>
            </div>

        </div>
    );
};

export default ReportForm;
