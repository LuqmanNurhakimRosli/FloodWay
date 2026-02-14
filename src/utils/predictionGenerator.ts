// Prediction Generator - Creates daily flood predictions

import type { DailyPrediction, HourlyPrediction } from '../types/app';

type RiskLevel = 'safe' | 'warning' | 'danger';

// Generate hourly predictions for a day (Fixed 9am - 9pm)
export function generateDailyPrediction(simulateDanger: boolean = true): DailyPrediction {
    const now = new Date();
    const hourlyPredictions: HourlyPrediction[] = [];

    // Fixed time range: 9am (9) to 9pm (21)
    for (let hour = 9; hour <= 21; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        let probability = 10;
        let riskLevel: RiskLevel = 'safe';

        // Specific risk patterns requested (only if simulating danger):
        if (simulateDanger) {
            // Red (Danger) on 2-4 (14:00 - 16:00) -> Hours 14, 15
            if (hour >= 14 && hour < 16) {
                probability = 85 + Math.floor(Math.random() * 10); // High probability > 70
                riskLevel = 'danger';
            }
            // Yellow (Warning) on 4-5 (16:00 - 17:00) -> Hour 16
            else if (hour === 16) {
                probability = 50 + Math.floor(Math.random() * 15); // Medium probability 40-70
                riskLevel = 'warning';
            }
            // Red (Danger) on 5-7 (17:00 - 19:00) -> Hours 17, 18
            else if (hour >= 17 && hour < 19) {
                probability = 80 + Math.floor(Math.random() * 15); // High probability > 70
                riskLevel = 'danger';
            }
            // Normal/Safe times
            else {
                probability = 10 + Math.floor(Math.random() * 20); // Low probability
                riskLevel = 'safe';
            }
        } else {
            // Safe day logic
            probability = 5 + Math.floor(Math.random() * 15);
            riskLevel = 'safe';
        }

        // Calculate rainfall (correlated with probability)
        const rainfall = Math.round((probability / 100) * 80 + Math.random() * 20);

        hourlyPredictions.push({
            hour,
            time,
            riskLevel,
            probability,
            rainfall
        });
    }

    // Determine overall risk
    const hasDanger = hourlyPredictions.some(p => p.riskLevel === 'danger');
    const hasWarning = hourlyPredictions.some(p => p.riskLevel === 'warning');

    let overallRisk: RiskLevel = 'safe';
    let alertMessage: string | undefined = undefined;

    if (hasDanger) {
        overallRisk = 'danger';
        const dangerHours = hourlyPredictions.filter(p => p.riskLevel === 'danger');
        if (dangerHours.length > 0) {
            alertMessage = `High flood risk expected during peak hours (2pm-4pm, 5pm-7pm).`;
        }
    } else if (hasWarning) {
        overallRisk = 'warning';
    }

    // Find peak risk hour
    const peakProbability = Math.max(...hourlyPredictions.map(p => p.probability));
    const peakPrediction = hourlyPredictions.find(p => p.probability === peakProbability) || hourlyPredictions[0];
    const peakRiskHour = peakPrediction.hour;

    return {
        date: now,
        hourlyPredictions,
        peakRiskHour,
        overallRisk,
        alertMessage
    };
}
