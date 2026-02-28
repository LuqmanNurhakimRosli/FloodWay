import { useState } from 'react';
import { useApp } from '../../store';
import { VerificationStatus, HumanReviewStatus } from '../../types/report';
import type { FloodReport, HumanReview } from '../../types/report';
import './ModeratorPanel.css';

interface ModeratorPanelProps {
    onBack: () => void;
}

export default function ModeratorPanel({ onBack }: ModeratorPanelProps) {
    const { floodReports, updateHumanReview, deleteFloodReport } = useApp();
    const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
    const [moderatorNote, setModeratorNote] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const filteredReports = floodReports.filter(r => {
        if (filter === 'pending') return r.humanReview.status === HumanReviewStatus.PENDING;
        if (filter === 'reviewed') return r.humanReview.status !== HumanReviewStatus.PENDING;
        return true;
    });

    const pendingCount = floodReports.filter(
        r => r.humanReview.status === HumanReviewStatus.PENDING
    ).length;

    const handleAction = (reportId: string, status: HumanReview['status']) => {
        updateHumanReview(reportId, {
            status,
            reviewedAt: new Date().toISOString(),
            moderatorNote: moderatorNote || null,
        });
        setSelectedReport(null);
        setModeratorNote('');
    };

    const handleDelete = (reportId: string) => {
        deleteFloodReport(reportId);
        setSelectedReport(null);
        setConfirmDelete(false);
        setModeratorNote('');
    };

    const closePanel = () => {
        setSelectedReport(null);
        setConfirmDelete(false);
        setModeratorNote('');
    };

    const getHumanStatusBadge = (review: HumanReview) => {
        switch (review.status) {
            case HumanReviewStatus.PENDING:
                return <span className="mod-badge mod-badge-pending">⏳ Pending</span>;
            case HumanReviewStatus.APPROVED:
                return <span className="mod-badge mod-badge-approved">✅ Approved</span>;
            case HumanReviewStatus.OVERRIDDEN:
                return <span className="mod-badge mod-badge-overridden">🔄 Overridden</span>;
            case HumanReviewStatus.REJECTED:
                return <span className="mod-badge mod-badge-rejected">❌ Rejected</span>;
        }
    };

    return (
        <div className="moderator-panel">
            {/* Header */}
            <header className="mod-header">
                <button className="mod-back-btn" onClick={onBack} id="mod-back-btn">
                    ← Back
                </button>
                <div className="mod-header-info">
                    <h1 className="mod-title">
                        🔑 Moderator Panel
                    </h1>
                    <p className="mod-subtitle">
                        Human Review — Layer 2 Verification
                    </p>
                </div>
                {pendingCount > 0 && (
                    <div className="mod-pending-count">
                        {pendingCount} pending
                    </div>
                )}
            </header>

            {/* Filter Tabs */}
            <div className="mod-filters">
                <button
                    className={`mod-filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({floodReports.length})
                </button>
                <button
                    className={`mod-filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({pendingCount})
                </button>
                <button
                    className={`mod-filter-btn ${filter === 'reviewed' ? 'active' : ''}`}
                    onClick={() => setFilter('reviewed')}
                >
                    Reviewed ({floodReports.length - pendingCount})
                </button>
            </div>

            {/* Report Queue */}
            <div className="mod-queue">
                {filteredReports.length === 0 ? (
                    <div className="mod-empty">
                        <div className="mod-empty-icon">📭</div>
                        <p>No reports in this category</p>
                    </div>
                ) : (
                    filteredReports.map(report => (
                        <div
                            key={report.id}
                            className={`mod-report-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedReport(report);
                                setModeratorNote('');
                                setConfirmDelete(false);
                            }}
                        >
                            {/* Left: Evidence */}
                            <div className="mod-card-evidence">
                                {report.photoDataURLs.length > 0 ? (
                                    <img
                                        src={report.photoDataURLs[0]}
                                        alt="Evidence"
                                        className="mod-card-thumb"
                                    />
                                ) : (
                                    <div className="mod-card-thumb-placeholder">📷</div>
                                )}
                            </div>

                            {/* Center: Details */}
                            <div className="mod-card-details">
                                <div className="mod-card-row">
                                    <span className="mod-card-time">
                                        {new Date(report.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                    <span className={`mod-card-ai ${report.aiResult?.status === VerificationStatus.VERIFIED
                                        ? 'ai-verified' : 'ai-unverified'
                                        }`}>
                                        🤖 {report.aiResult?.status === VerificationStatus.VERIFIED
                                            ? 'AI ✓' : 'AI ✗'}
                                        {' '}({report.aiResult?.confidence ?? 0}%)
                                    </span>
                                </div>
                                <p className="mod-card-desc">
                                    {report.description || 'No description'}
                                </p>
                                <div className="mod-card-row">
                                    <span className="mod-card-loc">
                                        📍 {report.autoTags.lat.toFixed(4)}, {report.autoTags.lng.toFixed(4)}
                                    </span>
                                </div>
                                {report.humanReview.moderatorNote && (
                                    <div className="mod-card-note">
                                        💬 {report.humanReview.moderatorNote}
                                    </div>
                                )}
                            </div>

                            {/* Right: Status + quick delete */}
                            <div className="mod-card-status">
                                {getHumanStatusBadge(report.humanReview)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail / Action Panel (when a report is selected) */}
            {selectedReport && (
                <div className="mod-action-panel">
                    <div className="mod-action-overlay" onClick={closePanel} />
                    <div className="mod-action-sheet">
                        <div className="mod-action-handle" />

                        <h2 className="mod-action-title">Review Report</h2>

                        {/* Evidence Preview */}
                        <div className="mod-evidence-grid">
                            {selectedReport.photoDataURLs.map((url, i) => (
                                <img key={i} src={url} alt={`Evidence ${i + 1}`} className="mod-evidence-img" />
                            ))}
                        </div>

                        {/* AI vs Human comparison */}
                        <div className="mod-comparison">
                            <div className="mod-comparison-col">
                                <h3 className="mod-comp-title">🤖 AI Verdict</h3>
                                <div className={`mod-comp-status ${selectedReport.aiResult?.status === VerificationStatus.VERIFIED
                                    ? 'status-verified' : 'status-unverified'
                                    }`}>
                                    {selectedReport.aiResult?.status === VerificationStatus.VERIFIED
                                        ? '✅ Verified' : '❌ Not Verified'}
                                </div>
                                <div className="mod-comp-detail">
                                    Confidence: {selectedReport.aiResult?.confidence}%
                                </div>
                                <div className="mod-comp-detail">
                                    Depth: {selectedReport.aiResult?.depthEstimate || 'N/A'}
                                </div>
                                <div className="mod-comp-detail mod-comp-summary">
                                    {selectedReport.aiResult?.summary}
                                </div>
                            </div>
                            <div className="mod-comparison-divider" />
                            <div className="mod-comparison-col">
                                <h3 className="mod-comp-title">👤 Your Decision</h3>
                                <div className="mod-comp-status">
                                    {getHumanStatusBadge(selectedReport.humanReview)}
                                </div>
                                {selectedReport.humanReview.reviewedAt && (
                                    <div className="mod-comp-detail">
                                        Reviewed: {new Date(selectedReport.humanReview.reviewedAt).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Description */}
                        <div className="mod-user-desc">
                            <h4>User Description</h4>
                            <p>{selectedReport.description || 'No description provided.'}</p>
                        </div>

                        {/* Moderator Note */}
                        {!confirmDelete && (
                            <div className="mod-note-section">
                                <label className="mod-note-label" htmlFor="mod-note-input">
                                    Moderator Note (optional)
                                </label>
                                <textarea
                                    id="mod-note-input"
                                    className="mod-note-input"
                                    placeholder="Add context or reasoning..."
                                    value={moderatorNote}
                                    onChange={e => setModeratorNote(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        )}

                        {/* ── Delete confirmation state ── */}
                        {confirmDelete ? (
                            <div className="mod-delete-confirm">
                                <div className="mod-delete-confirm__icon">🗑️</div>
                                <p className="mod-delete-confirm__text">
                                    Permanently delete this report? This <strong>cannot be undone</strong>.
                                </p>
                                <div className="mod-action-buttons">
                                    <button
                                        className="mod-btn mod-btn-delete-confirm"
                                        onClick={() => handleDelete(selectedReport.id)}
                                        id="mod-delete-confirm-btn"
                                    >
                                        🗑️ Yes, Delete Permanently
                                    </button>
                                    <button
                                        className="mod-btn mod-btn-cancel"
                                        onClick={() => setConfirmDelete(false)}
                                        id="mod-delete-cancel-btn"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── Normal action buttons ── */
                            <div className="mod-action-buttons">
                                <button
                                    className="mod-btn mod-btn-approve"
                                    onClick={() => handleAction(selectedReport.id, HumanReviewStatus.APPROVED)}
                                    id="mod-approve-btn"
                                >
                                    ✅ Approve & Publish
                                </button>

                                {selectedReport.aiResult?.status !== VerificationStatus.VERIFIED && (
                                    <button
                                        className="mod-btn mod-btn-override"
                                        onClick={() => handleAction(selectedReport.id, HumanReviewStatus.OVERRIDDEN)}
                                        id="mod-override-btn"
                                    >
                                        🔄 Override AI — Approve
                                    </button>
                                )}

                                <button
                                    className="mod-btn mod-btn-reject"
                                    onClick={() => handleAction(selectedReport.id, HumanReviewStatus.REJECTED)}
                                    id="mod-reject-btn"
                                >
                                    ❌ Reject Report
                                </button>

                                {/* Danger zone divider */}
                                <div className="mod-danger-divider">
                                    <span>Danger Zone</span>
                                </div>

                                <button
                                    className="mod-btn mod-btn-delete"
                                    onClick={() => setConfirmDelete(true)}
                                    id="mod-delete-btn"
                                >
                                    🗑️ Delete Report
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
