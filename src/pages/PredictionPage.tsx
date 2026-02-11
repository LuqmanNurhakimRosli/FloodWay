// Prediction Page - Premium 24-hour flood forecast with shadcn/Tailwind
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, MapPin, AlertTriangle, Building2, Droplets, Wind, Thermometer, ChevronRight, Clock, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PredictionPage() {
    const navigate = useNavigate();
    const { selectedLocation, prediction } = useApp();
    const [selectedHourIndex, setSelectedHourIndex] = useState(0);

    // Redirect if no location selected
    useEffect(() => {
        if (!selectedLocation || !prediction) {
            navigate('/home');
        }
    }, [selectedLocation, prediction, navigate]);

    if (!selectedLocation || !prediction) return null;

    const hasDanger = prediction.hourlyPredictions.some(p => p.riskLevel === 'danger');
    const hasWarning = prediction.hourlyPredictions.some(p => p.riskLevel === 'warning');
    const dangerHours = prediction.hourlyPredictions.filter(p => p.riskLevel === 'danger');
    const nextDangerHour = dangerHours.length > 0 ? dangerHours[0] : null;
    const selectedHour = prediction.hourlyPredictions[selectedHourIndex];

    const getRiskConfig = (level: string) => {
        switch (level) {
            case 'danger': return {
                color: 'text-red-500',
                bg: 'bg-red-500',
                bgLight: 'bg-red-500/10',
                border: 'border-red-500/30',
                gradient: 'from-red-500 to-red-600',
                label: 'High Risk',
                icon: '🚨'
            };
            case 'warning': return {
                color: 'text-amber-500',
                bg: 'bg-amber-500',
                bgLight: 'bg-amber-500/10',
                border: 'border-amber-500/30',
                gradient: 'from-amber-500 to-orange-500',
                label: 'Moderate Risk',
                icon: '⚠️'
            };
            default: return {
                color: 'text-emerald-500',
                bg: 'bg-emerald-500',
                bgLight: 'bg-emerald-500/10',
                border: 'border-emerald-500/30',
                gradient: 'from-emerald-500 to-green-500',
                label: 'Low Risk',
                icon: '✅'
            };
        }
    };

    const riskConfig = getRiskConfig(prediction.overallRisk);
    const selectedRiskConfig = getRiskConfig(selectedHour?.riskLevel || 'safe');

    // Simulated weather data
    const weather = {
        temp: 28 + Math.floor(Math.random() * 5),
        humidity: 75 + Math.floor(Math.random() * 15),
        wind: 8 + Math.floor(Math.random() * 10)
    };

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pb-24">
            {/* Header */}
            <header className="relative p-5 pt-[calc(1.25rem+var(--safe-top))]">
                <div className="flex items-center gap-3 mb-5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                        onClick={() => navigate('/home')}
                    >
                        <ArrowLeft className="size-5" />
                    </Button>
                    <div className="flex-1">
                        <Badge variant="secondary" className="mb-1.5 bg-primary/20 text-primary border-0 text-xs">
                            <MapPin className="size-3 mr-1" />
                            {selectedLocation.name}
                        </Badge>
                        <h1 className="text-xl font-bold">Flood Forecast</h1>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                        <div className="font-medium text-foreground">Today</div>
                        <div>{new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}</div>
                    </div>
                </div>

                {/* Danger Alert Banner */}
                {hasDanger && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/20 via-red-600/15 to-red-500/20 border border-red-500/30 p-4 mb-5">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMEwyNSAxMEwzNSAxMEwyNyAxN0wzMCAyN0wyMCAyMkwxMCAyN0wxMyAxN0w1IDEwTDE1IDEwWiIgZmlsbD0icmdiYSgyMzksMjgsNzIsMC4wNSkiLz48L3N2Zz4=')] opacity-30" />
                        <div className="relative flex items-center gap-4">
                            <div className="size-12 flex items-center justify-center bg-red-500 rounded-xl shadow-lg shadow-red-500/30 animate-pulse">
                                <AlertTriangle className="size-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-red-500 flex items-center gap-2">
                                    FLOOD WARNING
                                </h3>
                                <p className="text-sm text-slate-300">
                                    High risk at {nextDangerHour?.time}. Prepare to evacuate.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                className="shrink-0 bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30"
                                onClick={() => navigate('/shelters')}
                            >
                                <Shield className="size-4 mr-1" />
                                Shelter
                            </Button>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1 px-5 pb-4 overflow-y-auto">
                {/* Main Risk Card */}
                <Card className={cn(
                    "mb-5 overflow-hidden border-0",
                    riskConfig.bgLight
                )}>
                    <CardContent className="p-0">
                        <div className="flex items-stretch">
                            {/* Risk Circle Section */}
                            <div className={cn(
                                "flex flex-col items-center justify-center p-6 bg-gradient-to-br",
                                riskConfig.gradient
                            )}>
                                <div className="relative size-24">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        <circle
                                            cx="50" cy="50" r="42"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.2)"
                                            strokeWidth="8"
                                        />
                                        <circle
                                            cx="50" cy="50" r="42"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(prediction.hourlyPredictions[0]?.probability || 0) * 2.64} 264`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                        <span className="text-3xl font-bold">{prediction.hourlyPredictions[0]?.probability || 0}</span>
                                        <span className="text-xs opacity-80">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Info Section */}
                            <div className="flex-1 p-5 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{riskConfig.icon}</span>
                                    <h2 className={cn("text-xl font-bold", riskConfig.color)}>
                                        {riskConfig.label}
                                    </h2>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Peak risk expected at <span className="font-semibold text-foreground">{prediction.peakRiskHour}:00</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="size-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                        {dangerHours.length > 0
                                            ? `${dangerHours.length} high-risk hour${dangerHours.length > 1 ? 's' : ''} ahead`
                                            : hasWarning ? 'Moderate conditions expected' : 'Conditions stable'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Weather Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 text-center">
                            <Thermometer className="size-5 mx-auto mb-2 text-orange-400" />
                            <div className="text-lg font-bold">{weather.temp}°C</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Temp</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 text-center">
                            <Droplets className="size-5 mx-auto mb-2 text-blue-400" />
                            <div className="text-lg font-bold">{weather.humidity}%</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Humidity</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 text-center">
                            <Wind className="size-5 mx-auto mb-2 text-slate-400" />
                            <div className="text-lg font-bold">{weather.wind} km/h</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Wind</div>
                        </CardContent>
                    </Card>
                </div>

                {/* 24-Hour Timeline */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="size-4 text-muted-foreground" />
                            24-Hour Forecast
                        </h3>
                        <span className="text-xs text-muted-foreground">Swipe →</span>
                    </div>

                    {/* Timeline Scroll */}
                    <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
                        {prediction.hourlyPredictions.slice(0, 12).map((hour, index) => {
                            const hourConfig = getRiskConfig(hour.riskLevel);
                            const isSelected = selectedHourIndex === index;

                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedHourIndex(index)}
                                    className={cn(
                                        "shrink-0 flex flex-col items-center p-3 rounded-2xl min-w-[72px] transition-all",
                                        isSelected
                                            ? cn("bg-gradient-to-b", hourConfig.gradient, "shadow-lg scale-105")
                                            : "bg-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <span className={cn(
                                        "text-xs mb-2",
                                        isSelected ? "text-white/80" : "text-muted-foreground"
                                    )}>
                                        {hour.time}
                                    </span>

                                    {/* Mini Bar */}
                                    <div className={cn(
                                        "w-3 h-12 rounded-full mb-2 flex items-end overflow-hidden",
                                        isSelected ? "bg-white/20" : "bg-muted"
                                    )}>
                                        <div
                                            className={cn("w-full rounded-full", isSelected ? "bg-white" : hourConfig.bg)}
                                            style={{ height: `${hour.probability}%` }}
                                        />
                                    </div>

                                    <span className={cn(
                                        "text-sm font-bold",
                                        isSelected ? "text-white" : hourConfig.color
                                    )}>
                                        {hour.probability}%
                                    </span>

                                    {hour.riskLevel === 'danger' && !isSelected && (
                                        <div className="size-2 rounded-full bg-red-500 animate-pulse mt-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Hour Detail */}
                {selectedHour && (
                    <Card className={cn("border", selectedRiskConfig.border, selectedRiskConfig.bgLight)}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{selectedRiskConfig.icon}</span>
                                    <div>
                                        <div className="font-semibold">{selectedHour.time}</div>
                                        <div className={cn("text-xs", selectedRiskConfig.color)}>{selectedRiskConfig.label}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={cn("text-2xl font-bold", selectedRiskConfig.color)}>
                                        {selectedHour.probability}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">Flood Risk</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Expected Rainfall</span>
                                    <span className="font-medium">{selectedHour.rainfall} mm</span>
                                </div>
                                <Progress
                                    value={Math.min(selectedHour.rainfall, 100)}
                                    className={cn("h-2", selectedRiskConfig.bgLight)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Action Button */}
            <div className="p-5 pb-[calc(1.25rem+var(--safe-bottom))] bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                <Button
                    className={cn(
                        "w-full h-14 text-base font-semibold rounded-2xl transition-all",
                        hasDanger
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/30"
                            : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-white/10"
                    )}
                    onClick={() => navigate('/shelters')}
                >
                    {hasDanger ? (
                        <>
                            <AlertTriangle className="size-5 mr-2" />
                            Navigate to Shelter Now
                            <ChevronRight className="size-5 ml-auto" />
                        </>
                    ) : (
                        <>
                            <Building2 className="size-5 mr-2" />
                            View Nearby Shelters
                            <ChevronRight className="size-5 ml-auto" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
