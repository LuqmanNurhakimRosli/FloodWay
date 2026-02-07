// App types and interfaces

export type AppScreen = 'welcome' | 'location' | 'prediction' | 'shelters' | 'navigation';

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Location {
    id: string;
    name: string;
    region: string;
    position: Coordinates;
}

export interface Shelter {
    id: string;
    name: string;
    position: Coordinates;
    distance?: number; // km from user
    estimatedTime?: number; // minutes
}

export interface HourlyPrediction {
    hour: number;
    time: string;
    riskLevel: 'safe' | 'warning' | 'danger';
    probability: number;
    rainfall: number;
}

export interface DailyPrediction {
    date: Date;
    hourlyPredictions: HourlyPrediction[];
    peakRiskHour: number;
    overallRisk: 'safe' | 'warning' | 'danger';
    alertMessage?: string;
}

export interface NavigationStep {
    instruction: string;
    distance: number; // meters
    position: Coordinates;
}

export interface Route {
    shelter: Shelter;
    distance: number; // total km
    estimatedTime: number; // minutes
    steps: NavigationStep[];
    path: Coordinates[]; // path points for visualization
}

// App state
export interface AppState {
    currentScreen: AppScreen;
    selectedLocation: Location | null;
    userPosition: Coordinates;
    prediction: DailyPrediction | null;
    selectedShelter: Shelter | null;
    route: Route | null;
    isLoading: boolean;
}
