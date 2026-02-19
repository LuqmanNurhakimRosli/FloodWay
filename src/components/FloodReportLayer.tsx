/**
 * FloodReportLayer — renders verified flood reports as markers + circles on a Leaflet map.
 * Designed to be placed inside a <MapContainer>.
 */
import { Fragment } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../store';

// Pulse marker icon for flood reports
const createReportMarkerIcon = (isFlood: boolean) => new L.DivIcon({
    className: 'flood-report-marker-icon',
    html: `
        <div class="flood-report-marker ${isFlood ? 'is-flood' : 'is-warning'}">
            <div class="flood-report-pin">
                <span>${isFlood ? '🌊' : '⚠️'}</span>
            </div>
            <div class="flood-report-pulse"></div>
        </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
});

export function FloodReportLayer() {
    const { floodReports } = useApp();

    if (floodReports.length === 0) return null;

    return (
        <>
            {floodReports.map((report) => {
                const isFlood = report.aiResult?.waterDetected === true;
                const severity = report.aiResult?.depthEstimate || 'Unknown';
                const confidence = report.aiResult?.confidence ?? 0;

                return (
                    <Fragment key={report.id}>
                        <Marker
                            position={[report.autoTags.lat, report.autoTags.lng]}
                            icon={createReportMarkerIcon(isFlood)}
                        >
                            <Popup className="flood-report-popup">
                                <div style={{
                                    padding: '14px',
                                    minWidth: '220px',
                                    maxWidth: '280px',
                                    fontFamily: 'Inter, system-ui, sans-serif',
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '10px',
                                    }}>
                                        <span style={{
                                            fontWeight: 800,
                                            color: isFlood ? '#ef4444' : '#f59e0b',
                                            fontSize: '0.8rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.03em',
                                        }}>
                                            {isFlood ? '🌊 Flash Flood' : '⚠️ Incident'}
                                        </span>
                                        <span style={{
                                            fontSize: '0.68rem',
                                            color: 'rgba(255,255,255,0.4)',
                                            fontWeight: 500,
                                        }}>
                                            {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: '0.78rem',
                                        color: 'rgba(255,255,255,0.85)',
                                        marginBottom: '10px',
                                        lineHeight: 1.4,
                                        fontStyle: 'italic',
                                    }}>
                                        {report.description || 'No description provided.'}
                                    </p>
                                    {report.photoDataURLs.length > 0 && (
                                        <div style={{
                                            width: '100%',
                                            height: '100px',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            marginBottom: '10px',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                        }}>
                                            <img
                                                src={report.photoDataURLs[0]}
                                                alt="Evidence"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981' }}>
                                            ✅ Verified ({confidence}%)
                                        </span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
                                            Depth: {severity}
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Flood zone circle */}
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
        </>
    );
}
