import type { FloodPrediction, RiskLevel } from '../types/flood';
import { formatTime } from '../services/floodService';

interface FloodTimelineProps {
    predictions: FloodPrediction[];
}

export function FloodTimeline({ predictions }: FloodTimelineProps) {
    const getRiskStyles = (riskLevel: RiskLevel) => {
        switch (riskLevel) {
            case 'safe':
                return {
                    dot: 'bg-emerald-500',
                    line: 'bg-emerald-500/30',
                    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
                };
            case 'warning':
                return {
                    dot: 'bg-amber-500',
                    line: 'bg-amber-500/30',
                    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
                };
            case 'danger':
                return {
                    dot: 'bg-red-500 animate-pulse',
                    line: 'bg-red-500/30',
                    badge: 'bg-red-500/20 text-red-400 border-red-500/50',
                };
        }
    };

    return (
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📅</span> Flood Prediction Timeline
            </h3>

            <div className="relative">
                {predictions.map((prediction, index) => {
                    const styles = getRiskStyles(prediction.riskLevel);
                    const isLast = index === predictions.length - 1;

                    return (
                        <div key={prediction.timeOffset} className="relative flex gap-4">
                            {/* Timeline line */}
                            <div className="flex flex-col items-center">
                                <div className={`w-4 h-4 rounded-full ${styles.dot} z-10`} />
                                {!isLast && (
                                    <div className={`w-0.5 flex-1 min-h-[60px] ${styles.line}`} />
                                )}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg font-semibold text-white">
                                        {prediction.timeOffset}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        {formatTime(prediction.time)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles.badge}`}>
                                        {prediction.riskLevel.toUpperCase()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-2">
                                    <div className="bg-gray-700/50 rounded-lg p-2">
                                        <p className="text-xs text-gray-400">Rainfall</p>
                                        <p className="text-sm font-semibold text-white">{prediction.rainfall} mm</p>
                                    </div>
                                    <div className="bg-gray-700/50 rounded-lg p-2">
                                        <p className="text-xs text-gray-400">Water Level</p>
                                        <p className="text-sm font-semibold text-white">{prediction.waterLevel} m</p>
                                    </div>
                                    <div className="bg-gray-700/50 rounded-lg p-2">
                                        <p className="text-xs text-gray-400">Probability</p>
                                        <p className="text-sm font-semibold text-white">{prediction.probability}%</p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-300">{prediction.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
