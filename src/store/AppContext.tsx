// Global app store using React Context for state management
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Location, Shelter, DailyPrediction, Route, Coordinates, TransportMode } from '../types/app';
import type { FloodReport, HumanReview } from '../types/report';
import { DEFAULT_POSITION } from '../data/locations';
import { generateDailyPrediction } from '../utils/predictionGenerator';
import { calculateRoute } from '../utils/pathfinding';
import { fetchReports, saveReport, updateReportHumanReview, deleteReport, INITIAL_REPORTS } from '../services/reportsService';

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
    deleteFloodReport: (reportId: string) => void;
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
        floodReports: INITIAL_REPORTS,  // instantly show 2 demo reports; Firestore replaces shortly after
    });

    // Fetch from Firestore in the background; replace state when ready.
    // fetchReports() handles all deduplication internally.
    useEffect(() => {
        let cancelled = false;
        fetchReports()
            .then(reports => {
                if (!cancelled) {
                    setState(prev => ({ ...prev, floodReports: reports }));
                }
            })
            .catch(err => console.error('[AppContext] Firestore load error:', err));
        return () => { cancelled = true; };
    }, []);


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
        // Optimistic local update
        setState(prev => ({
            ...prev,
            floodReports: [report, ...prev.floodReports],
        }));
        // Persist to Firestore (fire-and-forget)
        const { id: _id, ...withoutId } = report;
        saveReport(withoutId).catch(err =>
            console.error('Failed to save report to Firestore:', err),
        );
    }, []);

    const clearFloodReports = useCallback(() => {
        setState(prev => ({
            ...prev,
            floodReports: [],
        }));
    }, []);

    // Moderator: permanently delete a report
    const deleteFloodReport = useCallback((reportId: string) => {
        console.log('🗑️ [Moderator] Deleting report:', reportId);
        // Optimistic local removal
        setState(prev => ({
            ...prev,
            floodReports: prev.floodReports.filter(r => r.id !== reportId),
        }));
        // Persist deletion to Firestore (fire-and-forget)
        deleteReport(reportId).catch(err =>
            console.error('Failed to delete report from Firestore:', err),
        );
    }, []);

    // Human review: moderator approves/rejects a report
    const updateHumanReview = useCallback((reportId: string, review: HumanReview) => {
        console.log('👤 [Moderator] Review updated:', { reportId, review });
        // Optimistic local update
        setState(prev => ({
            ...prev,
            floodReports: prev.floodReports.map(r =>
                r.id === reportId ? { ...r, humanReview: review } : r
            ),
        }));
        // Persist review to Firestore
        updateReportHumanReview(reportId, review).catch(err =>
            console.error('Failed to update review in Firestore:', err),
        );
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
                deleteFloodReport,
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
