// Prediction Screen - Shows daily flood predictions

import type { DailyPrediction, Location } from '../types/app';

interface PredictionScreenProps {
    location: Location;
    prediction: DailyPrediction;
    onNavigateToShelters: () => void;
    onBack: () => void;
}

export function PredictionScreen({
    location,
    prediction,
    onNavigateToShelters,
    onBack
}: PredictionScreenProps) {
    const hasDanger = prediction.hourlyPredictions.some(p => p.riskLevel === 'danger');
    const dangerHours = prediction.hourlyPredictions.filter(p => p.riskLevel === 'danger');
    const firstDangerHour = dangerHours.length > 0 ? dangerHours[0] : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            {/* Header */}
            <div className="p-6 pb-4">
                <button
                    onClick={onBack}
                    className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <span>←</span>
                    <span>Change Location</span>
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                        <h1 className="text-xl font-bold text-white">{location.name}</h1>
                        <p className="text-sm text-gray-400">Today's Flood Prediction</p>
                    </div>
                </div>
            </div>

            {/* Danger Alert */}
            {hasDanger && (
                <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-red-600/30 to-red-800/30 border border-red-500/50 rounded-2xl animate-pulse">
                    <div className="flex items-start gap-3">
                        <span className="text-3xl">🚨</span>
                        <div>
                            <h2 className="text-lg font-bold text-red-400">FLOOD WARNING</h2>
                            <p className="text-red-200 text-sm">
                                High flood risk expected {firstDangerHour ? `at ${firstDangerHour.time}` : 'today'}!
                                Prepare to evacuate to a shelter.
                            </p>
                            <button
                                onClick={onNavigateToShelters}
                                className="mt-3 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Find Nearest Shelter →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overall Status */}
            <div className="mx-6 mb-6">
                <div className={`p-6 rounded-2xl ${prediction.overallRisk === 'danger'
                        ? 'bg-red-500/20 border border-red-500/50'
                        : prediction.overallRisk === 'warning'
                            ? 'bg-amber-500/20 border border-amber-500/50'
                            : 'bg-emerald-500/20 border border-emerald-500/50'
                    }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${prediction.overallRisk === 'danger'
                                ? 'bg-red-500/30'
                                : prediction.overallRisk === 'warning'
                                    ? 'bg-amber-500/30'
                                    : 'bg-emerald-500/30'
                            }`}>
                            {prediction.overallRisk === 'danger' ? '⚡' : prediction.overallRisk === 'warning' ? '⚠️' : '✓'}
                        </div>
                        <div>
                            <h3 className={`text-xl font-bold ${prediction.overallRisk === 'danger'
                                    ? 'text-red-400'
                                    : prediction.overallRisk === 'warning'
                                        ? 'text-amber-400'
                                        : 'text-emerald-400'
                                }`}>
                                {prediction.overallRisk === 'danger'
                                    ? 'High Risk Day'
                                    : prediction.overallRisk === 'warning'
                                        ? 'Moderate Risk'
                                        : 'Low Risk Day'}
                            </h3>
                            <p className="text-gray-300 text-sm">
                                Peak risk expected at {prediction.peakRiskHour}:00
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hourly Timeline */}
            <div className="px-6 pb-6">
                <h3 className="text-lg font-semibold text-white mb-4">24-Hour Forecast</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {prediction.hourlyPredictions.map((hour, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-4 p-3 rounded-xl ${hour.riskLevel === 'danger'
                                    ? 'bg-red-500/20 border border-red-500/30'
                                    : hour.riskLevel === 'warning'
                                        ? 'bg-amber-500/10 border border-amber-500/20'
                                        : 'bg-gray-800/50 border border-gray-700/50'
                                }`}
                        >
                            {/* Time */}
                            <div className="w-16 text-center">
                                <span className="text-sm font-medium text-gray-300">{hour.time}</span>
                            </div>

                            {/* Status indicator */}
                            <div className={`w-3 h-3 rounded-full ${hour.riskLevel === 'danger'
                                    ? 'bg-red-500 animate-pulse'
                                    : hour.riskLevel === 'warning'
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                }`} />

                            {/* Probability bar */}
                            <div className="flex-1">
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${hour.riskLevel === 'danger'
                                                ? 'bg-red-500'
                                                : hour.riskLevel === 'warning'
                                                    ? 'bg-amber-500'
                                                    : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${hour.probability}%` }}
                                    />
                                </div>
                            </div>

                            {/* Probability text */}
                            <div className="w-12 text-right">
                                <span className={`text-sm font-medium ${hour.riskLevel === 'danger'
                                        ? 'text-red-400'
                                        : hour.riskLevel === 'warning'
                                            ? 'text-amber-400'
                                            : 'text-gray-400'
                                    }`}>
                                    {hour.probability}%
                                </span>
                            </div>

                            {/* Danger label */}
                            {hour.riskLevel === 'danger' && (
                                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                    DANGER
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 to-transparent">
                <button
                    onClick={onNavigateToShelters}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${hasDanger
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    {hasDanger ? '🚨 Navigate to Shelter' : 'View Nearby Shelters'}
                </button>
            </div>
        </div>
    );
}
