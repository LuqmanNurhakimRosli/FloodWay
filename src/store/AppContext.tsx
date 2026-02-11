// Global app store using React Context for state management
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Location, Shelter, DailyPrediction, Route, Coordinates, TransportMode } from '../types/app';
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
}

interface AppContextType extends AppState {
    setLocation: (location: Location) => void;
    setShelter: (shelter: Shelter) => void;
    setTransportMode: (mode: TransportMode) => void;
    navigateToShelter: (shelter: Shelter, mode: TransportMode) => Promise<void>;
    clearNavigation: () => void;
    reset: () => void;
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
            const route = await calculateRoute(state.userPosition, shelter, mode);
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

    const reset = useCallback(() => {
        setState({
            selectedLocation: null,
            prediction: null,
            selectedShelter: null,
            route: null,
            userPosition: DEFAULT_POSITION,
            transportMode: 'car',
            isRouteLoading: false,
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
