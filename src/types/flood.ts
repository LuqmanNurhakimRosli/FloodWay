// Flood prediction types and interfaces

export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface WeatherData {
    temperature: number;
    humidity: number;
    rainfall: number; // mm per hour
    windSpeed: number;
    condition: 'clear' | 'cloudy' | 'rainy' | 'stormy';
}

export interface FloodPrediction {
    time: Date;
    timeOffset: string; // "Now", "+1hr", "+3hr", etc.
    riskLevel: RiskLevel;
    probability: number; // 0-100
    rainfall: number; // mm
    waterLevel: number; // meters
    description: string;
}

export interface LocationData {
    name: string;
    region: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    currentWeather: WeatherData;
    predictions: FloodPrediction[];
    lastUpdated: Date;
}

export interface MonthlyRainfall {
    JAN: number;
    FEB: number;
    MAR: number;
    APR: number;
    MAY: number;
    JUN: number;
    JUL: number;
    AUG: number;
    SEP: number;
    OCT: number;
    NOV: number;
    DEC: number;
    ANNUAL_RAINFALL: number;
}
