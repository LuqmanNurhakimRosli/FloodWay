// Global app store using React Context for state management
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Location, Shelter, DailyPrediction, Route, Coordinates } from '../types/app';
import { DEFAULT_POSITION } from '../data/locations';
import { generateDailyPrediction } from '../utils/predictionGenerator';
import { calculateRoute } from '../utils/pathfinding';

interface AppState {
    selectedLocation: Location | null;
    prediction: DailyPrediction | null;
    selectedShelter: Shelter | null;
    route: Route | null;
    userPosition: Coordinates;
}

interface AppContextType extends AppState {
    setLocation: (location: Location) => void;
    setShelter: (shelter: Shelter) => void;
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
        const route = calculateRoute(state.userPosition, shelter);
        setState(prev => ({
            ...prev,
            selectedShelter: shelter,
            route,
        }));
    }, [state.userPosition]);

    const clearNavigation = useCallback(() => {
        setState(prev => ({
            ...prev,
            selectedShelter: null,
            route: null,
        }));
    }, []);

    const reset = useCallback(() => {
        setState({
            selectedLocation: null,
            prediction: null,
            selectedShelter: null,
            route: null,
            userPosition: DEFAULT_POSITION,
        });
    }, []);

    return (
        <AppContext.Provider
            value={{
                ...state,
                setLocation,
                setShelter,
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
