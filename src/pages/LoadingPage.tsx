// Loading Page - Location processing screen with animation
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { LOCATIONS } from '../data/locations';
import { MapPin, Loader2, CheckCircle, Wifi, Shield, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingPage() {
    const navigate = useNavigate();
    const { setLocation } = useApp();
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);

    const steps = [
        { icon: <Wifi className="size-5" />, label: 'Connecting to network', delay: 600 },
        { icon: <MapPin className="size-5" />, label: 'Processing your location', delay: 1200 },
        { icon: <Navigation className="size-5" />, label: 'Finding nearby shelters', delay: 1800 },
        { icon: <Shield className="size-5" />, label: 'Loading flood data', delay: 2400 },
    ];

    useEffect(() => {
        // Progress animation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);

        // Step transitions
        const timers = steps.map((s, i) =>
            setTimeout(() => setStep(i + 1), s.delay)
        );

        // Auto-navigate after loading
        const nav = setTimeout(() => {
            // Default to Kuala Lumpur
            setLocation(LOCATIONS[0]);
            navigate('/home', { replace: true });
        }, 3200);

        return () => {
            clearInterval(interval);
            timers.forEach(clearTimeout);
            clearTimeout(nav);
        };
    }, [navigate, setLocation]);

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 bg-blue-500 -top-[20%] left-[10%] animate-orb-float" />
                <div className="absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 bg-emerald-500 -bottom-[10%] right-[10%] animate-orb-float-reverse" />
            </div>

            <div className="relative z-10 text-center max-w-sm w-full">
                {/* Pulsing Location Icon */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-2 bg-blue-500/30 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                    <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30">
                        <MapPin className="size-10 text-white" />
                    </div>
                </div>

                {/* Status Text */}
                <h2 className="text-xl font-bold text-white mb-2">
                    {progress < 100 ? 'Setting things up...' : 'Ready!'}
                </h2>
                <p className="text-slate-400 text-sm mb-8">
                    {progress < 100 ? 'Preparing your flood preparedness dashboard' : 'Welcome to FloodWay'}
                </p>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Steps */}
                <div className="space-y-3">
                    {steps.map((s, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500",
                                i < step
                                    ? "bg-emerald-500/10 border border-emerald-500/20"
                                    : i === step
                                        ? "bg-blue-500/10 border border-blue-500/20"
                                        : "bg-white/5 border border-white/5 opacity-40"
                            )}
                        >
                            <div className={cn(
                                "size-8 flex items-center justify-center rounded-lg transition-all duration-500",
                                i < step
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : i === step
                                        ? "bg-blue-500/20 text-blue-400"
                                        : "bg-white/10 text-slate-500"
                            )}>
                                {i < step ? (
                                    <CheckCircle className="size-5" />
                                ) : i === step ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    s.icon
                                )}
                            </div>
                            <span className={cn(
                                "text-sm font-medium transition-colors duration-500",
                                i < step ? "text-emerald-400" : i === step ? "text-blue-400" : "text-slate-500"
                            )}>
                                {s.label}
                            </span>
                            {i < step && (
                                <span className="ml-auto text-[10px] text-emerald-400 font-medium">Done</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Location Display */}
                <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 flex items-center justify-center bg-blue-500/20 rounded-xl">
                            <MapPin className="size-5 text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-slate-500">Your Location</p>
                            <p className="text-sm font-semibold text-white">Kuala Lumpur, Malaysia</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
