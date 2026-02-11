// Home Page - Central hub with all features accessible
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MapPin, AlertTriangle, ChevronRight, Droplets, Wind,
    BarChart3, Building2, MessageCircle, Shield, Sun, CloudRain,
    TrendingUp, Clock
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
        condition: hasDanger ? 'Rainy' : 'Partly Cloudy'
    };

    const getRiskConfig = (level: string) => {
        switch (level) {
            case 'danger': return { color: 'text-red-400', bg: 'bg-red-500/15', icon: '🔴', label: 'High Risk' };
            case 'warning': return { color: 'text-amber-400', bg: 'bg-amber-500/15', icon: '🟡', label: 'Moderate' };
            default: return { color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: '🟢', label: 'Low Risk' };
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

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pb-24">
            {/* Header */}
            <header className="px-6 pt-[calc(1.5rem+var(--safe-top))] pb-2">
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Hello! 👋
                        </h1>
                        <p className="text-slate-400 text-sm mt-0.5">Stay safe, stay prepared</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/10 text-white border-0 px-3 py-1.5">
                            <MapPin className="size-3 mr-1.5 text-blue-400" />
                            {selectedLocation?.name || 'Kuala Lumpur'}
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-5 overflow-y-auto">
                {/* Danger Alert - High Priority */}
                {hasDanger && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/20 via-red-600/15 to-red-500/10 border border-red-500/30 p-4 mb-5 animate-fade-in">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
                        <div className="relative flex items-center gap-4">
                            <div className="size-14 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/30">
                                <AlertTriangle className="size-7 text-white animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-red-400 text-sm flex items-center gap-2">
                                    ⚠️ FLOOD WARNING
                                </h3>
                                <p className="text-xs text-slate-300 mt-0.5">
                                    High risk at {nextDangerHour?.time || '14:00'}. Prepare to evacuate.
                                </p>
                            </div>
                        </div>
                        <Button
                            className="w-full mt-3 bg-red-500 hover:bg-red-400 text-white font-semibold h-11 rounded-xl shadow-lg shadow-red-500/30"
                            onClick={() => navigate('/shelters')}
                        >
                            <Shield className="size-4 mr-2" />
                            Go to Nearby Shelter
                            <ChevronRight className="size-4 ml-auto" />
                        </Button>
                    </div>
                )}

                {/* Weather + Risk Row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {/* Weather Card */}
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                {hasDanger ? (
                                    <CloudRain className="size-5 text-blue-400" />
                                ) : (
                                    <Sun className="size-5 text-amber-400" />
                                )}
                                <span className="text-xs text-slate-400">{weather.condition}</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{weather.temp}°</div>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Droplets className="size-3 text-blue-400" /> {weather.humidity}%
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Wind className="size-3" /> {weather.wind}km/h
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Level Card */}
                    <Card className={cn(
                        "overflow-hidden border",
                        hasDanger ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                    )}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className={cn("size-5", risk.color)} />
                                <span className="text-xs text-slate-400">Flood Risk</span>
                            </div>
                            <div className={cn("text-3xl font-bold", risk.color)}>
                                {currentProbability}%
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg">{risk.icon}</span>
                                <span className={cn("text-xs font-medium", risk.color)}>
                                    {risk.label}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mini Forecast Preview */}
                {prediction && (
                    <Card className="bg-white/5 border-white/10 mb-5 overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2 text-white">
                                    <Clock className="size-4 text-blue-400" />
                                    Next 6 Hours
                                </h3>
                                <button
                                    className="text-xs text-blue-400 font-medium flex items-center gap-1"
                                    onClick={() => navigate('/forecast')}
                                >
                                    View All <ChevronRight className="size-3" />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {prediction.hourlyPredictions.slice(0, 6).map((hour, i) => {
                                    const config = getRiskConfig(hour.riskLevel);
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                            <span className="text-[10px] text-slate-500">{hour.time}</span>
                                            <div className="w-3 h-10 rounded-full bg-white/5 flex items-end overflow-hidden">
                                                <div
                                                    className={cn("w-full rounded-full",
                                                        hour.riskLevel === 'danger' ? 'bg-red-500' :
                                                            hour.riskLevel === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
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
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions Grid */}
                <div className="mb-5">
                    <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {features.map((feature, index) => (
                            <button
                                key={index}
                                onClick={feature.action}
                                className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 text-left transition-all duration-300 hover:bg-white/8 hover:border-white/15 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className={cn(
                                    "size-12 flex items-center justify-center rounded-2xl bg-gradient-to-br text-white mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110",
                                    feature.color,
                                    feature.shadow
                                )}>
                                    {feature.icon}
                                </div>
                                <h4 className="font-semibold text-white text-sm">{feature.label}</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">{feature.sublabel}</p>
                                {(feature.label === 'Reports' || feature.label === 'Chat') && (
                                    <Badge className="absolute top-3 right-3 bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px] px-1.5 py-0.5">
                                        Soon
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Safety Tips */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10 mb-5">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="size-10 flex items-center justify-center bg-blue-500/20 rounded-xl shrink-0">
                                <Shield className="size-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm">Safety Tip</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    Always keep emergency supplies ready. Know your nearest shelter location and the safest route to reach it.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
