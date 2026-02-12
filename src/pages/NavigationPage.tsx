// Navigation Page - Full screen map with animated route using shadcn/Tailwind
// Uses real OSRM road routing - async route loading
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../store';
import { SHELTERS } from '../data/locations';
import { calculateRoute } from '../utils/pathfinding';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Check, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, Car, Bike, Footprints, Loader2, ShieldAlert } from 'lucide-react';
import type { Route, TransportMode } from '../types/app';
import { FloodZoneLayer } from '../components/FloodZoneLayer';
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

// Transport mode icon
function TransportModeIcon({ mode }: { mode: TransportMode }) {
    switch (mode) {
        case 'car': return <Car className="size-3.5" />;
        case 'motorcycle': return <Bike className="size-3.5" />;
        case 'walk': return <Footprints className="size-3.5" />;
    }
}

function TransportModeLabel({ mode }: { mode: TransportMode }) {
    switch (mode) {
        case 'car': return 'Driving';
        case 'motorcycle': return 'Riding';
        case 'walk': return 'Walking';
    }
}

export function NavigationPage() {
    const navigate = useNavigate();
    const { shelterId } = useParams();
    const { userPosition, clearNavigation, route: contextRoute, transportMode, isRouteLoading } = useApp();

    const [localRoute, setLocalRoute] = useState<Route | null>(null);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isMapReady, setIsMapReady] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Create icons once
    const userIcon = useMemo(() => createUserIcon(), []);
    const destinationIcon = useMemo(() => createDestinationIcon(), []);

    // Find shelter
    const shelter = SHELTERS.find(s => s.id === shelterId);

    // Use route from context if available, otherwise load it
    const route = contextRoute || localRoute;

    // Load route if not available from context
    useEffect(() => {
        if (!shelter) return;
        if (contextRoute) {
            // Route already loaded from context (ShelterPage pre-loaded it)
            setIsNavigating(true);
            return;
        }

        // Calculate route async
        let cancelled = false;
        setIsLoadingRoute(true);

        calculateRoute(userPosition, shelter, transportMode).then(r => {
            if (!cancelled) {
                setLocalRoute(r);
                setIsLoadingRoute(false);
                setIsNavigating(true);
            }
        }).catch(err => {
            console.error('Route calculation failed:', err);
            if (!cancelled) {
                setIsLoadingRoute(false);
                navigate('/shelters');
            }
        });

        return () => { cancelled = true; };
    }, [shelter, contextRoute, userPosition, transportMode, navigate]);

    // Start navigation when route loaded from context
    useEffect(() => {
        if (contextRoute && !isNavigating) {
            setIsNavigating(true);
        }
    }, [contextRoute, isNavigating]);

    // Redirect if no shelter
    useEffect(() => {
        if (!shelter) {
            navigate('/shelters');
        }
    }, [shelter, navigate]);

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

    // Loading state
    if (!shelter) return null;

    if (isLoadingRoute || isRouteLoading || !route) {
        return (
            <div className="h-dvh flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="size-12 animate-spin text-emerald-500" />
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-1">Calculating Route</h2>
                    <p className="text-sm text-muted-foreground">Finding the best road to {shelter.name}...</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <TransportModeIcon mode={transportMode} />
                        <span className="text-xs text-muted-foreground"><TransportModeLabel mode={transportMode} /></span>
                    </div>
                </div>
                <Button variant="ghost" className="mt-4 text-muted-foreground" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
        );
    }

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

    const remainingPath: [number, number][] = [currentPosition, ...(route.path.slice(completedIndex + 1).map(p => [p.lat, p.lng]) as [number, number][])];

    // Get direction icon
    const getDirectionIcon = () => {
        const instr = currentInstruction.instruction.toLowerCase();
        if (instr.includes('left')) return <ArrowLeftIcon className="size-8" />;
        if (instr.includes('right')) return <ArrowRightIcon className="size-8" />;
        if (instr.includes('north') || instr.includes('straight') || instr.includes('continue')) return <ArrowUp className="size-8" />;
        if (instr.includes('south')) return <ArrowDown className="size-8" />;
        if (instr.includes('east')) return <ArrowRightIcon className="size-8" />;
        if (instr.includes('west')) return <ArrowLeftIcon className="size-8" />;
        return <ArrowUp className="size-8" />;
    };

    return (
        <div className="h-dvh relative overflow-hidden bg-background">
            {/* FULL SCREEN MAP */}
            <div className="absolute inset-0 z-0">
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

                    <FloodZoneLayer />

                    {/* Full route - blue dashed */}
                    <Polyline
                        positions={fullPath}
                        pathOptions={{
                            color: route.isSafe ? '#3B82F6' : '#EF4444',
                            weight: 6,
                            opacity: 0.5,
                            dashArray: '12, 16'
                        }}
                    />

                    {/* Completed path - green solid (or red if unsafe) */}
                    {completedPath.length > 1 && (
                        <Polyline
                            positions={completedPath}
                            pathOptions={{
                                color: route.isSafe ? '#10B981' : '#EF4444',
                                weight: 7,
                                opacity: 1,
                                lineCap: 'round'
                            }}
                        />
                    )}

                    {/* Remaining path - same logic */}
                    {remainingPath.length > 1 && (
                        <Polyline
                            positions={remainingPath}
                            pathOptions={{
                                color: route.isSafe ? '#10B981' : '#EF4444',
                                weight: 7,
                                opacity: 0.8,
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

            {/* Header overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 p-4 pt-[calc(0.875rem+var(--safe-top))] bg-gradient-to-b from-slate-900/[0.98] via-slate-900/85 to-transparent">
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                    onClick={handleCancel}
                >
                    <X className="size-4" />
                </Button>

                <div className="flex-1 min-w-0">
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">Navigating to</span>
                    <span className="block text-sm font-semibold truncate leading-tight">{shelter.name}</span>
                    {route.isSafe ? (
                        <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-tighter mt-0.5">
                            <Check className="size-2.5" /> Bypassing Flood Zones
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[9px] text-amber-400 font-bold uppercase tracking-tighter mt-0.5 animate-pulse">
                            <ShieldAlert className="size-2.5" /> Route Intersects Flood Zone
                        </span>
                    )}
                </div>

                <div className="flex flex-col items-center px-4 py-2 bg-emerald-500 rounded-xl min-w-[54px]">
                    <span className="text-xl font-bold leading-none">{remainingTime}</span>
                    <span className="text-[10px] uppercase opacity-90">MIN</span>
                </div>
            </div>

            {/* Stats pill with transport mode */}
            <div className="absolute top-[calc(75px+var(--safe-top))] left-1/2 -translate-x-1/2 z-10 flex items-center bg-slate-800/95 backdrop-blur-xl rounded-full px-6 py-2.5 shadow-lg border border-white/5">
                {/* Transport mode badge */}
                <div className="flex items-center gap-1.5 px-3 text-emerald-400">
                    <TransportModeIcon mode={route.transportMode || transportMode} />
                    <span className="text-[10px] uppercase font-semibold">
                        <TransportModeLabel mode={route.transportMode || transportMode} />
                    </span>
                </div>
                <div className="w-px h-7 bg-border" />
                <div className="flex flex-col items-center px-3.5">
                    <span className="text-xl font-bold leading-none">{remainingDistance}</span>
                    <span className="text-[10px] text-muted-foreground uppercase mt-0.5">KM LEFT</span>
                </div>
                <div className="w-px h-7 bg-border" />
                <div className="flex flex-col items-center px-3.5">
                    <span className="text-xl font-bold leading-none">{Math.round(progress * 100)}</span>
                    <span className="text-[10px] text-muted-foreground uppercase mt-0.5">% DONE</span>
                </div>
            </div>

            {/* Bottom instruction panel */}
            <Card className="absolute bottom-0 left-0 right-0 z-10 rounded-t-3xl rounded-b-none shadow-2xl border-t border-white/5 border-b-0 md:max-w-md md:left-auto md:right-6 md:bottom-6 md:rounded-3xl md:border">
                <Progress value={progress * 100} className="h-1.5 rounded-none md:rounded-t-3xl" />

                <CardContent className="p-0">
                    {hasArrived ? (
                        <div className="flex flex-col items-center p-7 pb-[calc(1.75rem+var(--safe-bottom))] text-center">
                            <div className="size-18 flex items-center justify-center bg-emerald-500 rounded-full text-white mb-4 animate-pop-in">
                                <Check className="size-9" strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-bold mb-1">You've Arrived!</h2>
                            <p className="text-muted-foreground mb-5">{shelter.name}</p>
                            <Button
                                className="px-10 h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/40"
                                onClick={handleArrived}
                            >
                                I'm Safe
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-5 pb-[calc(1.375rem+var(--safe-bottom))]">
                            <div className="size-15 flex items-center justify-center bg-emerald-500 rounded-2xl text-white font-bold shrink-0">
                                {getDirectionIcon()}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">{currentInstruction.instruction}</h3>
                                <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {route.steps.length}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
