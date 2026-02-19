import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FloodReport } from '../../types/report';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';
import { useEffect, Fragment } from 'react';

interface MapScreenProps {
    reports: FloodReport[];
    onActivateEmergency: () => void;
    onActivateReport: () => void;
}

// Custom report marker icon with pulse animation
const createReportIcon = (isFlood: boolean) => new L.DivIcon({
    className: 'report-marker-icon',
    html: `
        <div class="report-marker ${isFlood ? 'flood' : 'warning'}">
            <div class="report-marker-pin">
                <span>${isFlood ? '🌊' : '⚠️'}</span>
            </div>
            <div class="report-marker-pulse"></div>
        </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
});

// Fly map to latest report location
function MapUpdater({ reports }: { reports: FloodReport[] }) {
    const map = useMap();
    useEffect(() => {
        if (reports.length > 0) {
            const latest = reports[0];
            map.flyTo([latest.autoTags.lat, latest.autoTags.lng], 15, { duration: 1.5 });
        }
    }, [reports, map]);
    return null;
}

export default function MapScreen({ reports, onActivateEmergency }: MapScreenProps) {
    // Default center: Kuala Lumpur area
    const defaultCenter: [number, number] = [3.0253, 101.6178];

    return (
        <div className="map-screen">
            <div className="map-container-wrapper">
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Render each verified report as a marker + optional flood circle */}
                    {reports.map((report) => {
                        const isFlood = report.aiResult?.waterDetected === true;
                        const severity = report.aiResult?.depthEstimate || 'Unknown';

                        return (
                            <Fragment key={report.id}>
                                <Marker
                                    position={[report.autoTags.lat, report.autoTags.lng]}
                                    icon={createReportIcon(isFlood)}
                                >
                                    <Popup className="report-popup">
                                        <div className="popup-content">
                                            <div className="popup-header">
                                                <span className="popup-type">
                                                    {isFlood ? '🌊 Flash Flood' : '⚠️ Incident'}
                                                </span>
                                                <span className="popup-time">
                                                    {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="popup-desc">
                                                {report.description || 'No description provided.'}
                                            </p>
                                            {report.photoDataURLs.length > 0 && (
                                                <div className="popup-image">
                                                    <img src={report.photoDataURLs[0]} alt="Evidence" />
                                                </div>
                                            )}
                                            <div className="popup-footer">
                                                <span className="popup-status">
                                                    ✅ Verified ({report.aiResult?.confidence}% confidence)
                                                </span>
                                                <span className="popup-depth">
                                                    Depth: {severity}
                                                </span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>

                                {/* Flood zone circle overlay */}
                                {isFlood && (
                                    <Circle
                                        center={[report.autoTags.lat, report.autoTags.lng]}
                                        radius={300}
                                        pathOptions={{
                                            color: '#ef4444',
                                            fillColor: '#ef4444',
                                            fillOpacity: 0.15,
                                            weight: 2,
                                            dashArray: '8, 6',
                                        }}
                                    />
                                )}
                            </Fragment>
                        );
                    })}

                    <MapUpdater reports={reports} />
                </MapContainer>
            </div>

            {/* Header Overlay */}
            <header className="map-header">
                <div className="map-header-left">
                    <div className="app-logo">
                        FloodWay <span>Sentinel</span>
                    </div>
                </div>
            </header>

            {/* Emergency Button */}
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

            {/* Status Bar */}
            <div className="map-status-bar">
                <span>
                    <span className="status-dot" />
                    Live Monitoring Active
                </span>
                <span>{reports.length} incidents verified</span>
            </div>
        </div>
    );
}
