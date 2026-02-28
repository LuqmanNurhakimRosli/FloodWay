// Shelter Selection Page with shadcn/Tailwind - includes transport mode selection
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../store';
import { getSheltersWithDistance, LOCATIONS } from '../data/locations';
import type { Shelter, TransportMode } from '../types/app';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Clock, X, Navigation, ChevronRight, ChevronLeft, Star, Shield, Car, Bike, Footprints, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import { ForecastOverlay } from '../components/ForecastOverlay';
import { FloodZoneLayer } from '../components/FloodZoneLayer';
import { FloodTimelineScrubber } from '../components/FloodTimelineScrubber';
import { FloodReportLayer } from '../components/FloodReportLayer';

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

// Transport mode config
const TRANSPORT_MODES: { mode: TransportMode; label: string; icon: typeof Car; speed: string }[] = [
    { mode: 'car', label: 'Car', icon: Car, speed: '~50 km/h' },
    { mode: 'motorcycle', label: 'Motor', icon: Bike, speed: '~45 km/h' },
    { mode: 'walk', label: 'Walk', icon: Footprints, speed: '~5 km/h' },
];

export function ShelterPage() {
    const navigate = useNavigate();
    const { userPosition, selectedLocation, prediction, setShelter, navigateToShelter, transportMode, setTransportMode, isRouteLoading, setLocation } = useApp();
    const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
    const [animateToShelter, setAnimateToShelter] = useState(false);
    const [selectedMode, setSelectedMode] = useState<TransportMode>(transportMode);
    const [selectedHourIndex, setSelectedHourIndex] = useState(0);
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [showAlert, setShowAlert] = useState(false);

    // Flood Alert Detection Logic
    useEffect(() => {
        if (prediction && prediction.hourlyPredictions.length > 1) {
            const nextHourRisk = prediction.hourlyPredictions[1].riskLevel;
            const currentHourRisk = prediction.hourlyPredictions[0].riskLevel;

            // Trigger if current is safe and next is not, or risk level increases
            if (currentHourRisk === 'safe' && (nextHourRisk === 'warning' || nextHourRisk === 'danger')) {
                setShowAlert(true);

                // Auto-hide after 10 seconds
                const timer = setTimeout(() => {
                    setShowAlert(false);
                }, 10000);

                return () => clearTimeout(timer);
            }
        }
    }, [prediction]);

    // Auto-select Kuala Lumpur if no location is set (e.g. page refresh)
    useEffect(() => {
        if (!selectedLocation) {
            const defaultLoc = LOCATIONS.find(l => l.id === 'kuala-lumpur') || LOCATIONS[0];
            setLocation(defaultLoc);
        }
    }, [selectedLocation, setLocation]);

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

    const handleNavigate = useCallback(async () => {
        if (selectedShelter) {
            setShelter(selectedShelter);
            setTransportMode(selectedMode);
            await navigateToShelter(selectedShelter, selectedMode);
            navigate(`/navigation/${selectedShelter.id}`);
        }
    }, [selectedShelter, selectedMode, setShelter, setTransportMode, navigateToShelter, navigate]);

    const mapCenter: [number, number] | null = selectedShelter
        ? [selectedShelter.position.lat, selectedShelter.position.lng]
        : null;

    const routePreview: [number, number][] = selectedShelter
        ? [[userPosition.lat, userPosition.lng], [selectedShelter.position.lat, selectedShelter.position.lng]]
        : [];

    // While auto-selecting location, show nothing briefly
    if (!selectedLocation || !prediction) return null;

    // Estimated time for selected mode
    const getEstimatedTimeForMode = (shelter: Shelter, mode: TransportMode) => {
        const dist = shelter.distance || 0;
        const speeds: Record<TransportMode, number> = { car: 50, motorcycle: 45, walk: 5 };
        return Math.max(1, Math.round((dist / speeds[mode]) * 60));
    };

    return (
        <div className="h-dvh relative overflow-hidden bg-background">
            {/* Map */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[userPosition.lat, userPosition.lng]}
                    zoom={11}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                >
                    {/* Forecast Overlays - driven by timeline selection */}
                    <FloodZoneLayer selectedHourIndex={selectedHourIndex} />

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

                    {/* Flood Report Markers from Community Sentinel */}
                    <FloodReportLayer />

                    <FitBounds positions={allPositions} />
                    <MapController center={mapCenter} shouldAnimate={animateToShelter} />
                </MapContainer>
            </div>

            {/* Top Center Flood Alert Notification */}
            {showAlert && prediction && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-top-4 duration-500 pointer-events-none">
                    <div className="bg-red-500/90 backdrop-blur-xl border border-red-400/30 rounded-2xl p-4 shadow-2xl shadow-red-900/40 flex items-center gap-4 pointer-events-auto">
                        <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <AlertTriangle className="size-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white leading-tight">Flood Warning</h3>
                            <p className="text-[10px] text-red-50 font-medium opacity-90">
                                Flood expected in 1 hour at {prediction.hourlyPredictions[1].time}. Please move to higher ground.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-white hover:bg-white/20 shrink-0"
                            onClick={() => setShowAlert(false)}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Side Panel / Bottom Sheet Layout */}
            <div className={cn(
                // Base: Hidden/Visible transition
                "fixed z-20 transition-all duration-500 ease-in-out pointer-events-none flex",
                // Mobile: Bottom Sheet — sits ABOVE the 64px bottom nav
                "inset-x-0 top-auto h-[45vh] md:h-full",
                // Desktop: Side Panel logic - fixed width, slides in/out
                "md:inset-y-0 md:left-0 md:right-auto md:w-[400px] md:top-0",
                isPanelVisible
                    ? "translate-y-0 md:translate-x-0"
                    : "translate-y-full md:-translate-x-full"
            )}
                style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
            >
                {/* Content Container */}
                <div className="w-full h-full bg-slate-900/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/10 rounded-t-[2.5rem] md:rounded-none flex flex-col pointer-events-auto shadow-2xl overflow-hidden">
                    {/* Drag Handle (Mobile Only) */}
                    <div className="md:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />

                    {/* Header */}
                    <header className="flex items-center gap-3.5 px-5 pb-4 md:p-5 border-b border-white/5">
                        <div className="flex-1">
                            <h1 className="text-lg md:text-xl font-bold tracking-tight">Emergency Shelters</h1>
                            <span className="text-[10px] md:text-xs text-muted-foreground">{shelters.length} locations nearby</span>
                        </div>
                        {/* Mobile Hide Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden size-10 rounded-xl"
                            onClick={() => setIsPanelVisible(false)}
                        >
                            <X className="size-5" />
                        </Button>
                    </header>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto overscroll-contain pb-6 md:pb-18 scrollbar-thin scrollbar-thumb-white/10">
                        {/* 1. Forecast Overlay Context */}
                        <div className="px-5 py-4 border-b border-white/5 bg-white/5">
                            <span className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-semibold">Flood Risk Forecast</span>
                            <ForecastOverlay selectedHourIndex={selectedHourIndex} />
                        </div>

                        {/* 2. Timeline Scrubber */}
                        <div className="px-5 py-6 border-b border-white/5">
                            <span className="block text-[10px] text-muted-foreground uppercase tracking-widest mb-4 font-semibold">Interactive Timeline</span>
                            <FloodTimelineScrubber
                                selectedHourIndex={selectedHourIndex}
                                onHourChange={setSelectedHourIndex}
                            />
                        </div>

                        {/* 3. Shelter List / Detail */}
                        <div className="px-5 py-5">
                            {selectedShelter ? (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-emerald-500">Selected Shelter</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 rounded-lg hover:bg-red-500/10 hover:text-red-500"
                                            onClick={handleClose}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="size-14 flex items-center justify-center bg-emerald-500/20 rounded-2xl text-2xl shrink-0 border border-emerald-500/20">🏥</div>
                                            <div className="flex-1 min-w-0">
                                                <h2 className="text-base font-bold mb-2 leading-tight">{selectedShelter.name}</h2>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                                                        <MapPin className="size-3" /> {selectedShelter.distance} km
                                                    </span>
                                                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                                                        <Clock className="size-3" /> ~{getEstimatedTimeForMode(selectedShelter, selectedMode)} min
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Travel Mode</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                {TRANSPORT_MODES.map(({ mode, label, icon: Icon }) => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => setSelectedMode(mode)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                                                            selectedMode === mode
                                                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                                                : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10"
                                                        )}
                                                    >
                                                        <Icon className="size-5" />
                                                        <span className="text-[10px] font-bold">{label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/40 border border-emerald-400/20"
                                        onClick={handleNavigate}
                                        disabled={isRouteLoading}
                                    >
                                        {isRouteLoading ? (
                                            <><Loader2 className="size-5 animate-spin mr-2" />Calculating...</>
                                        ) : (
                                            <><Navigation className="size-5 mr-2" />Start Navigation</>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
                                            <Shield className="size-3.5 text-emerald-500" />
                                            Available Shelters
                                        </span>
                                        <span className="text-[10px] font-bold py-0.5 px-2 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">
                                            {shelters.length} Total
                                        </span>
                                    </div>
                                    <div className="space-y-2.5">
                                        {shelters.map((shelter, i) => (
                                            <Card
                                                key={shelter.id}
                                                className={cn(
                                                    "cursor-pointer border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all",
                                                    i === 0 && "border-emerald-500/30 bg-emerald-500/5"
                                                )}
                                                onClick={() => handleShelterClick(shelter)}
                                            >
                                                <CardContent className="p-4 flex items-center gap-4">
                                                    <div className={cn(
                                                        "size-10 flex items-center justify-center rounded-xl text-xs font-black shrink-0 relative",
                                                        i === 0 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/50" : "bg-slate-800 text-slate-400"
                                                    )}>
                                                        {i === 0 && <Star className="absolute -top-1 -right-1 size-3 text-amber-400 fill-amber-400" />}
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-bold truncate mb-1">{shelter.name}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                                            <span>{shelter.distance} km</span>
                                                            <span className="opacity-40">•</span>
                                                            <span>~{shelter.estimatedTime} min</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="size-4 text-white/20" />
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Toggle Handle — OUTSIDE the panel so it's always visible */}
            <div
                className={cn(
                    "hidden md:flex fixed top-1/2 -translate-y-1/2 z-30",
                    "transition-all duration-500 ease-in-out",
                    isPanelVisible ? "left-[400px]" : "left-0"
                )}
            >
                <button
                    className="flex items-center justify-center bg-slate-900/95 backdrop-blur-xl border border-white/10 border-l-0 w-7 h-16 rounded-r-xl shadow-2xl hover:bg-slate-800 transition-colors group cursor-pointer"
                    onClick={() => setIsPanelVisible(!isPanelVisible)}
                    aria-label={isPanelVisible ? 'Close panel' : 'Open panel'}
                >
                    {isPanelVisible ? (
                        <ChevronLeft className="size-4 text-white/50 group-hover:text-white transition-colors" />
                    ) : (
                        <ChevronRight className="size-4 text-white/50 group-hover:text-white transition-colors" />
                    )}
                </button>
            </div>

            {/* Mobile Fab to Show Panel */}
            {!isPanelVisible && (
                <Button
                    className="fixed right-4 z-30 size-12 rounded-full bg-emerald-600 shadow-xl text-white animate-in zoom-in-50 duration-300 md:hidden"
                    style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 1rem)' }}
                    onClick={() => setIsPanelVisible(true)}
                >
                    <Shield className="size-6" />
                </Button>
            )}

            {/* Floating UI: Back Button (Top Left) */}
            <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 left-4 z-10 size-10 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-slate-800 text-white"
                onClick={() => navigate('/home')}
            >
                <ArrowLeft className="size-5" />
            </Button>

            {/* User Position Badge - Top Right (Visible on Desktop/Mobile) */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full text-[9px] md:text-[10px] font-bold text-white/80">
                <div className="size-1.5 md:size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span>ME (KLCC)</span>
            </div>
        </div>
    );
}
