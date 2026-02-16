import { useMemo } from 'react';
import { useApp } from '../store';
import { Card, CardContent } from '@/components/ui/card';
import { Thermometer, Droplets, Wind, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForecastOverlayProps {
    selectedHourIndex?: number;
}

export function ForecastOverlay({ selectedHourIndex = 0 }: ForecastOverlayProps) {
    const { prediction } = useApp();

    const weather = useMemo(() => ({
        temp: 28 + Math.floor(Math.random() * 5),
        humidity: 75 + Math.floor(Math.random() * 15),
        wind: 8 + Math.floor(Math.random() * 10)
    }), []);

    if (!prediction) return null;

    const activeHour = prediction.hourlyPredictions[selectedHourIndex] || prediction.hourlyPredictions[0];
    if (!activeHour) return null;

    const getRiskConfig = (level: string) => {
        switch (level) {
            case 'danger': return {
                color: 'text-white',
                iconColor: 'text-red-200',
                bg: 'bg-red-500',
                bgSecondary: 'bg-red-600/50',
                border: 'border-red-400/30',
                gradient: 'from-red-500 to-red-600',
                label: 'High Risk',
                icon: '🚨',
                lightText: 'text-red-50'
            };
            case 'warning': return {
                color: 'text-white',
                iconColor: 'text-amber-100',
                bg: 'bg-amber-500',
                bgSecondary: 'bg-amber-600/50',
                border: 'border-amber-400/30',
                gradient: 'from-amber-500 to-orange-500',
                label: 'Mod. Risk',
                icon: '⚠️',
                lightText: 'text-amber-50'
            };
            default: return {
                color: 'text-white',
                iconColor: 'text-emerald-100',
                bg: 'bg-emerald-500',
                bgSecondary: 'bg-emerald-600/50',
                border: 'border-emerald-400/30',
                gradient: 'from-emerald-500 to-emerald-600',
                label: 'Low Risk',
                icon: '✅',
                lightText: 'text-emerald-50'
            };
        }
    };

    const riskConfig = getRiskConfig(activeHour.riskLevel);

    return (
        <div className="flex flex-col gap-1.5 md:gap-3 w-full pointer-events-auto">
            {/* Main Risk Card - Colored by risk */}
            <Card className={cn(
                "overflow-hidden border-0 shadow-xl backdrop-blur-md transition-all duration-500",
                riskConfig.bg,
                riskConfig.color
            )}>
                <CardContent className="p-0">
                    <div className="flex">
                        <div className={cn("w-12 md:w-16 flex flex-col items-center justify-center p-2.5 md:p-3 opacity-90")}>
                            <div className="relative size-8 md:size-10">
                                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(activeHour.probability || 0) * 2.64} 264`} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[10px] font-black text-white">
                                    {activeHour.probability || 0}%
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 p-2 md:p-3 flex flex-col justify-center">
                            <div className="flex items-center gap-1 md:gap-1.5 mb-0.5">
                                <span className="text-xs md:text-sm drop-shadow-sm">{riskConfig.icon}</span>
                                <h2 className="text-xs md:text-sm font-bold tracking-tight leading-none">{riskConfig.label}</h2>
                            </div>
                            <div className="flex items-center gap-1 opacity-80">
                                <TrendingUp className="size-2.5 md:size-3" />
                                <span className="text-[9px] md:text-[10px] font-medium">
                                    {selectedHourIndex === 0 ? `Peak at ${prediction.peakRiskHour}:00` : `Viewing ${activeHour.time}`}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Weather Stats Row */}
            <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                {[
                    { icon: Thermometer, val: `${weather.temp}°`, color: 'text-orange-400' },
                    { icon: Droplets, val: `${weather.humidity}%`, color: 'text-blue-400' },
                    { icon: Wind, val: weather.wind, color: 'text-slate-400' }
                ].map((stat, i) => (
                    <Card key={i} className="bg-slate-900/80 backdrop-blur-md border border-white/5 shadow-lg">
                        <CardContent className="p-1.5 md:p-2 text-center">
                            <stat.icon className={cn("size-2.5 md:size-3 mx-auto mb-1", stat.color)} />
                            <div className="text-[10px] md:text-xs font-bold text-white">{stat.val}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
