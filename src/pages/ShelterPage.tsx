// Shelter Selection Page - Professional redesign with better UX
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../store';
import { getSheltersWithDistance } from '../data/locations';
import type { Shelter } from '../types/app';
import 'leaflet/dist/leaflet.css';

// Custom user icon
const createUserIcon = () => new L.DivIcon({
    className: 'map-user-icon',
    html: `
        <div class="user-marker-container">
            <div class="user-marker-pulse"></div>
            <div class="user-marker-dot"></div>
        </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

// Shelter icon with selection state
const createShelterIcon = (isSelected: boolean) => new L.DivIcon({
    className: 'map-shelter-icon',
    html: `
        <div class="shelter-marker ${isSelected ? 'selected' : ''}">
            <div class="shelter-marker-pin">
                <span>🏥</span>
            </div>
            ${isSelected ? '<div class="shelter-marker-ring"></div>' : ''}
        </div>
    `,
    iconSize: [isSelected ? 56 : 44, isSelected ? 64 : 52],
    iconAnchor: [isSelected ? 28 : 22, isSelected ? 56 : 44],
});

// Map controller
function MapController({ center, shouldAnimate }: { center: [number, number] | null, shouldAnimate: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (center && shouldAnimate) {
            map.flyTo(center, 14, { duration: 0.6 });
        }
    }, [map, center, shouldAnimate]);

    return null;
}

// Bounds fitter
function FitBounds({ positions }: { positions: [number, number][] }) {
    const map = useMap();
    const hasFitted = useMemo(() => ({ current: false }), []);

    useEffect(() => {
        if (!hasFitted.current && positions.length > 1) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
            hasFitted.current = true;
        }
    }, [map, positions, hasFitted]);

    return null;
}

export function ShelterPage() {
    const navigate = useNavigate();
    const { userPosition, selectedLocation, setShelter } = useApp();
    const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
    const [animateToShelter, setAnimateToShelter] = useState(false);

    useEffect(() => {
        if (!selectedLocation) {
            navigate('/location');
        }
    }, [selectedLocation, navigate]);

    const shelters = useMemo(() => getSheltersWithDistance(userPosition), [userPosition]);
    const userIcon = useMemo(() => createUserIcon(), []);
    const selectedShelter = shelters.find(s => s.id === selectedShelterId);

    // All positions for initial bounds
    const allPositions: [number, number][] = useMemo(() => [
        [userPosition.lat, userPosition.lng],
        ...shelters.map(s => [s.position.lat, s.position.lng] as [number, number])
    ], [userPosition, shelters]);

    const handleShelterClick = useCallback((shelter: Shelter) => {
        setSelectedShelterId(shelter.id);
        setAnimateToShelter(true);
    }, []);

    const handleClose = useCallback(() => {
        setSelectedShelterId(null);
        setAnimateToShelter(false);
    }, []);

    const handleNavigate = useCallback(() => {
        if (selectedShelter) {
            setShelter(selectedShelter);
            navigate(`/navigation/${selectedShelter.id}`);
        }
    }, [selectedShelter, setShelter, navigate]);

    const mapCenter: [number, number] | null = selectedShelter
        ? [selectedShelter.position.lat, selectedShelter.position.lng]
        : null;

    const routePreview: [number, number][] = selectedShelter
        ? [[userPosition.lat, userPosition.lng], [selectedShelter.position.lat, selectedShelter.position.lng]]
        : [];

    if (!selectedLocation) return null;

    return (
        <div className="shelter-v3">
            {/* Map */}
            <div className="shelter-v3-map">
                <MapContainer
                    center={[userPosition.lat, userPosition.lng]}
                    zoom={11}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon} />

                    {selectedShelter && (
                        <Polyline
                            positions={routePreview}
                            pathOptions={{
                                color: '#10B981',
                                weight: 4,
                                dashArray: '10, 15',
                                opacity: 0.9
                            }}
                        />
                    )}

                    {shelters.map((shelter) => (
                        <Marker
                            key={shelter.id}
                            position={[shelter.position.lat, shelter.position.lng]}
                            icon={createShelterIcon(shelter.id === selectedShelterId)}
                            eventHandlers={{ click: () => handleShelterClick(shelter) }}
                        />
                    ))}

                    <FitBounds positions={allPositions} />
                    <MapController center={mapCenter} shouldAnimate={animateToShelter} />
                </MapContainer>
            </div>

            {/* Header */}
            <header className="shelter-v3-header">
                <button className="shelter-v3-back" onClick={() => navigate('/prediction')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="shelter-v3-title">
                    <h1>Emergency Shelters</h1>
                    <span>{shelters.length} locations nearby</span>
                </div>
                <div className="shelter-v3-legend">
                    <div className="legend-dot you"></div>
                    <span>You</span>
                </div>
            </header>

            {/* Bottom Panel */}
            <div className={`shelter-v3-panel ${selectedShelter ? 'has-selection' : ''}`}>
                {selectedShelter ? (
                    <div className="shelter-v3-detail">
                        <div className="detail-header">
                            <div className="detail-icon">
                                <span>🏥</span>
                            </div>
                            <div className="detail-info">
                                <h2>{selectedShelter.name}</h2>
                                <div className="detail-meta">
                                    <span className="meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {selectedShelter.distance} km
                                    </span>
                                    <span className="meta-divider">•</span>
                                    <span className="meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                        </svg>
                                        ~{selectedShelter.estimatedTime} min
                                    </span>
                                </div>
                            </div>
                            <button className="detail-close" onClick={handleClose}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <button className="detail-navigate" onClick={handleNavigate}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="3 11 22 2 13 21 11 13 3 11" />
                            </svg>
                            Start Navigation
                        </button>
                    </div>
                ) : (
                    <div className="shelter-v3-list">
                        <div className="list-handle"></div>
                        <div className="list-header">
                            <h3>Nearby Shelters</h3>
                            <span>Tap to preview</span>
                        </div>
                        <div className="list-items">
                            {shelters.map((shelter, i) => (
                                <button
                                    key={shelter.id}
                                    className={`list-item ${i === 0 ? 'recommended' : ''}`}
                                    onClick={() => handleShelterClick(shelter)}
                                >
                                    <div className="item-rank" data-rank={i + 1}>
                                        {i === 0 && <span className="rank-star">★</span>}
                                        {i + 1}
                                    </div>
                                    <div className="item-content">
                                        <h4>{shelter.name}</h4>
                                        <div className="item-stats">
                                            <span>{shelter.distance} km</span>
                                            <span>~{shelter.estimatedTime} min</span>
                                        </div>
                                    </div>
                                    <div className="item-arrow">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Critical CSS for markers */}
            <style>{`
                .map-user-icon, .map-shelter-icon {
                    background: transparent !important;
                    border: none !important;
                }
                
                .user-marker-container {
                    position: relative;
                    width: 24px;
                    height: 24px;
                }
                
                .user-marker-pulse {
                    position: absolute;
                    inset: 0;
                    background: rgba(59, 130, 246, 0.4);
                    border-radius: 50%;
                    animation: markerPulse 2s ease-out infinite;
                }
                
                .user-marker-dot {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 14px;
                    height: 14px;
                    background: #3B82F6;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                
                .shelter-marker {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transition: transform 0.2s;
                }
                
                .shelter-marker.selected {
                    transform: scale(1.1);
                }
                
                .shelter-marker-pin {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #8B5CF6, #6366F1);
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                    border: 3px solid white;
                }
                
                .shelter-marker.selected .shelter-marker-pin {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #10B981, #059669);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
                }
                
                .shelter-marker-pin span {
                    transform: rotate(45deg);
                    font-size: 18px;
                }
                
                .shelter-marker.selected .shelter-marker-pin span {
                    font-size: 22px;
                }
                
                .shelter-marker-ring {
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 64px;
                    height: 64px;
                    border: 3px solid #10B981;
                    border-radius: 50%;
                    animation: ringPulse 1.5s ease-out infinite;
                }
                
                @keyframes markerPulse {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                
                @keyframes ringPulse {
                    0% { transform: translateX(-50%) scale(0.8); opacity: 1; }
                    100% { transform: translateX(-50%) scale(1.5); opacity: 0; }
                }
                
                .leaflet-container {
                    background: #1E293B !important;
                }
            `}</style>
        </div>
    );
}
