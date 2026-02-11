// Shelter Selection Page with shadcn/Tailwind - includes transport mode selection
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../store';
import { getSheltersWithDistance } from '../data/locations';
import type { Shelter, TransportMode } from '../types/app';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Clock, X, Navigation, ChevronRight, Star, Shield, Car, Bike, Footprints, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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

// Transport mode config
const TRANSPORT_MODES: { mode: TransportMode; label: string; icon: typeof Car; speed: string }[] = [
    { mode: 'car', label: 'Car', icon: Car, speed: '~50 km/h' },
    { mode: 'motorcycle', label: 'Motor', icon: Bike, speed: '~45 km/h' },
    { mode: 'walk', label: 'Walk', icon: Footprints, speed: '~5 km/h' },
];

export function ShelterPage() {
    const navigate = useNavigate();
    const { userPosition, selectedLocation, setShelter, navigateToShelter, transportMode, setTransportMode, isRouteLoading } = useApp();
    const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
    const [animateToShelter, setAnimateToShelter] = useState(false);
    const [selectedMode, setSelectedMode] = useState<TransportMode>(transportMode);

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

    if (!selectedLocation) return null;

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
            <header className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3.5 p-4 pt-[calc(1rem+var(--safe-top))] bg-gradient-to-b from-slate-900/[0.98] via-slate-900/90 to-transparent">
                <Button
                    variant="secondary"
                    size="icon"
                    className="shrink-0 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-white/10 hover:bg-slate-700"
                    onClick={() => navigate('/prediction')}
                >
                    <ArrowLeft className="size-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">Emergency Shelters</h1>
                    <span className="text-xs text-muted-foreground">{shelters.length} locations nearby</span>
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/95 backdrop-blur-xl rounded-full text-xs text-muted-foreground">
                    <div className="size-2.5 rounded-full bg-primary" />
                    <span>You</span>
                </div>
            </header>

            {/* Bottom Panel */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-white/10 transition-all duration-300",
                selectedShelter ? "h-auto" : "h-[50vh] max-h-[400px]",
                "md:max-w-md md:left-auto md:right-6 md:bottom-6 md:rounded-3xl md:border md:h-auto md:max-h-[60vh]"
            )}>
                {selectedShelter ? (
                    // Selected Shelter Detail + Transport Mode Picker
                    <div className="p-6 pb-[calc(1.5rem+var(--safe-bottom))]">
                        {/* Shelter Info */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="size-16 flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl text-3xl shrink-0 border border-emerald-500/20">
                                🏥
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold mb-2 leading-snug">{selectedShelter.name}</h2>
                                <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                                        <MapPin className="size-3.5" />
                                        {selectedShelter.distance} km
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                                        <Clock className="size-3.5" />
                                        ~{getEstimatedTimeForMode(selectedShelter, selectedMode)} min
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 rounded-xl hover:bg-red-500/20 hover:text-red-500"
                                onClick={handleClose}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>

                        {/* Transport Mode Picker */}
                        <div className="mb-4">
                            <span className="block text-xs text-muted-foreground uppercase tracking-wider mb-2.5 font-medium">
                                Travel Mode
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                                {TRANSPORT_MODES.map(({ mode, label, icon: Icon, speed }) => (
                                    <button
                                        key={mode}
                                        onClick={() => setSelectedMode(mode)}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
                                            selectedMode === mode
                                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                                : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10"
                                        )}
                                    >
                                        <Icon className="size-5" />
                                        <span className="text-xs font-semibold">{label}</span>
                                        <span className="text-[10px] opacity-70">{speed}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navigate Button */}
                        <Button
                            className="w-full h-13 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/30"
                            onClick={handleNavigate}
                            disabled={isRouteLoading}
                        >
                            {isRouteLoading ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Calculating Route...
                                </>
                            ) : (
                                <>
                                    <Navigation className="size-5" />
                                    Start Navigation
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    // Shelter List View
                    <div className="flex flex-col h-full">
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-white/20 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex justify-between items-center px-5 pb-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Shield className="size-5 text-emerald-500" />
                                <h3 className="text-lg font-semibold">Nearby Shelters</h3>
                            </div>
                            <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">{shelters.length} found</span>
                        </div>

                        {/* Scrollable Shelter List */}
                        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-2.5" style={{ maxHeight: 'calc(50vh - 100px)' }}>
                            {shelters.map((shelter, i) => (
                                <Card
                                    key={shelter.id}
                                    className={cn(
                                        "group cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                                        i === 0
                                            ? "border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5"
                                            : "bg-card/80 hover:bg-muted/80 hover:border-primary/50"
                                    )}
                                    onClick={() => handleShelterClick(shelter)}
                                >
                                    <CardContent className="p-4 flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className={cn(
                                            "relative size-11 flex items-center justify-center rounded-xl text-sm font-bold shrink-0",
                                            i === 0
                                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                                : "bg-muted text-muted-foreground"
                                        )}>
                                            {i === 0 && (
                                                <Star className="absolute -top-1.5 -right-1.5 size-4 text-amber-400 fill-amber-400 drop-shadow" />
                                            )}
                                            {i + 1}
                                        </div>

                                        {/* Shelter Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold mb-1.5 truncate">{shelter.name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="size-3" />
                                                    {shelter.distance} km
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    ~{shelter.estimatedTime} min
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className={cn(
                                            "size-9 flex items-center justify-center rounded-xl transition-all shrink-0",
                                            i === 0
                                                ? "bg-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
                                                : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                                        )}>
                                            <ChevronRight className="size-4" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Safe bottom padding */}
                        <div className="h-[calc(var(--safe-bottom)+0.5rem)]" />
                    </div>
                )}
            </div>
        </div>
    );
}
