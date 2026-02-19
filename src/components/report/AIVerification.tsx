import { useEffect, useState } from 'react';
import type { AIVerificationResult, FloodReport } from '../../types/report';
import { VerificationStatus } from '../../types/report';
import { simulateAIVerification } from '../../utils/aiVerification';
import './AIVerification.css';

const STATUS_MESSAGES = [
    '🔍 Analyzing image content...',
    '🌊 Detecting water levels...',
    '📏 Estimating flood depth...',
    '📍 Cross-referencing GPS location...',
    '🧠 Running anomaly detection...',
    '☁️ Sending to Gemini 1.5 Flash...',
    '👤 Queuing for human review...',
    '✅ Finalizing verification...',
];

interface AIVerificationProps {
    report: Omit<FloodReport, 'id' | 'aiResult' | 'humanReview' | 'createdAt'>;
    onComplete: (result: AIVerificationResult) => void;
    onRetry: () => void;
}

export default function AIVerification({ report, onComplete, onRetry }: AIVerificationProps) {
    const [phase, setPhase] = useState<'scanning' | 'result'>('scanning');
    const [statusIdx, setStatusIdx] = useState(0);
    const [result, setResult] = useState<AIVerificationResult | null>(null);
    const [showRawJson, setShowRawJson] = useState(false);

    // Cycle status messages
    useEffect(() => {
        if (phase !== 'scanning') return;
        const interval = setInterval(() => {
            setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length);
        }, 800);
        return () => clearInterval(interval);
    }, [phase]);

    // Run AI verification
    useEffect(() => {
        let cancelled = false;
        simulateAIVerification(report).then((res) => {
            if (cancelled) return;
            setResult(res);
            setPhase('result');
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getConfidenceColor = (c: number) => {
        if (c >= 85) return 'var(--accent-green)';
        if (c >= 50) return 'var(--accent-yellow)';
        return 'var(--accent-red)';
    };

    return (
        <div className="ai-verification">
            {phase === 'scanning' && (
                <>
                    <div className="radar-container">
                        <div className="radar-ring" />
                        <div className="radar-ring" />
                        <div className="radar-ring" />
                        <div className="radar-sweep" />
                        <div className="radar-center" />
                    </div>
                    <div className="ai-status-text">{STATUS_MESSAGES[statusIdx]}</div>
                    <div className="ai-substatus">
                        Dual Verification Pipeline: AI + Human Review
                    </div>
                </>
            )}

            {phase === 'result' && result && (
                <div className="ai-result">
                    {/* Icon */}
                    <div className="ai-result-icon">
                        {result.status === VerificationStatus.VERIFIED && '✅'}
                        {result.status === VerificationStatus.UNVERIFIED && '⚠️'}
                        {result.status === VerificationStatus.REJECTED && '❌'}
                    </div>

                    {/* Title */}
                    <div
                        className={`ai-result-title ${result.status === VerificationStatus.VERIFIED
                            ? 'verified'
                            : result.status === VerificationStatus.UNVERIFIED
                                ? 'unverified'
                                : 'rejected'
                            }`}
                    >
                        {result.status === VerificationStatus.VERIFIED && '✅ Verified!'}
                        {result.status === VerificationStatus.UNVERIFIED && '⚠️ Not Verified'}
                        {result.status === VerificationStatus.REJECTED && '❌ Not Verified'}
                    </div>

                    <div className="ai-result-summary">{result.summary}</div>

                    {/* API Duration Badge */}
                    {result.apiDurationMs && (
                        <div className="ai-api-badge">
                            <span className="ai-api-icon">⚡</span>
                            <span>Analyzed in <strong>{(result.apiDurationMs / 1000).toFixed(1)}s</strong> by Gemini 1.5 Flash</span>
                        </div>
                    )}

                    {/* Dual Verification Notice */}
                    <div className="ai-dual-notice">
                        <span className="ai-dual-icon">🤖 + 👤</span>
                        <span>
                            {result.status === VerificationStatus.VERIFIED
                                ? 'AI Verified — Queued for human moderator confirmation.'
                                : result.status === VerificationStatus.REJECTED
                                    ? 'AI flagged as invalid — Pending human moderator review.'
                                    : 'Low confidence — Escalated to human moderator for review.'}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="ai-details-card">
                        <div className="ai-detail-row">
                            <span className="ai-detail-label">Confidence</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="ai-detail-value">{result.confidence}%</span>
                                <div className="confidence-bar-bg">
                                    <div
                                        className="confidence-bar-fill"
                                        style={{
                                            width: `${result.confidence}%`,
                                            background: getConfidenceColor(result.confidence),
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="ai-detail-row">
                            <span className="ai-detail-label">Water Detected</span>
                            <span className="ai-detail-value">
                                {result.waterDetected ? '✓ Yes' : '✗ No'}
                            </span>
                        </div>
                        {result.depthEstimate && (
                            <div className="ai-detail-row">
                                <span className="ai-detail-label">Est. Depth</span>
                                <span className="ai-detail-value">{result.depthEstimate}</span>
                            </div>
                        )}
                        <div className="ai-detail-row">
                            <span className="ai-detail-label">Location Check</span>
                            <span className="ai-detail-value">{result.crossRefStatus}</span>
                        </div>
                        {result.anomalies.length > 0 && (
                            <div className="ai-detail-row">
                                <span className="ai-detail-label">Anomalies</span>
                                <span className="ai-detail-value" style={{ textAlign: 'right', fontSize: 12 }}>
                                    {result.anomalies.join(', ')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Raw AI Response (Demo Feature) */}
                    {result.rawAiResponse && (
                        <div className="ai-raw-section">
                            <button
                                className="ai-raw-toggle"
                                onClick={() => setShowRawJson(!showRawJson)}
                                id="toggle-raw-json-btn"
                            >
                                <span className="ai-raw-toggle-icon">{showRawJson ? '▼' : '▶'}</span>
                                <span>Raw Gemini API Response</span>
                                <span className="ai-raw-badge">LIVE</span>
                            </button>
                            {showRawJson && (
                                <pre className="ai-raw-json">
                                    {JSON.stringify(result.rawAiResponse, null, 2)}
                                </pre>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="ai-result-actions">
                        {result.status === VerificationStatus.REJECTED ? (
                            <>
                                <button className="result-btn result-btn-retry" onClick={onRetry} id="retry-btn">
                                    Retake Photo
                                </button>
                                <button
                                    className="result-btn result-btn-secondary"
                                    onClick={() => onComplete(result)}
                                    id="dismiss-btn"
                                >
                                    Dismiss
                                </button>
                            </>
                        ) : (
                            <button
                                className="result-btn result-btn-primary"
                                onClick={() => onComplete(result)}
                                id="return-to-map-btn"
                            >
                                Return to Map
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
