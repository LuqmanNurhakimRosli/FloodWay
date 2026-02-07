// Navigation Page - Full screen map with animated route
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../store';
import { SHELTERS } from '../data/locations';
import { calculateRoute } from '../utils/pathfinding';
import 'leaflet/dist/leaflet.css';

// User marker - animated pulsing
const createUserIcon = () => new L.DivIcon({
    className: 'nav-user-icon',
    html: `
        <div style="position: relative; width: 36px; height: 36px;">
            <div style="
                position: absolute;
                inset: 0;
                background: rgba(16, 185, 129, 0.4);
                border-radius: 50%;
                animation: navPulse 1.5s ease-out infinite;
            "></div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #10B981, #059669);
                border: 4px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
            "></div>
        </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

// Destination marker
const createDestinationIcon = () => new L.DivIcon({
    className: 'nav-dest-icon',
    html: `
        <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #EF4444, #DC2626);
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 6px 25px rgba(239, 68, 68, 0.5);
                border: 4px solid white;
            ">
                <span style="transform: rotate(45deg); font-size: 22px;">🏥</span>
            </div>
        </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
});

// Map controller - follows user position
function FollowUser({ position }: { position: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom(), { animate: true, duration: 0.8 });
        }
    }, [map, position]);

    return null;
}

// Fit route on initial load
function FitRoute({ path }: { path: [number, number][] }) {
    const map = useMap();
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current && path.length > 1) {
            const bounds = L.latLngBounds(path);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            hasInitialized.current = true;
        }
    }, [map, path]);

    return null;
}

export function NavigationPage() {
    const navigate = useNavigate();
    const { shelterId } = useParams();
    const { userPosition, clearNavigation } = useApp();

    const [progress, setProgress] = useState(0);
    const [isNavigating, setIsNavigating] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [isMapReady, setIsMapReady] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Create icons once
    const userIcon = useMemo(() => createUserIcon(), []);
    const destinationIcon = useMemo(() => createDestinationIcon(), []);

    // Find shelter and calculate route
    const shelter = SHELTERS.find(s => s.id === shelterId);
    const route = useMemo(() => {
        if (!shelter) return null;
        return calculateRoute(userPosition, shelter);
    }, [shelter, userPosition]);

    // Redirect if no shelter
    useEffect(() => {
        if (!shelter || !route) {
            navigate('/shelters');
        }
    }, [shelter, route, navigate]);

    // Navigation simulation - 2 second intervals, max 14 seconds (7 steps)
    useEffect(() => {
        if (!isNavigating || !route) return;

        const INTERVAL_MS = 2000;
        const TOTAL_STEPS = 7;
        const PROGRESS_PER_STEP = 1 / TOTAL_STEPS;

        intervalRef.current = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + PROGRESS_PER_STEP;
                if (newProgress >= 1) {
                    setIsNavigating(false);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 1;
                }
                return newProgress;
            });

            setCurrentStep(prev => Math.min(prev + 1, (route?.steps.length || 1) - 1));
        }, INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isNavigating, route]);

    const handleCancel = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearNavigation();
        navigate('/shelters');
    }, [clearNavigation, navigate]);

    const handleArrived = useCallback(() => {
        clearNavigation();
        navigate('/prediction');
    }, [clearNavigation, navigate]);

    if (!shelter || !route) return null;

    // Calculate animated position along route
    const getCurrentPosition = (): [number, number] => {
        const pathLength = route.path.length;
        if (pathLength < 2) return [userPosition.lat, userPosition.lng];

        const exactIndex = progress * (pathLength - 1);
        const currentIndex = Math.floor(exactIndex);
        const nextIndex = Math.min(currentIndex + 1, pathLength - 1);
        const localProgress = exactIndex - currentIndex;

        const current = route.path[currentIndex];
        const next = route.path[nextIndex];

        return [
            current.lat + (next.lat - current.lat) * localProgress,
            current.lng + (next.lng - current.lng) * localProgress
        ];
    };

    const currentPosition = getCurrentPosition();
    const currentInstruction = route.steps[currentStep] || route.steps[0];
    const remainingTime = Math.max(0, Math.ceil(route.estimatedTime * (1 - progress)));
    const remainingDistance = Math.max(0, Math.round(route.distance * (1 - progress) * 10) / 10);
    const hasArrived = progress >= 1;

    // Route paths for polylines
    const fullPath: [number, number][] = route.path.map(p => [p.lat, p.lng]);
    const completedIndex = Math.floor(progress * route.path.length);
    const completedPath: [number, number][] = route.path.slice(0, completedIndex + 1).map(p => [p.lat, p.lng]);
    completedPath.push(currentPosition);

    // Get direction icon
    const getDirectionIcon = () => {
        const instr = currentInstruction.instruction.toLowerCase();
        if (instr.includes('north')) return '↑';
        if (instr.includes('south')) return '↓';
        if (instr.includes('east')) return '→';
        if (instr.includes('west')) return '←';
        return '•';
    };

    return (
        <div className="nav-page-v2">
            {/* FULL SCREEN MAP - This is the key fix for mobile */}
            <div className="nav-map-fullscreen">
                <MapContainer
                    center={[userPosition.lat, userPosition.lng]}
                    zoom={13}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                    whenReady={() => setIsMapReady(true)}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution=""
                    />

                    {/* Full route - blue dashed */}
                    <Polyline
                        positions={fullPath}
                        pathOptions={{
                            color: '#3B82F6',
                            weight: 6,
                            opacity: 0.5,
                            dashArray: '12, 16'
                        }}
                    />

                    {/* Completed path - green solid */}
                    {completedPath.length > 1 && (
                        <Polyline
                            positions={completedPath}
                            pathOptions={{
                                color: '#10B981',
                                weight: 7,
                                opacity: 1,
                                lineCap: 'round'
                            }}
                        />
                    )}

                    {/* Destination */}
                    <Marker position={[shelter.position.lat, shelter.position.lng]} icon={destinationIcon} />

                    {/* User position - animated */}
                    <Marker position={currentPosition} icon={userIcon} />

                    {/* Fit route initially, then follow user */}
                    <FitRoute path={fullPath} />
                    {isMapReady && isNavigating && <FollowUser position={currentPosition} />}
                </MapContainer>
            </div>

            {/* Header overlay - on top of map */}
            <div className="nav-header-floating">
                <button className="nav-close-btn" onClick={handleCancel}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className="nav-header-info">
                    <span className="nav-to-label">Navigating to</span>
                    <span className="nav-to-name">{shelter.name}</span>
                </div>

                <div className="nav-eta-pill">
                    <span className="eta-num">{remainingTime}</span>
                    <span className="eta-min">MIN</span>
                </div>
            </div>

            {/* Stats pill overlay - center top of map */}
            <div className="nav-stats-pill">
                <div className="stats-item">
                    <span className="stats-value">{remainingDistance}</span>
                    <span className="stats-label">KM LEFT</span>
                </div>
                <div className="stats-divider"></div>
                <div className="stats-item">
                    <span className="stats-value">{Math.round(progress * 100)}</span>
                    <span className="stats-label">% DONE</span>
                </div>
            </div>

            {/* Bottom instruction panel */}
            <div className="nav-instruction-panel">
                {/* Progress bar */}
                <div className="instruction-progress">
                    <div className="progress-fill" style={{ width: `${progress * 100}%` }}></div>
                </div>

                {hasArrived ? (
                    <div className="arrived-box">
                        <div className="arrived-icon-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        </div>
                        <div className="arrived-text">
                            <h2>You've Arrived!</h2>
                            <p>{shelter.name}</p>
                        </div>
                        <button className="safe-btn" onClick={handleArrived}>
                            I'm Safe
                        </button>
                    </div>
                ) : (
                    <div className="direction-box">
                        <div className="direction-icon-box">
                            {getDirectionIcon()}
                        </div>
                        <div className="direction-text">
                            <h3>{currentInstruction.instruction}</h3>
                            <p>Step {currentStep + 1} of {route.steps.length}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Critical CSS for map display */}
            <style>{`
                @keyframes navPulse {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
                
                .nav-user-icon, .nav-dest-icon {
                    background: transparent !important;
                    border: none !important;
                }
                
                .leaflet-container {
                    background: #1E293B !important;
                }
                
                .leaflet-control-attribution {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
