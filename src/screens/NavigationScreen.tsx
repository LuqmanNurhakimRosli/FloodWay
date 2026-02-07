// Navigation Screen - GPS-like turn-by-turn navigation using A* algorithm

import { useState, useEffect } from 'react';
import type { Route } from '../types/app';

interface NavigationScreenProps {
    route: Route;
    onBack: () => void;
    onArrived: () => void;
}

export function NavigationScreen({ route, onBack, onArrived }: NavigationScreenProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isNavigating, setIsNavigating] = useState(true);

    // Simulate navigation progress
    useEffect(() => {
        if (!isNavigating) return;

        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= route.steps.length - 1) {
                    setIsNavigating(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 3000); // Advance every 3 seconds for demo

        return () => clearInterval(interval);
    }, [isNavigating, route.steps.length]);

    const currentInstruction = route.steps[currentStep];
    const progress = ((currentStep + 1) / route.steps.length) * 100;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Top Bar */}
            <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
                <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ✕ Cancel
                </button>
                <span className="text-white font-medium">Navigation</span>
                <div className="w-16" /> {/* Spacer */}
            </div>

            {/* Map Visualization */}
            <div className="flex-1 relative bg-gray-800">
                {/* Simple Route Visualization */}
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                    {/* Grid background */}
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />

                    {/* Route path */}
                    {route.path.length > 1 && (
                        <polyline
                            points={route.path.map((_p, i) => {
                                const x = 10 + (i / (route.path.length - 1)) * 80;
                                const y = 70 - Math.sin(i * 0.5) * 20;
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="0"
                        />
                    )}

                    {/* Completed path */}
                    <polyline
                        points={route.path.slice(0, Math.floor((currentStep / route.steps.length) * route.path.length) + 1).map((_p, i) => {
                            const x = 10 + (i / (route.path.length - 1)) * 80;
                            const y = 70 - Math.sin(i * 0.5) * 20;
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />

                    {/* User position (moving dot) */}
                    <g transform={`translate(${10 + (currentStep / (route.steps.length - 1 || 1)) * 80}, ${70 - Math.sin(currentStep * 0.5) * 20})`}>
                        <circle r="8" fill="#10B981" />
                        <circle r="4" fill="white" />
                    </g>

                    {/* Start marker */}
                    <g transform="translate(10, 70)">
                        <circle r="5" fill="#3B82F6" />
                        <text y="-10" textAnchor="middle" fill="white" fontSize="6">Start</text>
                    </g>

                    {/* End marker (Shelter) */}
                    <g transform="translate(90, 50)">
                        <circle r="6" fill="#EF4444" />
                        <text y="-10" textAnchor="middle" fill="white" fontSize="6">🏥</text>
                    </g>
                </svg>

                {/* ETA Badge */}
                <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700">
                    <p className="text-xs text-gray-400">Arriving in</p>
                    <p className="text-xl font-bold text-white">{route.estimatedTime} min</p>
                </div>

                {/* Distance Badge */}
                <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700">
                    <p className="text-xs text-gray-400">Distance</p>
                    <p className="text-xl font-bold text-white">{route.distance} km</p>
                </div>
            </div>

            {/* Current Instruction */}
            <div className="bg-gray-800 border-t border-gray-700">
                {/* Progress bar */}
                <div className="h-1 bg-gray-700">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="p-6">
                    {currentStep < route.steps.length - 1 ? (
                        <>
                            {/* Direction Icon */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl">
                                    {currentInstruction.instruction.includes('north') ? '⬆️' :
                                        currentInstruction.instruction.includes('south') ? '⬇️' :
                                            currentInstruction.instruction.includes('east') ? '➡️' :
                                                currentInstruction.instruction.includes('west') ? '⬅️' : '📍'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-2xl font-bold text-white">
                                        {currentInstruction.instruction}
                                    </p>
                                    <p className="text-gray-400 mt-1">
                                        Step {currentStep + 1} of {route.steps.length}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                                ✓
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">You've Arrived!</h2>
                            <p className="text-gray-400 mb-4">{route.shelter.name}</p>
                            <button
                                onClick={onArrived}
                                className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
                            >
                                I'm Safe
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Destination Info */}
            <div className="bg-gray-900 p-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🏥</span>
                    <div>
                        <p className="text-sm text-gray-400">Heading to</p>
                        <p className="text-white font-medium">{route.shelter.name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
