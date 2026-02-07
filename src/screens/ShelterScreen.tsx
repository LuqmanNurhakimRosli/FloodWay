// Shelter Selection Screen

import type { Shelter, Coordinates } from '../types/app';
import { getSheltersWithDistance } from '../data/locations';

interface ShelterScreenProps {
    userPosition: Coordinates;
    onSelectShelter: (shelter: Shelter) => void;
    onBack: () => void;
}

export function ShelterScreen({ userPosition, onSelectShelter, onBack }: ShelterScreenProps) {
    const shelters = getSheltersWithDistance(userPosition);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <span>←</span>
                    <span>Back to Forecast</span>
                </button>
                <h1 className="text-2xl font-bold text-white mb-2">Nearby Shelters</h1>
                <p className="text-gray-400">Select a shelter to navigate</p>
            </div>

            {/* Simple Map Visualization */}
            <div className="mb-6 h-48 bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* User position (center) */}
                        <div
                            className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50" />
                        </div>

                        {/* Shelter markers */}
                        {shelters.slice(0, 5).map((shelter, index) => {
                            // Simple relative positioning for visualization
                            const angle = (index / 5) * 2 * Math.PI;
                            const distance = 30 + (shelter.distance || 0) * 5;
                            const x = 50 + Math.cos(angle) * distance;
                            const y = 50 + Math.sin(angle) * distance;

                            return (
                                <div
                                    key={shelter.id}
                                    className="absolute w-3 h-3 bg-emerald-500 rounded-full border border-white"
                                    style={{
                                        left: `${Math.max(10, Math.min(90, x))}%`,
                                        top: `${Math.max(10, Math.min(90, y))}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    title={shelter.name}
                                />
                            );
                        })}

                        {/* Legend */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span>You</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span>Shelters</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shelter List */}
            <div className="space-y-3">
                {shelters.map((shelter, index) => (
                    <button
                        key={shelter.id}
                        onClick={() => onSelectShelter(shelter)}
                        className="w-full p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl text-left hover:bg-gray-800 hover:border-emerald-500/50 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${index === 0
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-gray-700 text-gray-400'
                                }`}>
                                {index + 1}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate group-hover:text-emerald-300 transition-colors">
                                    {shelter.name}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <span>📍</span>
                                        {shelter.distance} km
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span>⏱️</span>
                                        ~{shelter.estimatedTime} min
                                    </span>
                                </div>
                            </div>

                            {/* Navigate button */}
                            <div className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                Navigate
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <p className="text-sm text-emerald-200">
                    💡 Shelters are sorted by distance. Select one to get turn-by-turn navigation.
                </p>
            </div>
        </div>
    );
}
