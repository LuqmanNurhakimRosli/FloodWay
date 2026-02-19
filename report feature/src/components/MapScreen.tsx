import type { FloodReport } from '../types';
import ReportCard from './ReportCard';
import './MapScreen.css';

interface MapScreenProps {
    reports: FloodReport[];
    onActivateEmergency: () => void;
    onActivateReport: () => void;
}

export default function MapScreen({ reports, onActivateEmergency }: MapScreenProps) {

    return (
        <div className="map-screen">
            <div className="map-bg" />

            {/* ── Header ── */}
            <header className="map-header">
                <div className="map-header-left">
                    <div className="app-logo">
                        FloodWay <span>Sentinel</span>
                    </div>
                </div>
            </header>

            {/* ── Reports ── */}
            <div className="reports-layer">
                {reports.length === 0 && (
                    <div className="reports-empty">
                        <div className="reports-empty-icon">🛰️</div>
                        <p>No reports yet.</p>
                        <p>Tap the Red Alert button to submit evidence.</p>
                    </div>
                )}
                {reports.map((r) => (
                    <ReportCard key={r.id} report={r} />
                ))}
            </div>

            {/* ── Action Buttons ── */}
            <div className="map-action-buttons">
                <div className="action-btn-group">
                    <button
                        className="red-alert-btn"
                        onClick={onActivateEmergency}
                        aria-label="Activate Emergency Mode"
                        id="red-alert-btn"
                    >
                        🚨
                    </button>
                    <div className="red-alert-label">Emergency</div>
                </div>
            </div>

            {/* ── Status bar ── */}
            <div className="map-status-bar">
                <span>
                    <span className="status-dot" />
                    Community Sentinel Active
                </span>
                <span>{reports.length} reports submitted</span>
            </div>
        </div>
    );
}
