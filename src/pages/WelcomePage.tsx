// Welcome Page - Clean splash/get started screen
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Droplets, Shield, Map } from 'lucide-react';

export function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-dvh flex flex-col justify-between p-8 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 bg-blue-500 -top-[30%] -right-[20%] animate-orb-float" />
                <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-25 bg-purple-500 -bottom-[20%] -left-[20%] animate-orb-float-reverse" />
                <div className="absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 bg-emerald-500 top-[40%] left-1/2 -translate-x-1/2 animate-orb-float-medium" />
            </div>

            {/* Top spacing */}
            <div className="pt-[var(--safe-top)]" />

            {/* Content */}
            <div className="relative z-10 text-center flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                {/* Logo */}
                <div className="mb-10">
                    <div className="w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 p-1 animate-logo-glow shadow-2xl shadow-blue-500/20">
                        <div className="w-full h-full rounded-[calc(1.5rem-4px)] bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                            <svg className="w-[65%] h-[65%]" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="dropGradient" x1="20" y1="10" x2="60" y2="70" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#60A5FA" />
                                        <stop offset="0.5" stopColor="#3B82F6" />
                                        <stop offset="1" stopColor="#2563EB" />
                                    </linearGradient>
                                    <linearGradient id="shineGradient" x1="30" y1="20" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="rgba(255,255,255,0.4)" />
                                        <stop offset="1" stopColor="rgba(255,255,255,0)" />
                                    </linearGradient>
                                </defs>
                                <path d="M40 8C40 8 16 35 16 50C16 63.255 26.745 74 40 74C53.255 74 64 63.255 64 50C64 35 40 8 40 8Z" fill="url(#dropGradient)" />
                                <path d="M40 16C40 16 26 34 26 46C26 53.732 32.268 60 40 60C47.732 60 54 53.732 54 46C54 34 40 16 40 16Z" fill="url(#shineGradient)" />
                                <ellipse cx="32" cy="42" rx="6" ry="8" fill="rgba(255,255,255,0.25)" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                        FloodWay
                    </h1>
                    <p className="text-slate-400 mt-2 text-base">
                        Your Flood Preparedness Companion
                    </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-col gap-3 w-full mb-10 max-w-xs">
                    <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-left">
                        <div className="size-10 flex items-center justify-center bg-blue-500/20 rounded-xl shrink-0">
                            <Droplets className="size-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-white text-sm">Flood Prediction</p>
                            <p className="text-xs text-slate-400">AI-powered 24-hour forecast</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-left">
                        <div className="size-10 flex items-center justify-center bg-emerald-500/20 rounded-xl shrink-0">
                            <Map className="size-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-white text-sm">Smart Navigation</p>
                            <p className="text-xs text-slate-400">Real-road route to shelters</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-left">
                        <div className="size-10 flex items-center justify-center bg-purple-500/20 rounded-xl shrink-0">
                            <Shield className="size-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-white text-sm">Community Safety</p>
                            <p className="text-xs text-slate-400">Stay connected with your area</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <div className="relative z-10 max-w-md mx-auto w-full pb-[var(--safe-bottom)]">
                <Button
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 rounded-2xl"
                    onClick={() => navigate('/loading')}
                >
                    Get Started
                    <ArrowRight className="size-5 ml-2" />
                </Button>
                <p className="text-center text-slate-500 text-xs mt-4">
                    Community Project • Kuala Lumpur Region
                </p>
            </div>
        </div>
    );
}
