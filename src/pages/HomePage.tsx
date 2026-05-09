// Home Page — FloodWay Intelligence Dashboard
// Blue / White / Black · Human-centric map-inspired design
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import {
    MapPin, AlertTriangle, ChevronRight, ChevronDown, ChevronUp,
    CloudRain, Shield, Navigation, Users, Activity,
    Timer, AlertOctagon, Zap, CheckCircle2, Eye, Waves
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '../components/UserAvatar';
import { WhatsAppAlertBanner } from '../components/WhatsAppAlertBanner';

// ── Demo smart checklist items ──
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
    { icon: '🔔', text: "You'll be notified instantly if risk changes", priority: 'info' },
];

// ── Rain bar data ──
const RAIN_DATA = [30, 45, 60, 50, 80, 95, 80, 60, 40, 20];

export function HomePage() {
    const navigate = useNavigate();
    const { selectedLocation, prediction, floodReports } = useApp();

    // ── DEMO: force danger state ──
    const hasDanger = true;
    const hasWarning = false;

    const status: 'green' | 'yellow' | 'red' = hasDanger ? 'red' : hasWarning ? 'yellow' : 'green';

    const [showTechnical, setShowTechnical] = useState(false);
    const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState('02:15:00');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const [h, m, s] = prev.split(':').map(Number);
                let total = h * 3600 + m * 60 + s - 1;
                if (total < 0) total = 2 * 3600 + 15 * 60;
                const nh = Math.floor(total / 3600);
                const nm = Math.floor((total % 3600) / 60);
                const ns = total % 60;
                return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')}`;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const safetyScore = hasDanger ? 23 : hasWarning ? 61 : 94;
    const toggleAction = (idx: number) => setCheckedActions(prev => {
        const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n;
    });

    const statusCfg = {
        green: {
            title: 'You Are Safe', subtitle: 'No flood threat in your area for the next 24 hours.',
            gradient: 'linear-gradient(135deg, #0A5C36 0%, #064E3B 100%)',
            glow: 'rgba(16,185,129,0.25)', dotColor: '#22C55E', dotPing: '#4ADE80',
            icon: <Shield className="size-7 text-white drop-shadow" />,
        },
        yellow: {
            title: 'Stay Alert', subtitle: 'Heavy rain expected — prepare now and monitor closely.',
            gradient: 'linear-gradient(135deg, #78350F 0%, #92400E 100%)',
            glow: 'rgba(245,158,11,0.25)', dotColor: '#F59E0B', dotPing: '#FCD34D',
            icon: <AlertTriangle className="size-7 text-white drop-shadow" />,
        },
        red: {
            title: 'Evacuate Now', subtitle: 'Flood predicted in 2 hours. Move to higher ground immediately.',
            gradient: 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)',
            glow: 'rgba(239,68,68,0.30)', dotColor: '#EF4444', dotPing: '#FCA5A5',
            icon: <AlertTriangle className="size-7 text-white drop-shadow animate-pulse" />,
        },
    };
    const cfg = statusCfg[status];
    const actionItems = hasDanger ? ACTION_ITEMS_DANGER : ACTION_ITEMS_SAFE;
    const verifiedCount = floodReports.filter(r => {
        const aiOk = r.aiResult?.status === 'VERIFIED';
        const hrOk = r.humanReview?.status === 'APPROVED' || r.humanReview?.status === 'OVERRIDDEN';
        return aiOk || hrOk;
    }).length;

    return (
        <div className="min-h-dvh flex flex-col font-sans text-slate-100 overflow-x-hidden pb-24"
            style={{ background: '#060C18' }}>

            {/* Subtle grid background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(26,115,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(26,115,232,1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Status glow */}
            <div className="fixed inset-0 pointer-events-none transition-all duration-1000"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${cfg.glow} 0%, transparent 65%)` }} />

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
                style={{ background: 'rgba(6,12,24,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(26,115,232,0.12)' }}>
                <div className="flex items-center gap-2.5">
                    {/* Logo */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', boxShadow: '0 0 16px rgba(26,115,232,0.35)' }}>
                        <Waves className="size-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                            FloodWay
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                    style={{ background: cfg.dotPing }} />
                                <span className="relative inline-flex rounded-full h-2 w-2"
                                    style={{ background: cfg.dotColor }} />
                            </span>
                        </h1>
                        <p className="text-[9px] font-bold uppercase tracking-widest"
                            style={{ color: 'rgba(255,255,255,0.35)' }}>Intelligence Dashboard</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                        style={{ background: 'rgba(26,115,232,0.10)', border: '1px solid rgba(26,115,232,0.20)', color: '#4A90E2' }}>
                        <MapPin className="size-3" />
                        {selectedLocation?.name || 'Kuala Lumpur'}
                    </div>
                    <UserAvatar />
                </div>
            </header>

            <main className="flex-1 px-4 py-4 space-y-4 relative z-10">

                {/* WhatsApp banner */}
                {(status === 'yellow' || status === 'red') && (() => {
                    const demo = prediction ?? {
                        date: new Date(),
                        hourlyPredictions: [{ hour: 14, time: '14:00', riskLevel: 'danger' as const, probability: 0.87, rainfall: 120 }],
                        peakRiskHour: 14,
                        overallRisk: 'danger' as const,
                    };
                    return <WhatsAppAlertBanner prediction={demo} locationName={selectedLocation?.name || 'Kuala Lumpur'} />;
                })()}

                {/* ════════════════════════════════════
                    1. STATUS HERO CARD
                   ════════════════════════════════════ */}
                <div className="relative overflow-hidden rounded-3xl p-5 select-none"
                    style={{ background: cfg.gradient, boxShadow: `0 12px 40px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.4)` }}>
                    {/* Shine overlay */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 60%)' }} />

                    <div className="relative z-10 flex flex-col gap-3">
                        {/* Traffic light dots */}
                        <div className="flex items-center gap-2">
                            <div className={cn("size-10 rounded-2xl flex items-center justify-center", hasDanger && 'animate-pulse')}
                                style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}>
                                {cfg.icon}
                            </div>
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70 mb-1">Status</div>
                                <div className="flex gap-1.5">
                                    {(['green', 'yellow', 'red'] as const).map(s => (
                                        <div key={s} className="size-2.5 rounded-full border border-white/30"
                                            style={{
                                                background: status === s
                                                    ? (s === 'green' ? '#22C55E' : s === 'yellow' ? '#F59E0B' : '#EF4444')
                                                    : 'rgba(255,255,255,0.10)',
                                                boxShadow: status === s ? `0 0 8px ${s === 'green' ? '#22C55E' : s === 'yellow' ? '#F59E0B' : '#EF4444'}` : 'none',
                                            }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-black text-white leading-none tracking-tight drop-shadow mb-1">
                                {cfg.title}
                            </h2>
                            <p className="text-white/80 text-sm font-medium leading-relaxed max-w-[90%]">
                                {cfg.subtitle}
                            </p>
                        </div>

                        {/* Evacuate CTA */}
                        {status === 'red' && (
                            <button
                                id="find-shelter-btn"
                                onClick={() => navigate('/shelters')}
                                className="mt-1 flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all duration-200 active:scale-95 relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #fff 0%, #ffe4e4 100%)', color: '#B91C1C', boxShadow: '0 0 0 3px rgba(255,255,255,0.25), 0 8px 32px rgba(0,0,0,0.35)' }}>
                                <span className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                                    style={{ background: 'rgba(255,255,255,0.5)', animationDuration: '1.4s' }} />
                                <span className="relative z-10 flex items-center justify-center size-6 bg-red-600 rounded-full shadow-md shrink-0">
                                    <Navigation className="size-3.5 text-white fill-current" />
                                </span>
                                <span className="relative z-10 flex flex-col items-start leading-none">
                                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Emergency</span>
                                    <span className="text-base font-black text-red-700 leading-none">Find Shelter Now</span>
                                </span>
                                <ChevronRight className="relative z-10 size-5 text-red-500 ml-auto" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ════════════════════════════════════
                    2. SAFETY SCORE + COUNTDOWN
                   ════════════════════════════════════ */}
                <div className="grid grid-cols-2 gap-3">

                    {/* Safety Score */}
                    <div className="flex flex-col items-center justify-center text-center gap-2 rounded-3xl p-4 min-h-[140px]"
                        style={{ background: 'rgba(10,20,40,0.85)', border: '1px solid rgba(26,115,232,0.15)', backdropFilter: 'blur(16px)' }}>
                        <div className="flex items-center gap-1.5">
                            <Zap className="size-3 text-blue-400" />
                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Safety Score</span>
                        </div>
                        <div className="relative size-20">
                            <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                                <circle cx="40" cy="40" r="34" fill="none"
                                    stroke={safetyScore > 70 ? '#22C55E' : safetyScore > 40 ? '#F59E0B' : '#EF4444'}
                                    strokeWidth="6" strokeLinecap="round"
                                    strokeDasharray={`${(safetyScore / 100) * 213.6} 213.6`}
                                    className="transition-all duration-1000"
                                    style={{ filter: `drop-shadow(0 0 6px ${safetyScore > 70 ? '#22C55E' : safetyScore > 40 ? '#F59E0B' : '#EF4444'})` }} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black text-white">{safetyScore}</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                            {safetyScore > 70 ? 'Your area is safe' : safetyScore > 40 ? 'Moderate risk' : 'High risk — act now'}
                        </p>
                    </div>

                    {/* Countdown / Live */}
                    <div className="flex flex-col items-center justify-center text-center rounded-3xl p-4 min-h-[140px] relative"
                        style={{ background: 'rgba(10,20,40,0.85)', border: `1px solid ${hasDanger ? 'rgba(245,158,11,0.30)' : 'rgba(26,115,232,0.15)'}`, backdropFilter: 'blur(16px)' }}>
                        {hasDanger ? (
                            <>
                                <div className="absolute top-3 right-3 opacity-10">
                                    <Timer className="size-10 text-white" />
                                </div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="relative flex size-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
                                    </span>
                                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest animate-pulse">Impact In</span>
                                </div>
                                <div className="text-4xl font-black text-white tabular-nums tracking-tighter my-1 font-mono">
                                    {timeLeft}
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium">Water reaches critical level</p>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="relative flex size-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                                        <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
                                </div>
                                <div className="text-4xl font-black text-white leading-none">24<span className="text-lg text-slate-400">h</span></div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Clear Forecast</div>
                                <div className="flex items-center gap-1 mt-2">
                                    <Activity className="size-3 text-emerald-500/60" />
                                    <span className="text-[9px] text-emerald-500/80 font-semibold">All sensors online</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ════════════════════════════════════
                    3. AI ACTION SCRIPT
                   ════════════════════════════════════ */}
                <div className="rounded-3xl overflow-hidden" style={{ background: 'rgba(10,20,40,0.85)', border: '1px solid rgba(26,115,232,0.15)', backdropFilter: 'blur(16px)' }}>
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-xl flex items-center justify-center"
                                    style={{ background: hasDanger ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', border: `1px solid ${hasDanger ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}` }}>
                                    {hasDanger
                                        ? <AlertOctagon className="size-4 text-red-400" />
                                        : <CheckCircle2 className="size-4 text-emerald-400" />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">
                                        {hasDanger ? 'AI Action Script' : 'Status Summary'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        {hasDanger ? 'Personalized steps for your location' : 'Area is being monitored'}
                                    </p>
                                </div>
                            </div>
                            {hasDanger && (
                                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full"
                                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}>
                                    {checkedActions.size}/{ACTION_ITEMS_DANGER.length} Done
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            {actionItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => hasDanger && toggleAction(idx)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200',
                                        hasDanger ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default',
                                        checkedActions.has(idx) ? 'bg-white/5 opacity-50' : ''
                                    )}>
                                    {hasDanger ? (
                                        <div className={cn('size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                                            checkedActions.has(idx) ? 'bg-emerald-500 border-emerald-500' :
                                                item.priority === 'critical' ? 'border-red-400/70' : 'border-white/20')}>
                                            {checkedActions.has(idx) && <CheckCircle2 className="size-3 text-white" />}
                                        </div>
                                    ) : <span className="text-base">{item.icon}</span>}
                                    <span className={cn('text-xs font-medium flex-1', checkedActions.has(idx) ? 'line-through text-slate-500' : 'text-slate-200')}>
                                        {hasDanger && <span className="text-base mr-2">{item.icon}</span>}
                                        {item.text}
                                    </span>
                                    {hasDanger && item.priority === 'critical' && !checkedActions.has(idx) && (
                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded"
                                            style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>URGENT</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════
                    4. TECHNICAL DETAILS (REVEAL)
                   ════════════════════════════════════ */}
                <button
                    onClick={() => setShowTechnical(!showTechnical)}
                    id="toggle-technical-btn"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-semibold transition-all"
                    style={{ background: 'rgba(10,20,40,0.7)', border: '1px solid rgba(26,115,232,0.12)', color: 'rgba(255,255,255,0.45)' }}>
                    <Eye className="size-3.5" />
                    {showTechnical ? 'Hide Technical Data' : 'Show Technical Data'}
                    {showTechnical ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>

                {showTechnical && (
                    <div className="grid grid-cols-2 gap-3">
                        {/* CCTV */}
                        <div className="col-span-1 overflow-hidden relative h-40 rounded-3xl group"
                            style={{ background: '#000', border: '1px solid rgba(26,115,232,0.15)' }}>
                            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold text-white uppercase"
                                style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                <span className="relative flex size-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full size-1.5 bg-red-500" />
                                </span>
                                Live Feed
                            </div>
                            <div className="absolute inset-0">
                                <img src="/cctv%20image.jpg" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-110" alt="River CCTV" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                                <div className="absolute top-[65%] left-0 right-0 z-20">
                                    <div className="border-t-2 border-cyan-400/90 border-dashed shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
                                    <div className="flex justify-between px-1.5 mt-0.5">
                                        <span className="text-[7px] font-bold text-cyan-100 bg-cyan-500/80 px-1.5 py-0.5 rounded">AI: Water 0.3m</span>
                                        <span className="text-[7px] font-bold text-white/60">Safe ↓</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rain gauge */}
                        <div className="col-span-1 flex flex-col rounded-3xl h-40"
                            style={{ background: 'rgba(10,20,40,0.85)', border: '1px solid rgba(26,115,232,0.15)' }}>
                            <div className="p-4 flex-1 flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rainfall</span>
                                    <CloudRain className="size-3.5 text-blue-400" />
                                </div>
                                <div className="flex-1 flex items-end justify-between gap-1 pb-1">
                                    {RAIN_DATA.map((val, i) => (
                                        <div key={i} className="relative w-full h-full flex items-end group/bar">
                                            <div className="w-full rounded-t-sm transition-all duration-300"
                                                style={{ height: `${(val / 100) * 100}%`, background: 'rgba(26,115,232,0.45)', boxShadow: '0 0 8px rgba(26,115,232,0.3)' }} />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[9px] font-bold mt-1 text-center py-1 rounded"
                                    style={{ background: 'rgba(26,115,232,0.08)', border: '1px solid rgba(26,115,232,0.20)', color: '#74B3F7' }}>
                                    {hasDanger ? '⚠️ Heavy rain @ 4 PM' : '🌤️ Light drizzle expected'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════
                    5. COMMUNITY REPORTS CARD
                   ════════════════════════════════════ */}
                <button
                    className="w-full flex items-center gap-4 p-4 rounded-3xl transition-all text-left group"
                    style={{ background: 'rgba(10,20,40,0.85)', border: '1px solid rgba(26,115,232,0.15)', backdropFilter: 'blur(16px)' }}
                    onClick={() => navigate('/reports')}>
                    <div className="size-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', boxShadow: '0 0 16px rgba(139,92,246,0.15)' }}>
                        <Users className="size-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-white mb-0.5 group-hover:text-purple-300 transition-colors">Community Reports</h3>
                        <p className="text-xs text-slate-400">
                            <span className="text-purple-300 font-bold">{verifiedCount || 12} verified reports</span> near you
                        </p>
                    </div>
                    <div className="size-8 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <ChevronRight className="size-4 text-slate-400" />
                    </div>
                </button>

                {/* ════════════════════════════════════
                    6. ACTION DOCK
                   ════════════════════════════════════ */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Report Flood */}
                    <button
                        onClick={() => navigate('/reports')}
                        className="h-16 rounded-[1.25rem] relative overflow-hidden flex items-center justify-center gap-3 font-bold text-white text-sm transition-all active:scale-95 group"
                        style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)', boxShadow: '0 6px 24px rgba(220,38,38,0.30)' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="size-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                            <AlertOctagon className="size-5 text-white" />
                        </div>
                        <span className="font-bold text-base">Report Flood</span>
                    </button>

                    {/* Find Shelter */}
                    <button
                        onClick={() => navigate('/shelters')}
                        className="h-16 rounded-[1.25rem] relative overflow-hidden flex items-center gap-3 px-4 font-bold text-white transition-all active:scale-95 group"
                        style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', boxShadow: '0 6px 24px rgba(26,115,232,0.30)' }}>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="size-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                            <Navigation className="size-5 text-white fill-current" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest leading-none mb-0.5">Navigate to</span>
                            <span className="text-lg font-black leading-none">Shelter</span>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
}
