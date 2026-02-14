// Home Page - Central hub with all features accessible
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MapPin, AlertTriangle, ChevronRight, Droplets, Wind,
    BarChart3, Building2, MessageCircle, Shield, Sun,
    TrendingUp, Clock, CloudLightning
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function HomePage() {
    const navigate = useNavigate();
    const { selectedLocation, prediction } = useApp();

    const hasDanger = prediction?.hourlyPredictions?.some(p => p.riskLevel === 'danger') || false;
    const currentProbability = prediction?.hourlyPredictions?.[0]?.probability || 0;
    const nextDangerHour = prediction?.hourlyPredictions?.find(p => p.riskLevel === 'danger');

    // Simulated weather
    const weather = {
        temp: 29,
        humidity: 82,
        wind: 12,
        condition: hasDanger ? 'Stormy' : 'Partly Cloudy'
    };

    const getRiskConfig = (level: string) => {
        switch (level) {
            case 'danger': return { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', icon: '🔴', label: 'High Risk', gradient: 'from-red-500 to-red-600' };
            case 'warning': return { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: '🟡', label: 'Moderate', gradient: 'from-amber-500 to-orange-500' };
            default: return { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', icon: '🟢', label: 'Low Risk', gradient: 'from-emerald-500 to-emerald-600' };
        }
    };

    const risk = getRiskConfig(prediction?.overallRisk || 'safe');

    // Quick action features
    const features = [
        {
            icon: <BarChart3 className="size-6" />,
            label: 'Forecast',
            sublabel: '24-hour view',
            color: 'from-blue-500 to-blue-600',
            shadow: 'shadow-blue-500/25',
            action: () => navigate('/forecast')
        },
        {
            icon: <Building2 className="size-6" />,
            label: 'Shelters',
            sublabel: 'Find nearby',
            color: 'from-emerald-500 to-emerald-600',
            shadow: 'shadow-emerald-500/25',
            action: () => navigate('/shelters')
        },
        {
            icon: <MapPin className="size-6" />,
            label: 'Reports',
            sublabel: 'Coming soon',
            color: 'from-purple-500 to-purple-600',
            shadow: 'shadow-purple-500/25',
            action: () => navigate('/reports')
        },
        {
            icon: <MessageCircle className="size-6" />,
            label: 'Chat',
            sublabel: 'Coming soon',
            color: 'from-orange-500 to-orange-600',
            shadow: 'shadow-orange-500/25',
            action: () => navigate('/chat')
        }
    ];

    // Generate simple SVG path for the sparkline
    const getSparklinePath = () => {
        if (!prediction) return '';
        const hours = prediction.hourlyPredictions;
        const points = hours.map((h, i) => {
            const x = (i / (hours.length - 1)) * 100;
            const y = 100 - h.probability;
            return `${x},${y}`;
        });
        return `M0,100 L0,${100 - (prediction.hourlyPredictions[0]?.probability || 0)} L${points.join(' ')} L100,100 Z`;
    };



    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-24 font-sans text-slate-100">
            {/* Header */}
            <header className="px-6 pt-[calc(1.5rem+var(--safe-top))] pb-4 sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            FloodWay
                        </h1>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Dashboard</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1.5 transition-colors gap-1.5">
                            <MapPin className="size-3 text-blue-400" />
                            {selectedLocation?.name || 'Kuala Lumpur'}
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-5 py-6 overflow-y-auto space-y-6">
                {/* Danger Alert - High Priority */}
                {hasDanger && (
                    <div className="relative overflow-hidden rounded-3xl bg-red-600 text-white shadow-2xl shadow-red-900/40 animate-fade-in group">
                        <div className="absolute -right-10 -top-10 size-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />

                        <div className="relative p-5">
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                                    <AlertTriangle className="size-6 text-white animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg leading-tight mb-1">Flood Warning</h3>
                                    <p className="text-red-100 text-sm leading-relaxed opacity-90">
                                        Critical water levels predicted at <span className="font-bold border-b border-white/30">{nextDangerHour?.time || '14:00'}</span>. Immediate action required.
                                    </p>
                                </div>
                            </div>

                            <Button
                                className="w-full mt-5 bg-white text-red-600 hover:bg-white/90 font-bold h-12 rounded-xl shadow-lg border-0 transition-transform active:scale-[0.98]"
                                onClick={() => navigate('/shelters')}
                            >
                                <Shield className="size-4 mr-2 fill-current" />
                                Find Emergency Shelters
                                <ChevronRight className="size-4 ml-auto opacity-50" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Live Risk Card */}
                    <Card className={cn(
                        "col-span-2 md:col-span-1 overflow-hidden border-0 relative shadow-xl min-h-[140px]",
                        risk.bg
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                        {/* Sparkline background */}
                        <div className="absolute inset-x-0 bottom-0 h-24 opacity-20 pointer-events-none">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                                <path d={getSparklinePath()} fill="currentColor" className={risk.color} />
                            </svg>
                        </div>

                        <CardContent className="p-5 relative z-10">
                            <div className="flex justify-between items-center mb-1">
                                <span className={cn("text-xs font-bold uppercase tracking-wider opacity-80", risk.color)}>Current Risk</span>
                                <TrendingUp className={cn("size-4 opacity-80", risk.color)} />
                            </div>
                            <div className="flex items-baseline gap-1.5 mb-2">
                                <span className={cn("text-5xl font-black tracking-tighter", risk.color)}>{currentProbability}</span>
                                <span className={cn("text-xl font-bold opacity-60", risk.color)}>%</span>
                            </div>
                            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-slate-950/20 backdrop-blur-sm", risk.color, risk.border)}>
                                {risk.icon} {risk.label}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weather Stats */}
                    <div className="grid grid-rows-2 gap-3 col-span-2 md:col-span-1">
                        <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-400 font-medium mb-0.5">Temperature</div>
                                    <div className="text-2xl font-bold text-white">{weather.temp}°<span className="text-base font-normal text-slate-500">C</span></div>
                                </div>
                                <div className={cn("size-10 rounded-full flex items-center justify-center", hasDanger ? "bg-blue-500/10" : "bg-orange-500/10")}>
                                    {hasDanger ? (
                                        <CloudLightning className="size-5 text-blue-400" />
                                    ) : (
                                        <Sun className="size-5 text-orange-400" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                                <CardContent className="p-3 flex flex-col justify-center h-full">
                                    <Droplets className="size-4 text-blue-400 mb-2" />
                                    <div className="text-lg font-bold text-white">{weather.humidity}%</div>
                                    <div className="text-[10px] text-slate-500">Humidity</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                                <CardContent className="p-3 flex flex-col justify-center h-full">
                                    <Wind className="size-4 text-emerald-400 mb-2" />
                                    <div className="text-lg font-bold text-white">{weather.wind}</div>
                                    <div className="text-[10px] text-slate-500">km/h</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Hourly Forecast */}
                {prediction && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Clock className="size-4 text-blue-400" />
                                Forecast
                            </h3>
                            <button
                                className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-0.5"
                                onClick={() => navigate('/forecast')}
                            >
                                Details <ChevronRight className="size-3" />
                            </button>
                        </div>

                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 overflow-x-auto scrollbar-hide">
                            <div className="flex gap-4 min-w-max">
                                {prediction.hourlyPredictions.map((hour, i) => {
                                    const config = getRiskConfig(hour.riskLevel);
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-3 w-12 group">
                                            <span className="text-[10px] text-slate-400 font-medium">{hour.time}</span>

                                            <div className="w-2 h-20 rounded-full bg-white/5 flex items-end overflow-hidden relative">
                                                {/* Background track */}
                                                <div className="absolute inset-0 bg-white/5" />

                                                {/* Fill bar */}
                                                <div
                                                    className={cn(
                                                        "w-full rounded-full transition-all duration-1000 group-hover:opacity-100",
                                                        hour.riskLevel === 'danger' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                            hour.riskLevel === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                                                    )}
                                                    style={{ height: `${hour.probability}%` }}
                                                />
                                            </div>

                                            <span className={cn("text-[10px] font-bold", config.color)}>
                                                {hour.probability}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Validated Quick Actions */}
                <div className="grid grid-cols-2 gap-3 pb-8">
                    {features.map((feature, index) => (
                        <button
                            key={index}
                            onClick={feature.action}
                            className="relative group overflow-hidden rounded-2xl bg-slate-900 border border-white/5 p-4 text-left transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:bg-slate-800"
                        >
                            <div className={cn(
                                "size-10 flex items-center justify-center rounded-xl text-white mb-3 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                "bg-gradient-to-br",
                                feature.color,
                                feature.shadow
                            )}>
                                {feature.icon}
                            </div>
                            <h4 className="font-bold text-white text-sm tracking-tight">{feature.label}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">{feature.sublabel}</p>

                            {(feature.label === 'Reports' || feature.label === 'Chat') && (
                                <Badge className="absolute top-3 right-3 bg-white/5 text-purple-300 border-0 text-[9px] px-1.5 py-0.5 pointer-events-none">
                                    Soon
                                </Badge>
                            )}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
