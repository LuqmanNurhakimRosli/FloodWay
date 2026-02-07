// Welcome Screen Component

interface WelcomeScreenProps {
    onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center p-6">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-md">
                {/* Logo */}
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-2xl">
                        <span className="text-5xl">🌊</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">FloodWay</h1>
                    <p className="text-blue-200 text-lg">AI-Powered Flood Preparedness</p>
                </div>

                {/* Description */}
                <div className="mb-12 space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                        Stay safe with real-time flood predictions and navigate to the nearest shelter when danger approaches.
                    </p>

                    <div className="flex justify-center gap-6 text-sm text-blue-200">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <span>Live Predictions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full" />
                            <span>Smart Navigation</span>
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={onStart}
                    className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-2xl text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
                >
                    Get Started
                </button>

                {/* Footer note */}
                <p className="mt-8 text-xs text-gray-400">
                    Prototype Version • Kuala Lumpur Region
                </p>
            </div>
        </div>
    );
}
