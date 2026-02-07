// Welcome Page - Professional landing screen
import { useNavigate } from 'react-router-dom';

export function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div className="page welcome-page">
            {/* Background Effects */}
            <div className="welcome-bg">
                <div className="gradient-orb orb-1" />
                <div className="gradient-orb orb-2" />
                <div className="gradient-orb orb-3" />
            </div>

            {/* Content */}
            <div className="welcome-content">
                {/* Logo */}
                <div className="logo-container">
                    <div className="logo-ring">
                        <div className="logo-icon">
                            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Water drop shape */}
                                <defs>
                                    <linearGradient id="dropGradient" x1="20" y1="10" x2="60" y2="70" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#60A5FA" />
                                        <stop offset="0.5" stopColor="#3B82F6" />
                                        <stop offset="1" stopColor="#2563EB" />
                                    </linearGradient>
                                    <linearGradient id="shineGradient" x1="30" y1="20" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="rgba(255,255,255,0.4)" />
                                        <stop offset="1" stopColor="rgba(255,255,255,0)" />
                                    </linearGradient>
                                </defs>

                                {/* Main drop */}
                                <path
                                    d="M40 8C40 8 16 35 16 50C16 63.255 26.745 74 40 74C53.255 74 64 63.255 64 50C64 35 40 8 40 8Z"
                                    fill="url(#dropGradient)"
                                />

                                {/* Shine effect */}
                                <path
                                    d="M40 16C40 16 26 34 26 46C26 53.732 32.268 60 40 60C47.732 60 54 53.732 54 46C54 34 40 16 40 16Z"
                                    fill="url(#shineGradient)"
                                />

                                {/* Inner highlight */}
                                <ellipse cx="32" cy="42" rx="6" ry="8" fill="rgba(255,255,255,0.25)" />

                                {/* Waves at bottom of drop */}
                                <path
                                    d="M24 54C28 52 32 54 36 52C40 50 44 52 48 54C52 52 56 54 56 54"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            </svg>
                        </div>
                    </div>
                    <h1 className="logo-text">FloodWay</h1>
                    <p className="logo-tagline">AI-Powered Flood Preparedness System</p>
                </div>

                {/* Features */}
                <div className="features-grid">
                    <div className="feature-item">
                        <div className="feature-icon">📊</div>
                        <div className="feature-text">
                            <strong>24-Hour Forecast</strong>
                            <span>Real-time flood predictions</span>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🚨</div>
                        <div className="feature-text">
                            <strong>Smart Alerts</strong>
                            <span>Danger notifications</span>
                        </div>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🗺️</div>
                        <div className="feature-text">
                            <strong>GPS Navigation</strong>
                            <span>Route to nearest shelter</span>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/location')}
                >
                    <span>Get Started</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Footer */}
                <div className="welcome-footer">
                    <p>Prototype v1.0 • Kuala Lumpur Region</p>
                    <p className="powered-by">Powered by AI Flood Detection Model</p>
                </div>
            </div>
        </div>
    );
}
