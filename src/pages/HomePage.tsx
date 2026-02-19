// Home Page - Survival Dashboard / Command Center
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MapPin, AlertTriangle, ChevronRight, CloudRain,
    Video, Shield, Navigation, Users, Activity,
    Timer, AlertOctagon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function HomePage() {
    const navigate = useNavigate();
    const { selectedLocation, prediction } = useApp();

    // Determine state based on prediction or default to safe
    const hasDanger = prediction?.hourlyPredictions?.some(p => p.riskLevel === 'danger') || false;

    // Countdown Timer Logic
    const [timeLeft, setTimeLeft] = useState('02:15:00');

    useEffect(() => {
        // Simple countdown simulation
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const [h, m, s] = prev.split(':').map(Number);
                let totalSeconds = h * 3600 + m * 60 + s - 1;
                if (totalSeconds < 0) totalSeconds = 2 * 3600 + 15 * 60; // Reset loop

                const nh = Math.floor(totalSeconds / 3600);
                const nm = Math.floor((totalSeconds % 3600) / 60);
                const ns = totalSeconds % 60;
                return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')}`;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Rain Gauge Data (Simulated)
    const rainData = [30, 45, 60, 50, 80, 95, 80, 60, 40, 20];
    const maxRain = 100;

    return (
        <div className="min-h-dvh flex flex-col bg-slate-950 font-sans text-slate-100 overflow-x-hidden selection:bg-blue-500/30 pb-24">
            {/* Background Effects - Tech Grid & Glow */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
            <div className={cn(
                "fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] opacity-30 pointer-events-none transition-colors duration-1000",
                hasDanger ? "from-red-500/30 via-transparent to-transparent" : "from-emerald-500/20 via-transparent to-transparent"
            )} />

            {/* Header */}
            <header className="px-6 pt-[calc(1.5rem+var(--safe-top))] pb-4 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            FloodWay
                            {hasDanger && <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>}
                        </h1>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Command Center</p>
                    </div>
                    <Badge variant="outline" className="bg-slate-900/50 text-slate-300 border-white/10 px-3 py-1 gap-1.5 transition-colors backdrop-blur-md shadow-sm">
                        <MapPin className="size-3 text-blue-400" />
                        {selectedLocation?.name || 'Kuala Lumpur'}
                    </Badge>
                </div>
            </header>

            <main className="flex-1 px-5 py-4 overflow-y-auto space-y-4 relative z-10">

                {/* 1. STATUS HEADER (Immediate Value) */}
                <div className={cn(
                    "relative overflow-hidden rounded-[2rem] p-6 transition-all duration-700 shadow-2xl group border select-none",
                    hasDanger
                        ? "bg-gradient-to-br from-red-600 via-red-700 to-red-900 shadow-red-900/50 border-red-500/30 ring-1 ring-red-400/20"
                        : "bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 shadow-emerald-900/50 border-emerald-500/30 ring-1 ring-emerald-400/20"
                )}>
                    {/* Animated background noise */}
                    <div className="absolute inset-0 bg-white/5 opacity-20 mix-blend-overlay" />
                    <div className="absolute -right-20 -top-20 size-60 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/15 transition-all duration-1000" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn(
                                "size-10 rounded-xl flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 shadow-inner",
                                hasDanger ? "animate-pulse" : ""
                            )}>
                                {hasDanger ? <AlertTriangle className="size-6 text-white drop-shadow" /> : <Shield className="size-6 text-white drop-shadow" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">System Status</span>
                                <div className="h-0.5 w-12 bg-white/20 mt-1 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/60 w-3/4" />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-white leading-none tracking-tight mb-2 drop-shadow-md">
                            {hasDanger ? "CRITICAL WARNING" : "You are Safe"}
                        </h2>
                        <p className="text-white/90 text-sm font-medium leading-relaxed max-w-[90%] text-shadow-sm">
                            {hasDanger
                                ? `Flood predicted in 2 hours. Immediate evacuation required.`
                                : `No floods predicted in KL for the next 24h.`}
                        </p>
                    </div>
                </div>

                {/* 2. BENTO GRID (Data & Analytics) */}
                <div className="grid grid-cols-2 gap-3">

                    {/* Block A: The Countdown (Innovation) */}
                    <Card className={cn(
                        "col-span-2 bg-slate-900/80 border-white/5 backdrop-blur-xl shadow-xl overflow-hidden relative group rounded-3xl ring-1 ring-white/5",
                        hasDanger ? "border-amber-500/30 shadow-amber-900/20" : ""
                    )}>
                        <CardContent className="p-5 flex flex-col items-center justify-center text-center relative z-10 min-h-[140px]">
                            {hasDanger ? (
                                <>
                                    <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity">
                                        <Timer className="size-16 text-white" />
                                    </div>
                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-2 animate-pulse">
                                        <span className="relative flex size-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full size-2 bg-amber-500"></span>
                                        </span>
                                        Impact Countdown
                                    </span>
                                    <div className="text-6xl font-black text-white tabular-nums tracking-tighter my-2 font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                                        {timeLeft}
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">Time until water reaches critical level</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between w-full mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex size-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                                            </div>
                                            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                                Monitoring Active
                                            </div>
                                        </div>
                                        <Activity className="size-4 text-emerald-500/50" />
                                    </div>
                                    <div className="flex overflow-hidden w-full divide-x divide-white/10">
                                        <div className="flex-1 px-4 text-left">
                                            <div className="text-4xl font-black text-white leading-none">14</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Safe Days</div>
                                        </div>
                                        <div className="flex-1 px-4 text-right">
                                            <div className="text-4xl font-black text-white leading-none">0<span className="text-xl">%</span></div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Current Risk</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>


                    {/* Block B: Live River Cam (Trust) */}
                    <Card className="col-span-1 bg-black border-white/10 overflow-hidden relative h-40 group rounded-3xl shadow-lg ring-1 ring-white/5">
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shadow-sm">
                            <span className="relative flex size-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-1.5 bg-red-500"></span>
                            </span>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Live Feed</span>
                        </div>

                        {/* Simulated CCTV Fee */}
                        <div className="absolute inset-0 bg-slate-900">
                            <img
                                src="/cctv%20image.jpg"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-110"
                                alt="River CCTV"
                            />
                            {/* Scanline / Glitch Overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                            {/* Water Level Line Overlay */}
                            <div className="absolute top-[65%] left-0 right-0 border-t border-blue-400/80 border-dashed z-20 flex items-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                <span className="ml-1 text-[8px] font-bold text-blue-100 bg-blue-500/80 px-1.5 py-0.5 rounded backdrop-blur-sm">Water Level</span>
                            </div>
                        </div>

                        <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                            <Video className="size-8 text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300" />
                        </div>
                    </Card>

                    {/* Block C: Rain Gauge (Analytics) */}
                    <Card className="col-span-1 bg-slate-900/80 border-white/5 backdrop-blur-xl overflow-hidden flex flex-col h-40 rounded-3xl ring-1 ring-white/5">
                        <CardContent className="p-4 flex-1 flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rainfall</span>
                                <CloudRain className="size-3.5 text-blue-400" />
                            </div>

                            <div className="flex-1 flex items-end justify-between gap-1 pb-1">
                                {rainData.map((val, i) => (
                                    <div key={i} className="relative w-full h-full flex items-end group/bar">
                                        <div
                                            className="w-full rounded-t-sm bg-blue-500/40 group-hover/bar:bg-blue-400 transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                            style={{ height: `${(val / maxRain) * 100}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] text-blue-200 font-bold mt-1 text-center bg-blue-500/10 py-1 rounded border border-blue-500/20">
                                Warning @ 4 PM
                            </p>
                        </CardContent>
                    </Card>

                    {/* Block D: Community Status (Social Proof) */}
                    <Card className="col-span-2 bg-slate-900/80 border-white/5 backdrop-blur-xl shadow-lg rounded-3xl group cursor-pointer hover:bg-slate-800/80 transition-all ring-1 ring-white/5"
                        onClick={() => navigate('/reports')}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                <Users className="size-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-white mb-0.5 group-hover:text-purple-300 transition-colors">Community Reports</h3>
                                <p className="text-xs text-slate-400">
                                    <span className="text-purple-300 font-bold">12 verified reports</span> near you
                                </p>
                            </div>
                            <div className="size-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <ChevronRight className="size-4 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. BOTTOM ACTION DOCK (Conversion) */}
                <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Report Flood - Big Red Button */}
                        <Button
                            className="h-16 rounded-[1.25rem] bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-0 shadow-lg shadow-red-900/30 active:scale-95 transition-all duration-200 group relative overflow-hidden"
                            onClick={() => navigate('/reports')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center mr-3 group-hover:bg-white/30 backdrop-blur-sm transition-colors">
                                <AlertOctagon className="size-5 text-white" />
                            </div>
                            <span className="text-base font-bold text-white tracking-wide">Report Flood</span>
                        </Button>

                        {/* Navigate to Shelter - Blue Button */}
                        <Button
                            className="h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-0 shadow-lg shadow-blue-900/30 active:scale-95 transition-all duration-200 group relative overflow-hidden"
                            onClick={() => navigate('/shelters')}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center mr-3 group-hover:bg-white/30 backdrop-blur-sm transition-colors">
                                <Navigation className="size-5 text-white fill-current" />
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <span className="text-[10px] font-bold text-blue-100 uppercase leading-none mb-0.5">Navigate to</span>
                                <span className="text-lg font-black text-white leading-none">Shelter</span>
                            </div>
                        </Button>
                    </div>
                </div>

            </main>
        </div>
    );
}
