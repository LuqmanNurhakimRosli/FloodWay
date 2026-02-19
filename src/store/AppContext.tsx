// Global app store using React Context for state management
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Location, Shelter, DailyPrediction, Route, Coordinates, TransportMode } from '../types/app';
import type { FloodReport, HumanReview } from '../types/report';
import { DEFAULT_POSITION } from '../data/locations';
import { generateDailyPrediction } from '../utils/predictionGenerator';
import { calculateRoute } from '../utils/pathfinding';

interface AppState {
    selectedLocation: Location | null;
    prediction: DailyPrediction | null;
    selectedShelter: Shelter | null;
    route: Route | null;
    userPosition: Coordinates;
    transportMode: TransportMode;
    isRouteLoading: boolean;
    // Flood reports from Community Sentinel
    floodReports: FloodReport[];
}

interface AppContextType extends AppState {
    setLocation: (location: Location) => void;
    setShelter: (shelter: Shelter) => void;
    setTransportMode: (mode: TransportMode) => void;
    navigateToShelter: (shelter: Shelter, mode: TransportMode) => Promise<void>;
    clearNavigation: () => void;
    reset: () => void;
    // Flood report actions
    addFloodReport: (report: FloodReport) => void;
    clearFloodReports: () => void;
    // Human review actions
    updateHumanReview: (reportId: string, review: HumanReview) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>({
        selectedLocation: null,
        prediction: null,
        selectedShelter: null,
        route: null,
        userPosition: DEFAULT_POSITION,
        transportMode: 'car',
        isRouteLoading: false,
        floodReports: [],
    });

    const setLocation = useCallback((location: Location) => {
        const prediction = generateDailyPrediction(true); // Simulate danger for demo
        setState(prev => ({
            ...prev,
            selectedLocation: location,
            prediction,
        }));
    }, []);

    const setShelter = useCallback((shelter: Shelter) => {
        setState(prev => ({
            ...prev,
            selectedShelter: shelter,
        }));
    }, []);

    const setTransportMode = useCallback((mode: TransportMode) => {
        setState(prev => ({
            ...prev,
            transportMode: mode,
        }));
    }, []);

    // Async navigation: fetches real road route from OSRM
    const navigateToShelter = useCallback(async (shelter: Shelter, mode: TransportMode) => {
        setState(prev => ({
            ...prev,
            selectedShelter: shelter,
            transportMode: mode,
            isRouteLoading: true,
            route: null,
        }));

        try {
            const route = await calculateRoute(state.userPosition, shelter, mode, state.prediction);
            setState(prev => ({
                ...prev,
                route,
                isRouteLoading: false,
            }));
        } catch (error) {
            console.error('Route calculation failed:', error);
            setState(prev => ({
                ...prev,
                isRouteLoading: false,
            }));
        }
    }, [state.userPosition]);

    const clearNavigation = useCallback(() => {
        setState(prev => ({
            ...prev,
            selectedShelter: null,
            route: null,
            isRouteLoading: false,
        }));
    }, []);

    // Flood report actions
    const addFloodReport = useCallback((report: FloodReport) => {
        console.log('📌 [Store] Adding flood report:', {
            id: report.id,
            lat: report.autoTags.lat,
            lng: report.autoTags.lng,
            waterDetected: report.aiResult?.waterDetected,
            confidence: report.aiResult?.confidence,
        });
        setState(prev => ({
            ...prev,
            floodReports: [report, ...prev.floodReports],
        }));
    }, []);

    const clearFloodReports = useCallback(() => {
        setState(prev => ({
            ...prev,
            floodReports: [],
        }));
    }, []);

    // Human review: moderator approves/rejects a report
    const updateHumanReview = useCallback((reportId: string, review: HumanReview) => {
        console.log('👤 [Moderator] Review updated:', { reportId, review });
        setState(prev => ({
            ...prev,
            floodReports: prev.floodReports.map(r =>
                r.id === reportId ? { ...r, humanReview: review } : r
            ),
        }));
    }, []);

    const reset = useCallback(() => {
        setState({
            selectedLocation: null,
            prediction: null,
            selectedShelter: null,
            route: null,
            userPosition: DEFAULT_POSITION,
            transportMode: 'car',
            isRouteLoading: false,
            floodReports: [],
        });
    }, []);

    return (
        <AppContext.Provider
            value={{
                ...state,
                setLocation,
                setShelter,
                setTransportMode,
                navigateToShelter,
                clearNavigation,
                reset,
                addFloodReport,
                clearFloodReports,
                updateHumanReview,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
