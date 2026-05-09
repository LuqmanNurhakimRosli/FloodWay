import { useEffect, useState } from 'react';
import type { AIVerificationResult, FloodReport } from '../../types/report';
import { VerificationStatus } from '../../types/report';
import { simulateAIVerification } from '../../utils/aiVerification';
import { Waves, CheckCircle2, AlertTriangle, XCircle, Zap, Cpu, Search, Info } from 'lucide-react';
import './AIVerification.css';

const STATUS_MESSAGES = [
    'Analyzing image content...',
    'Detecting water levels...',
    'Estimating flood depth...',
    'Cross-referencing GPS...',
    'Running anomaly detection...',
    'Sending to Gemini 1.5 Flash...',
    'Finalizing verification...',
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
        }, 1200);
        return () => clearInterval(interval);
    }, [phase]);

    // Run AI verification
    useEffect(() => {
        let cancelled = false;
        // Simulate a slightly longer scan for "wow" effect
        const timer = setTimeout(() => {
            simulateAIVerification(report).then((res) => {
                if (cancelled) return;
                setResult(res);
                setPhase('result');
            });
        }, 4000);
        
        return () => { 
            cancelled = true; 
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getConfidenceColor = (c: number) => {
        if (c >= 85) return '#22C55E';
        if (c >= 60) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div className="ai-verification-container">
            {/* Bottom Layer: Background & Wave */}
            <div className="auth-bg">
                <div className="auth-wave">
                    <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,202.7C960,203,1056,149,1152,122.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            <div className="ai-card">
                {phase === 'scanning' ? (
                    <>
                        <div className="radar-container">
                            <div className="radar-ring" />
                            <div className="radar-ring" />
                            <div className="radar-ring" />
                            <div className="radar-sweep" />
                            <div className="radar-center" />
                        </div>
                        <div className="ai-status-text">
                            <Search className="inline-block mr-2 w-5 h-5 text-blue-500 animate-pulse" />
                            {STATUS_MESSAGES[statusIdx]}
                        </div>
                        <div className="ai-substatus">
                            Gemini AI processing image details...
                        </div>
                    </>
                ) : (
                    result && (
                        <>
                            <div className="ai-result-header">
                                <div className={`ai-result-icon ${
                                    result.status === VerificationStatus.VERIFIED ? 'icon-verified' : 
                                    result.status === VerificationStatus.REJECTED ? 'icon-rejected' : 'icon-unverified'
                                }`}>
                                    {result.status === VerificationStatus.VERIFIED ? <CheckCircle2 size={40} /> : 
                                     result.status === VerificationStatus.REJECTED ? <XCircle size={40} /> : <AlertTriangle size={40} />}
                                </div>
                                <h2 className="ai-result-title">
                                    {result.status === VerificationStatus.VERIFIED ? 'Verified Successfully' : 
                                     result.status === VerificationStatus.REJECTED ? 'Analysis Rejected' : 'Verification Pending'}
                                </h2>
                                <p className="ai-result-summary">{result.summary}</p>
                            </div>

                            {/* API Duration Badge */}
                            <div className="ai-api-badge">
                                <Zap size={14} className="ai-api-icon" />
                                <span>Analyzed in <strong>{(result.apiDurationMs / 1000).toFixed(1)}s</strong> by Gemini 1.5 Flash</span>
                            </div>

                            {/* Details Card */}
                            <div className="ai-details-card">
                                <div className="ai-detail-row">
                                    <span className="ai-detail-label">AI Confidence</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="confidence-bar-bg">
                                            <div
                                                className="confidence-bar-fill"
                                                style={{
                                                    width: `${result.confidence}%`,
                                                    background: getConfidenceColor(result.confidence),
                                                }}
                                            />
                                        </div>
                                        <span className="ai-detail-value">{result.confidence}%</span>
                                    </div>
                                </div>
                                <div className="ai-detail-row">
                                    <span className="ai-detail-label">Water Presence</span>
                                    <span className="ai-detail-value">{result.waterDetected ? '✅ Detected' : '❌ Not Found'}</span>
                                </div>
                                {result.depthEstimate && (
                                    <div className="ai-detail-row">
                                        <span className="ai-detail-label">Est. Depth</span>
                                        <span className="ai-detail-value">{result.depthEstimate}</span>
                                    </div>
                                )}
                                <div className="ai-detail-row">
                                    <span className="ai-detail-label">Location Check</span>
                                    <span className="ai-detail-value" style={{ 
                                        color: result.crossRefStatus === 'CONSISTENT' ? '#059669' : '#DC2626' 
                                    }}>{result.crossRefStatus}</span>
                                </div>
                            </div>

                            {/* Dual Verification Notice */}
                            <div className="ai-dual-notice">
                                <Info className="ai-dual-icon" />
                                <span>
                                    {result.status === VerificationStatus.VERIFIED
                                        ? 'AI Verified — Your report has been prioritized for the live emergency map.'
                                        : result.status === VerificationStatus.REJECTED
                                            ? 'AI flagged this image as invalid or unrelated. It will not appear on the map.'
                                            : 'Low confidence — This report has been escalated to a human moderator.'}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="ai-result-actions">
                                {result.status === VerificationStatus.REJECTED ? (
                                    <>
                                        <button className="result-btn result-btn-primary" onClick={onRetry} id="retry-btn">
                                            Retake Evidence
                                        </button>
                                        <button className="result-btn result-btn-secondary" onClick={() => onComplete(result)} id="dismiss-btn">
                                            Dismiss Report
                                        </button>
                                    </>
                                ) : (
                                    <button className="result-btn result-btn-primary" onClick={() => onComplete(result)} id="return-to-map-btn">
                                        Confirm & Return to Map
                                    </button>
                                )}
                            </div>

                            {/* Raw Data Toggle (Advanced) */}
                            <div className="ai-raw-section">
                                <button className="ai-raw-toggle" onClick={() => setShowRawJson(!showRawJson)} id="toggle-raw-json-btn">
                                    <Cpu size={12} className="mr-1" />
                                    {showRawJson ? 'Hide Metadata' : 'View Raw AI Metadata'}
                                    <span className="ai-raw-badge ml-auto">DEBUG</span>
                                </button>
                                {showRawJson && (
                                    <pre className="ai-raw-json">
                                        {JSON.stringify(result.rawAiResponse, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
}
