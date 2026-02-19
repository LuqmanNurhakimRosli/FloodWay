import { useState } from 'react';
import type { FloodReport } from '../../types/report';
import { CATEGORY_META, VerificationStatus } from '../../types/report';
import './ReportCard.css';

interface ReportCardProps {
    report: FloodReport;
}

export default function ReportCard({ report }: ReportCardProps) {
    const [expanded, setExpanded] = useState(false);
    const meta = CATEGORY_META[report.category];
    const status = report.aiResult?.status ?? VerificationStatus.PENDING;

    const statusLabel =
        status === VerificationStatus.VERIFIED
            ? 'verified'
            : status === VerificationStatus.UNVERIFIED
                ? 'unverified'
                : 'rejected';

    const timeAgo = getTimeAgo(report.createdAt);

    return (
        <>
            <div className="report-card" onClick={() => setExpanded(true)} id={`report-${report.id}`}>
                {report.photoDataURLs.length > 0 ? (
                    <img className="report-card-thumb" src={report.photoDataURLs[0]} alt="Evidence" />
                ) : (
                    <div className="report-card-thumb-placeholder">{meta.emoji}</div>
                )}
                <div className="report-card-body">
                    <div className="report-card-header">
                        <div className="report-card-category">
                            <span
                                className="report-card-category-dot"
                                style={{ background: meta.color }}
                            />
                            {meta.emoji} {meta.label}
                        </div>
                        <span className={`report-card-status ${statusLabel}`}>
                            {statusLabel}
                        </span>
                    </div>
                    <p className="report-card-desc">
                        {report.description || 'No description provided'}
                    </p>
                    <div className="report-card-footer">
                        <span>{timeAgo}</span>
                        {report.aiResult && (
                            <span className="report-card-confidence">
                                🎯 {report.aiResult.confidence}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Detail */}
            {expanded && (
                <div className="report-detail-overlay" onClick={() => setExpanded(false)}>
                    <div className="report-detail" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="report-detail-close"
                            onClick={() => setExpanded(false)}
                        >
                            ✕
                        </button>
                        {report.photoDataURLs.length > 0 && (
                            <div className="report-detail-gallery">
                                {report.photoDataURLs.map((url, idx) => (
                                    <img
                                        key={idx}
                                        className="report-detail-img"
                                        src={url}
                                        alt={`Evidence ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="report-detail-body">
                            <div className="report-card-header" style={{ marginBottom: 12 }}>
                                <div className="report-card-category" style={{ fontSize: 16 }}>
                                    {meta.emoji} {meta.label}
                                </div>
                                <span className={`report-card-status ${statusLabel}`}>
                                    {statusLabel}
                                </span>
                            </div>

                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {report.description || 'No description provided'}
                            </p>

                            {report.aiResult && (
                                <div className="report-detail-meta">
                                    <span className="report-detail-tag">
                                        🎯 Confidence: {report.aiResult.confidence}%
                                    </span>
                                    <span className="report-detail-tag">
                                        🌊 Water: {report.aiResult.waterDetected ? 'Yes' : 'No'}
                                    </span>
                                    {report.aiResult.depthEstimate && (
                                        <span className="report-detail-tag">
                                            📏 Depth: {report.aiResult.depthEstimate}
                                        </span>
                                    )}
                                    <span className="report-detail-tag">
                                        📍 {report.autoTags.lat.toFixed(4)}, {report.autoTags.lng.toFixed(4)}
                                    </span>
                                    <span className="report-detail-tag">
                                        🕐 {new Date(report.createdAt).toLocaleString()}
                                    </span>
                                    {report.autoTags.compassHeading !== null && (
                                        <span className="report-detail-tag">
                                            🧭 Heading: {Math.round(report.autoTags.compassHeading)}°
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function getTimeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}
