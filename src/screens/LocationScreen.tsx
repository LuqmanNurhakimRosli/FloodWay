// Location Selection Screen

import type { Location } from '../types/app';
import { LOCATIONS } from '../data/locations';

interface LocationScreenProps {
    onSelectLocation: (location: Location) => void;
    onBack: () => void;
}

export function LocationScreen({ onSelectLocation, onBack }: LocationScreenProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <span>←</span>
                    <span>Back</span>
                </button>
                <h1 className="text-2xl font-bold text-white mb-2">Select Your Location</h1>
                <p className="text-gray-400">Choose your area to get flood predictions</p>
            </div>

            {/* Location Cards */}
            <div className="space-y-4">
                {LOCATIONS.map((location) => (
                    <button
                        key={location.id}
                        onClick={() => onSelectLocation(location)}
                        className="w-full p-5 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl text-left hover:bg-gray-800 hover:border-blue-500/50 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                <span className="text-2xl">📍</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                                    {location.name}
                                </h3>
                                <p className="text-sm text-gray-400">{location.region}</p>
                            </div>

                            {/* Arrow */}
                            <div className="text-gray-500 group-hover:text-blue-400 transition-colors">
                                <span className="text-xl">→</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Info Note */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                    <span className="text-blue-400 text-lg">ℹ️</span>
                    <div>
                        <p className="text-sm text-blue-200">
                            Your location will be used to provide accurate flood predictions and find nearby shelters.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
