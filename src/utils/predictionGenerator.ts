// Prediction Generator - Creates daily flood predictions

import type { DailyPrediction, HourlyPrediction } from '../types/app';

type RiskLevel = 'safe' | 'warning' | 'danger';

// Generate hourly predictions for a day
export function generateDailyPrediction(simulateDanger: boolean = true): DailyPrediction {
    const now = new Date();
    const hourlyPredictions: HourlyPrediction[] = [];

    // Determine peak danger hours (simulating afternoon heavy rain pattern typical in Malaysia)
    const peakHour = 14 + Math.floor(Math.random() * 4); // 2pm-6pm

    for (let i = 0; i < 24; i++) {
        const hour = (now.getHours() + i) % 24;
        const time = `${hour.toString().padStart(2, '0')}:00`;

        // Calculate probability based on time of day
        let baseProbability = 20;

        // Afternoon thunderstorm pattern
        if (hour >= 14 && hour <= 18) {
            baseProbability = 40 + Math.random() * 40;
        } else if (hour >= 12 && hour <= 20) {
            baseProbability = 25 + Math.random() * 30;
        } else {
            baseProbability = 10 + Math.random() * 20;
        }

        // Add danger spike if simulating
        if (simulateDanger && Math.abs(hour - peakHour) <= 2) {
            baseProbability = 70 + Math.random() * 30;
        }

        const probability = Math.round(baseProbability);

        // Determine risk level
        let riskLevel: RiskLevel = 'safe';
        if (probability >= 70) {
            riskLevel = 'danger';
        } else if (probability >= 40) {
            riskLevel = 'warning';
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
        alertMessage = `High flood risk expected from ${dangerHours[0].time} to ${dangerHours[dangerHours.length - 1].time}`;
    } else if (hasWarning) {
        overallRisk = 'warning';
    }

    // Find peak risk hour
    const peakRiskHour = hourlyPredictions.reduce((max, curr) =>
        curr.probability > max.probability ? curr : max
    ).hour;

    return {
        date: now,
        hourlyPredictions,
        peakRiskHour,
        overallRisk,
        alertMessage
    };
}
