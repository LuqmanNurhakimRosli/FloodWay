import { useState, useCallback } from 'react';
import type { AIVerificationResult, AutoTags, ReportFormOutput } from '../types/report';
import { ReportCategory, VerificationStatus, HumanReviewStatus } from '../types/report';
import type { FloodReport } from '../types/report';

import EmergencyMode from '../components/report/EmergencyMode';
import AIVerification from '../components/report/AIVerification';
import ReportForm from '../components/report/ReportForm';
import ModeratorPanel from '../components/report/ModeratorPanel';
import { useGeolocation } from '../hooks/useGeolocation';
import { useApp } from '../store';
import '../components/report/report.css';

type ReportScreen = 'LIST' | 'EMERGENCY' | 'VERIFICATION' | 'REPORT' | 'MODERATOR';

export function ReportPage() {
    const [screen, setScreen] = useState<ReportScreen>('LIST');
    const { floodReports, addFloodReport } = useApp();
    const geo = useGeolocation();

    // Pending report being verified
    const [pendingReport, setPendingReport] = useState<Omit<
        FloodReport,
        'id' | 'aiResult' | 'humanReview' | 'createdAt'
    > | null>(null);

    // ── Transitions ──
    const handleActivateEmergency = useCallback(() => {
        setScreen('EMERGENCY');
    }, []);

    const handleCancelEmergency = useCallback(() => {
        setScreen('LIST');
        setPendingReport(null);
    }, []);

    const handleSubmitEvidence = useCallback(
        (data: {
            photoDataURLs: string[];
            category: ReportCategory;
            description: string;
            autoTags: AutoTags;
        }) => {
            setPendingReport(data);
            setScreen('VERIFICATION');
        },
        [],
    );

    const handleVerificationComplete = useCallback(
        (result: AIVerificationResult) => {
            if (!pendingReport) return;

            // Only add to global store if not rejected
            if (result.status !== VerificationStatus.REJECTED) {
                const newReport: FloodReport = {
                    id: crypto.randomUUID(),
                    photoDataURLs: pendingReport.photoDataURLs,
                    category: pendingReport.category,
                    description: pendingReport.description,
                    autoTags: pendingReport.autoTags,
                    aiResult: result,
                    humanReview: {
                        status: HumanReviewStatus.PENDING,
                        reviewedAt: null,
                        moderatorNote: null,
                    },
                    createdAt: new Date().toISOString(),
                };
                addFloodReport(newReport);
            }

            setPendingReport(null);
            setScreen('LIST');
        },
        [pendingReport, addFloodReport],
    );

    const handleRetry = useCallback(() => {
        setScreen('EMERGENCY');
        setPendingReport(null);
    }, []);

    // ── Report Form ──
    const handleReportSubmit = useCallback((data: ReportFormOutput) => {
        console.log('📋 Report submitted:', data);
        setScreen('LIST');
    }, []);

    const handleSafe = useCallback(() => {
        console.log('💚 User marked safe at:', geo.lat, geo.lng);
        setScreen('LIST');
    }, [geo.lat, geo.lng]);

    return (
        <>
            {screen === 'LIST' && (
                <ReportListScreen
                    reports={floodReports}
                    onActivateEmergency={handleActivateEmergency}
                    onOpenModerator={() => setScreen('MODERATOR')}
                />
            )}

            {screen === 'EMERGENCY' && (
                <EmergencyMode
                    onSubmit={handleSubmitEvidence}
                    onCancel={handleCancelEmergency}
                />
            )}

            {screen === 'VERIFICATION' && pendingReport && (
                <AIVerification
                    report={pendingReport}
                    onComplete={handleVerificationComplete}
                    onRetry={handleRetry}
                />
            )}

            {screen === 'REPORT' && (
                <ReportForm
                    userLocation={{
                        lat: geo.lat ?? 3.0253,
                        lng: geo.lng ?? 101.6178,
                        accuracy: geo.accuracy ?? 12.5,
                    }}
                    onSubmit={handleReportSubmit}
                    onSafe={handleSafe}
                    onCancel={() => setScreen('LIST')}
                />
            )}

            {screen === 'MODERATOR' && (
                <ModeratorPanel
                    onBack={() => setScreen('LIST')}
                />
            )}
        </>
    );
}

// ── Helper: Get pipeline status label ──
function getPipelineStatus(report: FloodReport) {
    const aiStatus = report.aiResult?.status;
    const humanStatus = report.humanReview.status;

    if (humanStatus === HumanReviewStatus.APPROVED) {
        return { label: '✅ Fully Verified', className: 'pipeline-approved', phase: 3 };
    }
    if (humanStatus === HumanReviewStatus.OVERRIDDEN) {
        return { label: '✅ Override Approved', className: 'pipeline-overridden', phase: 3 };
    }
    if (humanStatus === HumanReviewStatus.REJECTED) {
        return { label: '❌ Rejected by Moderator', className: 'pipeline-rejected', phase: 3 };
    }

    // Human review pending
    if (aiStatus === VerificationStatus.VERIFIED) {
        return { label: '⏳ Awaiting Human Review', className: 'pipeline-pending', phase: 2 };
    }
    if (aiStatus === VerificationStatus.UNVERIFIED) {
        return { label: '⏳ Escalated to Moderator', className: 'pipeline-escalated', phase: 2 };
    }

    return { label: '🔄 Processing', className: 'pipeline-processing', phase: 1 };
}

// ── Report List / Overview Screen ──
function ReportListScreen({
    reports,
    onActivateEmergency,
    onOpenModerator,
}: {
    reports: FloodReport[];
    onActivateEmergency: () => void;
    onOpenModerator: () => void;
}) {
    return (
        <div className="report-list-screen">
            {/* Header */}
            <header className="report-list-header">
                <div>
                    <h1 className="report-list-title">
                        Community <span>Sentinel</span>
                    </h1>
                    <p className="report-list-subtitle">
                        Dual AI + Human verified flood reports
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        className="moderator-access-btn"
                        onClick={onOpenModerator}
                        id="moderator-panel-btn"
                        title="Open Moderator Panel"
                    >
                        🔑
                    </button>
                    <div className="report-count-badge">
                        <span className="report-count-dot" />
                        {reports.length} Reports
                    </div>
                </div>
            </header>

            {/* Pipeline Legend */}
            {reports.length > 0 && (
                <div className="pipeline-legend">
                    <span className="pipeline-legend-item">
                        <span className="pipeline-dot dot-ai" /> AI Analyzed
                    </span>
                    <span className="pipeline-legend-item">
                        <span className="pipeline-dot dot-pending" /> Human Pending
                    </span>
                    <span className="pipeline-legend-item">
                        <span className="pipeline-dot dot-approved" /> Fully Verified
                    </span>
                </div>
            )}

            {/* Content */}
            <div className="report-list-content">
                {reports.length === 0 ? (
                    <div className="report-list-empty">
                        <div className="report-empty-icon">🛰️</div>
                        <h2>No Reports Yet</h2>
                        <p>Submit your first flood report using the Emergency button below.</p>
                    </div>
                ) : (
                    <div className="report-list-grid">
                        {reports.map((report) => {
                            const isFlood = report.aiResult?.waterDetected === true;
                            const confidence = report.aiResult?.confidence ?? 0;
                            const depth = report.aiResult?.depthEstimate || 'N/A';
                            const time = new Date(report.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            });
                            const pipeline = getPipelineStatus(report);

                            return (
                                <div
                                    key={report.id}
                                    className={`report-card ${isFlood ? 'flood' : 'warning'}`}
                                >
                                    {/* Image */}
                                    {report.photoDataURLs.length > 0 && (
                                        <div className="report-card-image">
                                            <img
                                                src={report.photoDataURLs[0]}
                                                alt="Evidence"
                                            />
                                            <div className="report-card-badge">
                                                {isFlood ? '🌊 Flash Flood' : '⚠️ Incident'}
                                            </div>
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="report-card-body">
                                        <div className="report-card-meta">
                                            <span className="report-card-time">🕐 {time}</span>
                                            <span className="report-card-confidence">
                                                {confidence}% confidence
                                            </span>
                                        </div>
                                        <p className="report-card-desc">
                                            {report.description || 'No description provided.'}
                                        </p>
                                        <div className="report-card-footer">
                                            <span className={`report-card-status ${report.aiResult?.status === VerificationStatus.VERIFIED ? 'verified' : 'not-verified'}`}>
                                                {report.aiResult?.status === VerificationStatus.VERIFIED ? '✅ AI Verified' : '❌ AI Not Verified'}
                                            </span>
                                            <span className="report-card-depth">
                                                Depth: {depth}
                                            </span>
                                        </div>

                                        {/* 3-Phase Pipeline Status */}
                                        <div className="report-pipeline-tracker">
                                            <div className="pipeline-phases">
                                                <div className={`pipeline-phase ${pipeline.phase >= 1 ? 'active' : ''}`}>
                                                    <span className="pipeline-phase-dot">📷</span>
                                                    <span className="pipeline-phase-label">Submitted</span>
                                                </div>
                                                <div className="pipeline-connector" />
                                                <div className={`pipeline-phase ${pipeline.phase >= 2 ? 'active' : ''}`}>
                                                    <span className="pipeline-phase-dot">🤖</span>
                                                    <span className="pipeline-phase-label">AI</span>
                                                </div>
                                                <div className="pipeline-connector" />
                                                <div className={`pipeline-phase ${pipeline.phase >= 3 ? 'active' : ''}`}>
                                                    <span className="pipeline-phase-dot">👤</span>
                                                    <span className="pipeline-phase-label">Human</span>
                                                </div>
                                            </div>
                                            <div className={`pipeline-status-badge ${pipeline.className}`}>
                                                {pipeline.label}
                                            </div>
                                        </div>

                                        <div className="report-card-location">
                                            📍 {report.autoTags.lat.toFixed(4)}, {report.autoTags.lng.toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FAB */}
            <div className="report-list-fab-area">
                <button
                    className="report-list-fab"
                    onClick={onActivateEmergency}
                    id="report-emergency-btn"
                >
                    🚨
                </button>
                <span className="report-list-fab-label">Report Emergency</span>
            </div>

            {/* Bottom hint */}
            <div className="report-list-hint">
                <span className="report-hint-dot" />
                Fully verified reports appear on the Shelter map
            </div>
        </div>
    );
}
