// Prediction Page - 24-hour flood forecast
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../store';

export function PredictionPage() {
    const navigate = useNavigate();
    const { selectedLocation, prediction } = useApp();

    // Redirect if no location selected
    useEffect(() => {
        if (!selectedLocation || !prediction) {
            navigate('/location');
        }
    }, [selectedLocation, prediction, navigate]);

    if (!selectedLocation || !prediction) return null;

    const hasDanger = prediction.hourlyPredictions.some(p => p.riskLevel === 'danger');
    const dangerHours = prediction.hourlyPredictions.filter(p => p.riskLevel === 'danger');
    const nextDangerHour = dangerHours.length > 0 ? dangerHours[0] : null;

    return (
        <div className="page prediction-page">
            {/* Header */}
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/location')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="header-content">
                    <div className="location-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{selectedLocation.name}</span>
                    </div>
                    <h1>Flood Forecast</h1>
                </div>
            </header>

            <main className="page-content">
                {/* Danger Alert */}
                {hasDanger && (
                    <div className="alert alert-danger animate-pulse-border">
                        <div className="alert-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <div className="alert-content">
                            <h3>FLOOD WARNING</h3>
                            <p>High risk expected at {nextDangerHour?.time}. Prepare to evacuate.</p>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => navigate('/shelters')}>
                            Find Shelter
                        </button>
                    </div>
                )}

                {/* Risk Status Card */}
                <div className={`risk-card risk-${prediction.overallRisk}`}>
                    <div className="risk-visual">
                        <div className="risk-circle">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" className="risk-bg" />
                                <circle
                                    cx="50" cy="50" r="45"
                                    className="risk-progress"
                                    strokeDasharray={`${(prediction.hourlyPredictions[0]?.probability || 0) * 2.83} 283`}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="risk-value">
                                <span className="risk-percent">{prediction.hourlyPredictions[0]?.probability || 0}</span>
                                <span className="risk-unit">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="risk-info">
                        <h2 className={`risk-level-text risk-${prediction.overallRisk}`}>
                            {prediction.overallRisk === 'danger' ? 'High Risk' :
                                prediction.overallRisk === 'warning' ? 'Moderate Risk' : 'Low Risk'}
                        </h2>
                        <p>Peak risk at {prediction.peakRiskHour}:00</p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="timeline-section">
                    <h3 className="section-title">24-Hour Timeline</h3>
                    <div className="timeline-container">
                        {prediction.hourlyPredictions.slice(0, 12).map((hour, index) => (
                            <div
                                key={index}
                                className={`timeline-item timeline-${hour.riskLevel}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="timeline-time">{hour.time}</div>
                                <div className="timeline-bar-container">
                                    <div
                                        className="timeline-bar"
                                        style={{ height: `${hour.probability}%` }}
                                    />
                                </div>
                                <div className="timeline-percent">{hour.probability}%</div>
                                {hour.riskLevel === 'danger' && (
                                    <div className="timeline-danger-badge">!</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <div className="page-actions">
                    <button
                        className={`btn btn-lg btn-block ${hasDanger ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => navigate('/shelters')}
                    >
                        {hasDanger ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <span>Navigate to Shelter Now</span>
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                </svg>
                                <span>View Nearby Shelters</span>
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}
