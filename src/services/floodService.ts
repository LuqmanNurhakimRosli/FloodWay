// Flood prediction service - connects to FastAPI backend
// Falls back to dummy data if backend is not available

import type { LocationData, FloodPrediction, WeatherData, RiskLevel, MonthlyRainfall } from '../types/flood';

const API_BASE_URL = 'http://localhost:8000';

// Simulated monthly rainfall data for Kuala Lumpur (based on historical averages)
const kualaLumpurRainfall: MonthlyRainfall = {
    JAN: 170.3,
    FEB: 165.4,
    MAR: 240.8,
    APR: 259.5,
    MAY: 204.4,
    JUN: 125.8,
    JUL: 127.5,
    AUG: 156.3,
    SEP: 192.7,
    OCT: 253.0,
    NOV: 288.3,
    DEC: 245.8,
    ANNUAL_RAINFALL: 2429.8
};

// Call the backend prediction API
interface BackendPrediction {
    flood_probability: number;
    flood_predicted: boolean;
    risk_level: 'safe' | 'warning' | 'danger';
    confidence: number;
}

async function getBackendPrediction(rainfall: MonthlyRainfall): Promise<BackendPrediction | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                JAN: rainfall.JAN,
                FEB: rainfall.FEB,
                MAR: rainfall.MAR,
                APR: rainfall.APR,
                MAY: rainfall.MAY,
                JUN: rainfall.JUN,
                JUL: rainfall.JUL,
                AUG: rainfall.AUG,
                SEP: rainfall.SEP,
                OCT: rainfall.OCT,
                NOV: rainfall.NOV,
                DEC: rainfall.DEC,
                ANNUAL_RAINFALL: rainfall.ANNUAL_RAINFALL
            }),
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn('Backend prediction failed:', error);
        return null;
    }
}

// Helper function to calculate risk level based on rainfall (fallback)
function calculateRiskLevel(rainfall: number, waterLevel: number): RiskLevel {
    const riskScore = (rainfall / 50) + (waterLevel / 2);
    if (riskScore >= 1.5) return 'danger';
    if (riskScore >= 0.8) return 'warning';
    return 'safe';
}

// Helper function to calculate flood probability (fallback)
function calculateFloodProbability(rainfall: number, waterLevel: number): number {
    const baseProb = Math.min((rainfall / 80) * 100, 100);
    const waterLevelBonus = waterLevel > 1.5 ? (waterLevel - 1.5) * 20 : 0;
    return Math.min(Math.round(baseProb + waterLevelBonus), 100);
}

// Generate predictions for the next hours
function generatePredictions(baseRainfall: number, backendPrediction?: BackendPrediction | null): FloodPrediction[] {
    const now = new Date();
    const predictions: FloodPrediction[] = [];

    const timeOffsets = [
        { label: 'Now', hours: 0 },
        { label: '+1hr', hours: 1 },
        { label: '+3hr', hours: 3 },
        { label: '+6hr', hours: 6 },
        { label: '+12hr', hours: 12 },
        { label: '+24hr', hours: 24 },
    ];

    // Simulate varying conditions (storm incoming pattern)
    const rainfallMultipliers = [1, 1.2, 1.8, 2.5, 2.0, 1.5];
    const waterLevelBase = 1.2;

    timeOffsets.forEach((offset, index) => {
        const predictionTime = new Date(now.getTime() + offset.hours * 60 * 60 * 1000);
        const rainfall = Math.round(baseRainfall * rainfallMultipliers[index] * 10) / 10;
        const waterLevel = Math.round((waterLevelBase + (rainfall / 50)) * 100) / 100;

        // Use backend prediction for current time if available
        let riskLevel: RiskLevel;
        let probability: number;

        if (index === 0 && backendPrediction) {
            riskLevel = backendPrediction.risk_level;
            probability = Math.round(backendPrediction.flood_probability * 100);
        } else {
            riskLevel = calculateRiskLevel(rainfall, waterLevel);
            probability = calculateFloodProbability(rainfall, waterLevel);
        }

        let description = '';
        if (riskLevel === 'safe') {
            description = 'Normal conditions. No flood risk expected.';
        } else if (riskLevel === 'warning') {
            description = 'Elevated water levels. Stay alert and monitor updates.';
        } else {
            description = 'High flood risk! Prepare for possible evacuation.';
        }

        predictions.push({
            time: predictionTime,
            timeOffset: offset.label,
            riskLevel,
            probability,
            rainfall,
            waterLevel,
            description,
        });
    });

    return predictions;
}

// Simulate current weather conditions
function generateCurrentWeather(): WeatherData {
    const rainfallIntensity = 15 + Math.random() * 30;
    const isStormy = rainfallIntensity > 35;
    const isRainy = rainfallIntensity > 20;

    return {
        temperature: 26 + Math.random() * 6,
        humidity: 70 + Math.random() * 25,
        rainfall: Math.round(rainfallIntensity * 10) / 10,
        windSpeed: 5 + Math.random() * 20,
        condition: isStormy ? 'stormy' : isRainy ? 'rainy' : 'cloudy',
    };
}

// Main function to get flood prediction data
export async function getFloodPrediction(locationName: string = 'Kuala Lumpur'): Promise<LocationData> {
    const currentWeather = generateCurrentWeather();

    // Try to get prediction from backend
    const monthlyRainfall = getCurrentMonthRainfall();
    const backendPrediction = await getBackendPrediction(monthlyRainfall);

    if (backendPrediction) {
        console.log('Using ML model prediction:', backendPrediction);
    } else {
        console.log('Using fallback simulation (backend not available)');
    }

    const predictions = generatePredictions(currentWeather.rainfall, backendPrediction);

    return {
        name: locationName,
        region: 'Wilayah Persekutuan',
        coordinates: {
            lat: 3.1390,
            lng: 101.6869,
        },
        currentWeather,
        predictions,
        lastUpdated: new Date(),
    };
}

// Get current month's rainfall for the model
export function getCurrentMonthRainfall(): MonthlyRainfall {
    const month = new Date().getMonth();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    // Add some variation to the historical data
    const variation = 0.8 + Math.random() * 0.4;

    return {
        ...kualaLumpurRainfall,
        [months[month]]: (kualaLumpurRainfall[months[month] as keyof MonthlyRainfall] as number) * variation,
    };
}

// Check backend status
export async function checkBackendStatus(): Promise<{ available: boolean; modelLoaded: boolean }> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            signal: AbortSignal.timeout(2000)
        });
        const data = await response.json();
        return {
            available: true,
            modelLoaded: data.model_loaded
        };
    } catch {
        return {
            available: false,
            modelLoaded: false
        };
    }
}

// Format time for display
export function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-MY', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

// Format date for display
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
