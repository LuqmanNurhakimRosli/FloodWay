// Location Selection Page
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { LOCATIONS } from '../data/locations';
import type { Location } from '../types/app';

export function LocationPage() {
    const navigate = useNavigate();
    const { setLocation } = useApp();

    const handleSelectLocation = (location: Location) => {
        setLocation(location);
        navigate('/prediction');
    };

    return (
        <div className="page location-page">
            {/* Header */}
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="header-content">
                    <h1>Select Location</h1>
                    <p>Choose your area for flood predictions</p>
                </div>
            </header>

            {/* Location Cards */}
            <main className="page-content">
                <div className="location-list">
                    {LOCATIONS.map((location, index) => (
                        <button
                            key={location.id}
                            className="location-card"
                            onClick={() => handleSelectLocation(location)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="location-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div className="location-info">
                                <h3>{location.name}</h3>
                                <span>{location.region}</span>
                            </div>
                            <div className="location-arrow">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Info Card */}
                <div className="info-card">
                    <div className="info-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                    </div>
                    <div className="info-text">
                        <p>Your location is used to provide accurate flood predictions and find nearby emergency shelters.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
