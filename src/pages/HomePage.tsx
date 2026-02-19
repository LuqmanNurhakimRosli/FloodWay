// Home Page - Personalized Intelligence Dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MapPin, AlertTriangle, ChevronRight, ChevronDown, ChevronUp,
    CloudRain, Shield, Navigation, Users, Activity,
    Timer, AlertOctagon, Zap, CheckCircle2, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── AI Action Script (Smart Checklist) ──
const ACTION_ITEMS_DANGER = [
    { icon: '⚡', text: 'Unplug all electronics & appliances', priority: 'critical' },
    { icon: '🚗', text: 'Move your car to higher ground NOW', priority: 'critical' },
    { icon: '💊', text: 'Pack 3 days of medications & documents', priority: 'high' },
    { icon: '📱', text: 'Charge your phone to 100%', priority: 'high' },
    { icon: '🎒', text: 'Prepare emergency bag (water, food, torch)', priority: 'medium' },
    { icon: '👨‍👩‍👧', text: 'Alert your family & neighbors', priority: 'medium' },
];

const ACTION_ITEMS_SAFE = [
    { icon: '✅', text: 'No action required — area is safe', priority: 'info' },
    { icon: '📡', text: 'Sensors are actively monitoring your area', priority: 'info' },
    { icon: '🔔', text: 'You\'ll be notified instantly if risk changes', priority: 'info' },
];

export function HomePage() {
    const navigate = useNavigate();
    const { selectedLocation, prediction, floodReports } = useApp();

    const hasDanger = prediction?.hourlyPredictions?.some(p => p.riskLevel === 'danger') || false;
    const hasWarning = prediction?.hourlyPredictions?.some(p => p.riskLevel === 'warning') || false;

    // Determine traffic light status
    const status: 'green' | 'yellow' | 'red' = hasDanger ? 'red' : hasWarning ? 'yellow' : 'green';

    // Progressive Disclosure toggle
    const [showTechnical, setShowTechnical] = useState(false);
    const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set());

    // Countdown Timer Logic
    const [timeLeft, setTimeLeft] = useState('02:15:00');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const [h, m, s] = prev.split(':').map(Number);
                let totalSeconds = h * 3600 + m * 60 + s - 1;
                if (totalSeconds < 0) totalSeconds = 2 * 3600 + 15 * 60;

                const nh = Math.floor(totalSeconds / 3600);
                const nm = Math.floor((totalSeconds % 3600) / 60);
                const ns = totalSeconds % 60;
                return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')}`;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulated safety score
    const safetyScore = hasDanger ? 23 : hasWarning ? 61 : 94;

    // Rain Gauge Data (Simulated)
    const rainData = [30, 45, 60, 50, 80, 95, 80, 60, 40, 20];
    const maxRain = 100;

    const toggleAction = (idx: number) => {
        setCheckedActions(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    // Human language messages
    const statusConfig = {
        green: {
            title: 'You are Safe',
            subtitle: 'No flood threat detected in your area for the next 24 hours.',
            actionText: 'No action needed — stay informed.',
            gradient: 'from-emerald-600 via-emerald-700 to-emerald-900',
            shadow: 'shadow-emerald-900/50',
            border: 'border-emerald-500/30',
            ring: 'ring-emerald-400/20',
            glow: 'from-emerald-500/20 via-transparent to-transparent',
            icon: <Shield className="size-7 text-white drop-shadow" />,
            dotColor: 'bg-emerald-500',
            dotPing: 'bg-emerald-400',
        },
        yellow: {
            title: 'Stay Alert',
            subtitle: 'Heavy rain expected — be ready to move your car and prepare.',
            actionText: 'Heavy rain expected; prepare your emergency bag.',
            gradient: 'from-amber-500 via-amber-600 to-amber-800',
            shadow: 'shadow-amber-900/50',
            border: 'border-amber-500/30',
            ring: 'ring-amber-400/20',
            glow: 'from-amber-500/25 via-transparent to-transparent',
            icon: <AlertTriangle className="size-7 text-white drop-shadow" />,
            dotColor: 'bg-amber-500',
            dotPing: 'bg-amber-400',
        },
        red: {
            title: 'Evacuate Now',
            subtitle: 'Flood predicted in 2 hours. Move to higher ground immediately.',
            actionText: 'Immediate evacuation required.',
            gradient: 'from-red-600 via-red-700 to-red-900',
            shadow: 'shadow-red-900/50',
            border: 'border-red-500/30',
            ring: 'ring-red-400/20',
            glow: 'from-red-500/30 via-transparent to-transparent',
            icon: <AlertTriangle className="size-7 text-white drop-shadow animate-pulse" />,
            dotColor: 'bg-red-500',
            dotPing: 'bg-red-400',
        },
    };

    const cfg = statusConfig[status];
    const actionItems = hasDanger ? ACTION_ITEMS_DANGER : ACTION_ITEMS_SAFE;
    const verifiedReportCount = floodReports.filter(r => {
        const aiOk = r.aiResult?.status === 'VERIFIED';
        const humanOk = r.humanReview?.status === 'APPROVED' || r.humanReview?.status === 'OVERRIDDEN';
        return aiOk || humanOk;
    }).length;

    return (
        <div className="min-h-dvh flex flex-col bg-slate-950 font-sans text-slate-100 overflow-x-hidden selection:bg-blue-500/30 pb-24">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none" />
            <div className={cn(
                "fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] opacity-30 pointer-events-none transition-colors duration-1000",
                cfg.glow
            )} />

            {/* Header */}
            <header className="px-6 pt-[calc(1.5rem+var(--safe-top))] pb-4 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            FloodWay
                            <span className="relative flex h-2 w-2">
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", cfg.dotPing)}></span>
                                <span className={cn("relative inline-flex rounded-full h-2 w-2", cfg.dotColor)}></span>
                            </span>
                        </h1>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Intelligence Dashboard</p>
                    </div>
                    <Badge variant="outline" className="bg-slate-900/50 text-slate-300 border-white/10 px-3 py-1 gap-1.5 transition-colors backdrop-blur-md shadow-sm">
                        <MapPin className="size-3 text-blue-400" />
                        {selectedLocation?.name || 'Kuala Lumpur'}
                    </Badge>
                </div>
            </header>

            <main className="flex-1 px-5 py-4 overflow-y-auto space-y-4 relative z-10">

                {/* ═══════════════════════════════════════════════════════════
                    1. TRAFFIC LIGHT STATUS HEADER (The "One Glance" Card)
                   ═══════════════════════════════════════════════════════════ */}
                <div className={cn(
                    "relative overflow-hidden rounded-[2rem] p-6 transition-all duration-700 shadow-2xl group border select-none",
                    `bg-gradient-to-br ${cfg.gradient} ${cfg.shadow} ${cfg.border} ring-1 ${cfg.ring}`
                )}>
                    <div className="absolute inset-0 bg-white/5 opacity-20 mix-blend-overlay" />
                    <div className="absolute -right-20 -top-20 size-60 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/15 transition-all duration-1000" />

                    <div className="relative z-10">
                        {/* Traffic Light Indicator */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn(
                                "size-12 rounded-2xl flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 shadow-inner",
                                hasDanger ? "animate-pulse" : ""
                            )}>
                                {cfg.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Your Status</span>
                                {/* Traffic light dots */}
                                <div className="flex gap-1.5 mt-1">
                                    <div className={cn("size-2.5 rounded-full border border-white/30", status === 'green' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-white/10")} />
                                    <div className={cn("size-2.5 rounded-full border border-white/30", status === 'yellow' ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-white/10")} />
                                    <div className={cn("size-2.5 rounded-full border border-white/30", status === 'red' ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" : "bg-white/10")} />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-white leading-none tracking-tight mb-2 drop-shadow-md">
                            {cfg.title}
                        </h2>
                        {/* Human language subtitle */}
                        <p className="text-white/90 text-sm font-medium leading-relaxed max-w-[90%]">
                            {cfg.subtitle}
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    2. PERSONALIZED SAFETY SCORE + COUNTDOWN
                   ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-2 gap-3">

                    {/* Safety Score Card */}
                    <Card className="col-span-1 bg-slate-900/80 border-white/5 backdrop-blur-xl shadow-xl overflow-hidden rounded-3xl ring-1 ring-white/5">
                        <CardContent className="p-5 flex flex-col items-center justify-center text-center min-h-[140px]">
                            <div className="flex items-center gap-1.5 mb-3">
                                <Zap className="size-3.5 text-cyan-400" />
                                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Safety Score</span>
                            </div>
                            {/* Circular Score */}
                            <div className="relative size-20 mb-2">
                                <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                                    <circle
                                        cx="40" cy="40" r="34" fill="none"
                                        stroke={safetyScore > 70 ? '#22c55e' : safetyScore > 40 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="6" strokeLinecap="round"
                                        strokeDasharray={`${(safetyScore / 100) * 213.6} 213.6`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-black text-white">{safetyScore}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {safetyScore > 70 ? 'Your area is safe' : safetyScore > 40 ? 'Moderate risk nearby' : 'High risk — act now'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Impact Countdown / Monitoring Card */}
                    <Card className={cn(
                        "col-span-1 bg-slate-900/80 border-white/5 backdrop-blur-xl shadow-xl overflow-hidden rounded-3xl ring-1 ring-white/5",
                        hasDanger ? "border-amber-500/30 shadow-amber-900/20" : ""
                    )}>
                        <CardContent className="p-5 flex flex-col items-center justify-center text-center min-h-[140px] relative">
                            {hasDanger ? (
                                <>
                                    <div className="absolute top-3 right-3 opacity-20">
                                        <Timer className="size-10 text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-2 animate-pulse">
                                        <span className="relative flex size-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full size-2 bg-amber-500"></span>
                                        </span>
                                        Impact In
                                    </span>
                                    <div className="text-4xl font-black text-white tabular-nums tracking-tighter my-2 font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                                        {timeLeft}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">Water reaches critical level</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="relative flex size-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-4xl font-black text-white leading-none">24<span className="text-lg text-slate-400">h</span></div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clear Forecast</div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                        <Activity className="size-3 text-emerald-500/60" />
                                        <span className="text-[9px] text-emerald-500/80 font-semibold">All sensors online</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    3. AI ACTION SCRIPT (Smart Checklist)
                   ═══════════════════════════════════════════════════════════ */}
                <Card className="bg-slate-900/80 border-white/5 backdrop-blur-xl rounded-3xl ring-1 ring-white/5 overflow-hidden">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "size-8 rounded-xl flex items-center justify-center",
                                    hasDanger ? "bg-red-500/15 border border-red-500/20" : "bg-emerald-500/15 border border-emerald-500/20"
                                )}>
                                    {hasDanger
                                        ? <AlertOctagon className="size-4 text-red-400" />
                                        : <CheckCircle2 className="size-4 text-emerald-400" />
                                    }
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">
                                        {hasDanger ? 'AI Action Script' : 'Status Summary'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        {hasDanger
                                            ? 'Personalized steps based on your location'
                                            : 'Your area is being monitored'}
                                    </p>
                                </div>
                            </div>
                            {hasDanger && (
                                <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-[9px] font-bold">
                                    {checkedActions.size}/{ACTION_ITEMS_DANGER.length} Done
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-2">
                            {actionItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => hasDanger && toggleAction(idx)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                                        hasDanger ? "hover:bg-white/5 cursor-pointer" : "cursor-default",
                                        checkedActions.has(idx) ? "bg-white/5 opacity-50" : ""
                                    )}
                                >
                                    {hasDanger ? (
                                        <div className={cn(
                                            "size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                                            checkedActions.has(idx)
                                                ? "bg-emerald-500 border-emerald-500"
                                                : item.priority === 'critical'
                                                    ? "border-red-400/60"
                                                    : "border-white/20"
                                        )}>
                                            {checkedActions.has(idx) && <CheckCircle2 className="size-3 text-white" />}
                                        </div>
                                    ) : (
                                        <span className="text-base">{item.icon}</span>
                                    )}
                                    <span className={cn(
                                        "text-xs font-medium flex-1",
                                        checkedActions.has(idx) ? "line-through text-slate-500" : "text-slate-200"
                                    )}>
                                        {hasDanger && <span className="text-base mr-2">{item.icon}</span>}
                                        {item.text}
                                    </span>
                                    {hasDanger && item.priority === 'critical' && !checkedActions.has(idx) && (
                                        <Badge className="bg-red-500/20 text-red-400 border-0 text-[8px] font-bold px-1.5 py-0.5">
                                            URGENT
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* ═══════════════════════════════════════════════════════════
                    4. PROGRESSIVE DISCLOSURE — Technical Details
                   ═══════════════════════════════════════════════════════════ */}
                <button
                    onClick={() => setShowTechnical(!showTechnical)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-900/50 border border-white/5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
                    id="toggle-technical-btn"
                >
                    <Eye className="size-3.5" />
                    {showTechnical ? 'Hide Technical Data' : 'Show Technical Data'}
                    {showTechnical ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>

                {showTechnical && (
                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">

                        {/* CCTV Snapshot with AI Water Line */}
                        <Card className="col-span-1 bg-black border-white/10 overflow-hidden relative h-40 group rounded-3xl shadow-lg ring-1 ring-white/5">
                            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shadow-sm">
                                <span className="relative flex size-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full size-1.5 bg-red-500"></span>
                                </span>
                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">Live Feed</span>
                            </div>

                            <div className="absolute inset-0 bg-slate-900">
                                <img
                                    src="/cctv%20image.jpg"
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-110"
                                    alt="River CCTV"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                                {/* AI Water Level Line */}
                                <div className="absolute top-[65%] left-0 right-0 z-20">
                                    <div className="border-t-2 border-cyan-400/90 border-dashed shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
                                    <div className="flex justify-between items-start px-1.5 mt-0.5">
                                        <span className="text-[7px] font-bold text-cyan-100 bg-cyan-500/80 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                            AI: Water 0.3m
                                        </span>
                                        <span className="text-[7px] font-bold text-white/60">
                                            Safe ↓
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Rain Gauge */}
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
                                    {hasDanger ? '⚠️ Heavy rain @ 4 PM' : '🌤️ Light drizzle expected'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    5. COMMUNITY REPORTS (Social Proof)
                   ═══════════════════════════════════════════════════════════ */}
                <Card className="bg-slate-900/80 border-white/5 backdrop-blur-xl shadow-lg rounded-3xl group cursor-pointer hover:bg-slate-800/80 transition-all ring-1 ring-white/5"
                    onClick={() => navigate('/reports')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                            <Users className="size-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white mb-0.5 group-hover:text-purple-300 transition-colors">Community Reports</h3>
                            <p className="text-xs text-slate-400">
                                <span className="text-purple-300 font-bold">{verifiedReportCount || 12} verified reports</span> near you
                            </p>
                        </div>
                        <div className="size-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <ChevronRight className="size-4 text-slate-400" />
                        </div>
                    </CardContent>
                </Card>

                {/* ═══════════════════════════════════════════════════════════
                    6. BOTTOM ACTION DOCK
                   ═══════════════════════════════════════════════════════════ */}
                <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Report Flood */}
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

                        {/* Navigate to Shelter */}
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
