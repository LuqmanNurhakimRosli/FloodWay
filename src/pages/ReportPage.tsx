import { useState, useCallback } from 'react';
import type { AIVerificationResult, AutoTags, ReportFormOutput } from '../types/report';
import { ReportCategory, VerificationStatus } from '../types/report';
import type { FloodReport } from '../types/report';

import EmergencyMode from '../components/report/EmergencyMode';
import AIVerification from '../components/report/AIVerification';
import ReportForm from '../components/report/ReportForm';
import { useGeolocation } from '../hooks/useGeolocation';
import { useApp } from '../store';
import '../components/report/report.css';

type ReportScreen = 'LIST' | 'EMERGENCY' | 'VERIFICATION' | 'REPORT';

export function ReportPage() {
    const [screen, setScreen] = useState<ReportScreen>('LIST');
    const { floodReports, addFloodReport } = useApp();
    const geo = useGeolocation();

    // Pending report being verified
    const [pendingReport, setPendingReport] = useState<Omit<
        FloodReport,
        'id' | 'aiResult' | 'createdAt'
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
        </>
    );
}

// ── Report List / Overview Screen ──
function ReportListScreen({
    reports,
    onActivateEmergency,
}: {
    reports: FloodReport[];
    onActivateEmergency: () => void;
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
                        AI-verified flood reports from the community
                    </p>
                </div>
                <div className="report-count-badge">
                    <span className="report-count-dot" />
                    {reports.length} Reports
                </div>
            </header>

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
                            const isVerified = report.aiResult?.status === VerificationStatus.VERIFIED;
                            const confidence = report.aiResult?.confidence ?? 0;
                            const depth = report.aiResult?.depthEstimate || 'N/A';
                            const time = new Date(report.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

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
                                            <span className={`report-card-status ${isVerified ? 'verified' : 'not-verified'}`}>
                                                {isVerified ? '✅ Verified!' : '❌ Not Verified'}
                                            </span>
                                            <span className="report-card-depth">
                                                Depth: {depth}
                                            </span>
                                        </div>
                                        <div className="report-card-humanreview">
                                            🤖+👤 {isVerified ? 'AI Verified · Human review pending' : 'Escalated to human moderator'}
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
                Reports appear on the Shelter map with flood zones
            </div>
        </div>
    );
}
