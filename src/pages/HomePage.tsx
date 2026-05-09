// HomePage.tsx — FloodWay Intelligence Dashboard
// Arctic Dawn Design System: #F9FAFB bg · #E3F4FF cards · #7FB8E6 accent · #C7D0DA borders
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import {
    MapPin, AlertTriangle, ChevronRight, Navigation,
    AlertOctagon, Waves, Shield, CloudRain, Users, Eye, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserAvatar } from '../components/UserAvatar';

// ── Arctic Dawn palette constants ────────────────────────────────────────────
const AD_BG        = '#F9FAFB';   // Off-White / Snow
const AD_CARD      = '#E3F4FF';   // Pale Arctic Blue (surfaces)
const AD_MID       = '#7FB8E6';   // Mid-Blue (primary accent)
const AD_SKY       = '#B6DDFF';   // Sky Blue (secondary)
const AD_BORDER    = '#C7D0DA';   // Cool Gray (2D grid borders)
const AD_TEXT      = '#0f172a';   // Near-black text
const AD_MUTED     = '#64748b';   // Muted label text

// ── Rainfall data (10h forecast) ────────────────────────────────────────────
const RAIN_HOURS = ['8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm'];
const RAIN_DATA  = [18,   28,   40,    52,    65,    78,   95,   82,   55,   30];

// Arctic colour tier — normal=sky-blue, high=mid-blue, peak=coral-red
const barColor = (v: number, isPeak: boolean) =>
    isPeak ? '#F08080' : v >= 55 ? AD_MID : AD_SKY;

const barLabel = (v: number) =>
    v >= 80 ? 'Critical' : v >= 55 ? 'High' : 'Normal';

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
    red: {
        label: 'Danger',
        title: 'Evacuate Now',
        desc:  'Flood predicted in under 2 hours. Move to higher ground immediately.',
        bg:    '#FFF5F5',
        border: '#FCA5A5',
        badgeBg: '#EF4444', badgeText: '#fff',
        timeCls: 'text-rose-600',
        icon: <AlertTriangle className="size-7 text-rose-500 animate-pulse" />,
        iconBg: '#FEE2E2',
    },
    yellow: {
        label: 'Warning',
        title: 'Stay Alert',
        desc:  'Heavy rain expected — prepare now and monitor closely.',
        bg:    '#FFFBEB',
        border: '#FDE68A',
        badgeBg: '#F59E0B', badgeText: '#fff',
        timeCls: 'text-amber-600',
        icon: <AlertTriangle className="size-7 text-amber-500" />,
        iconBg: '#FEF3C7',
    },
    green: {
        label: 'Safe',
        title: 'Area is Safe',
        desc:  'No flood threat detected for the next 24 hours.',
        bg:    '#F0FDF4',
        border: '#86EFAC',
        badgeBg: '#22C55E', badgeText: '#fff',
        timeCls: 'text-emerald-600',
        icon: <Shield className="size-7 text-emerald-500" />,
        iconBg: '#DCFCE7',
    },
};

export function HomePage() {
    const navigate = useNavigate();
    const { selectedLocation, floodReports } = useApp();

    const status: 'green' | 'yellow' | 'red' = 'red';
    const S = STATUS_CFG[status];
    const maxRain = Math.max(...RAIN_DATA);

    const [timeLeft, setTimeLeft] = useState('02:15:00');
    useEffect(() => {
        const t = setInterval(() => {
            setTimeLeft(prev => {
                const [h, m, s] = prev.split(':').map(Number);
                let total = h * 3600 + m * 60 + s - 1;
                if (total < 0) total = 2 * 3600 + 15 * 60;
                return [
                    String(Math.floor(total / 3600)).padStart(2, '0'),
                    String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
                    String(total % 60).padStart(2, '0'),
                ].join(':');
            });
        }, 1000);
        return () => clearInterval(t);
    }, []);

    const verifiedCount = floodReports.filter(r => {
        const aiOk = r.aiResult?.status === 'VERIFIED';
        const hrOk = r.humanReview?.status === 'APPROVED' || r.humanReview?.status === 'OVERRIDDEN';
        return aiOk || hrOk;
    }).length;

    // ── Quick access nav cards data ──────────────────────────────────────────
    const NAV_CARDS = [
        {
            id: 'shelter-nav-card',
            route: '/shelters',
            label: 'Navigate to',
            title: 'Shelter',
            sub: null,
            accent: AD_MID,
            icon: <Navigation className="size-6" style={{ color: AD_MID }} />,
        },
        {
            id: 'report-flood-card',
            route: '/reports',
            label: 'Emergency',
            title: 'Report Flood',
            sub: null,
            accent: '#EF4444',
            icon: <AlertOctagon className="size-6 text-rose-500" />,
        },
        {
            id: 'community-reports-card',
            route: '/reports',
            label: 'Community',
            title: 'Reports',
            sub: `${verifiedCount || 4} verified nearby`,
            accent: '#7C3AED',
            icon: <Users className="size-6 text-violet-500" />,
        },
    ];

    return (
        <div
            className="min-h-dvh font-sans transition-colors duration-300"
            style={{ background: AD_BG, color: AD_TEXT }}
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <header
                className="sticky top-0 z-50"
                style={{
                    background: 'rgba(249,250,251,0.95)',
                    borderBottom: `1px solid ${AD_BORDER}`,
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div
                            className="flex size-10 items-center justify-center rounded-xl shrink-0"
                            style={{ background: AD_MID }}
                        >
                            <Waves className="size-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none" style={{ color: AD_TEXT }}>
                                FloodWay
                            </h1>
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: AD_MUTED }}>
                                Intelligence Dashboard
                            </p>
                        </div>
                    </div>

                    {/* Location + Avatar */}
                    <div className="flex items-center gap-3">
                        <div
                            className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                            style={{ border: `1px solid ${AD_BORDER}`, color: AD_MUTED, background: AD_CARD }}
                        >
                            <MapPin className="size-4" style={{ color: AD_MID }} />
                            {selectedLocation?.name || 'Kuala Lumpur'}
                        </div>
                        <UserAvatar />
                    </div>
                </div>
            </header>

            {/* ── Main grid ───────────────────────────────────────────────── */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                    {/* ╔══════════════════════════════════════╗
                        ║  LEFT — Live Data  (8/12 ≈ 67%)    ║
                        ╚══════════════════════════════════════╝ */}
                    <div className="space-y-5 lg:col-span-8">

                        {/* Section label */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight" style={{ color: AD_TEXT }}>
                                Live Prediction
                            </h2>
                            <Badge
                                className="gap-1.5 px-3 py-1 text-sm font-semibold rounded-full"
                                style={{ background: '#DCFCE7', color: '#15803d', border: `1px solid #86EFAC` }}
                            >
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                LIVE
                            </Badge>
                        </div>

                        {/* ── Emergency Banner ── */}
                        <div
                            className="rounded-2xl p-5"
                            style={{
                                background: S.bg,
                                border: `1.5px solid ${S.border}`,
                            }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl mt-0.5"
                                    style={{ background: S.iconBg }}
                                >
                                    {S.icon}
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span
                                            className="text-sm font-bold px-3 py-1 rounded-full"
                                            style={{ background: S.badgeBg, color: S.badgeText }}
                                        >
                                            {S.label}
                                        </span>
                                        {status === 'red' && (
                                            <span className="text-sm font-semibold" style={{ color: AD_MUTED }}>
                                                Impact in{' '}
                                                <span className={cn('font-black', S.timeCls)}>{timeLeft}</span>
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight" style={{ color: AD_TEXT }}>
                                        {S.title}
                                    </h3>
                                    <p className="mt-1 text-base" style={{ color: AD_MUTED }}>
                                        {S.desc}
                                    </p>
                                </div>
                            </div>

                            {/* CTA button */}
                            {status === 'red' && (
                                <Button
                                    id="find-shelter-btn"
                                    size="lg"
                                    className="w-full mt-4 gap-2 text-base font-bold text-white"
                                    style={{ background: '#EF4444', border: `1px solid #FCA5A5` }}
                                    onClick={() => navigate('/shelters')}
                                >
                                    <Navigation className="size-5 fill-current" />
                                    Find Shelter Now
                                    <ChevronRight className="size-5 ml-auto" />
                                </Button>
                            )}
                        </div>

                        {/* ── Rainfall Forecast Chart ── */}
                        <div
                            className="rounded-2xl p-5"
                            style={{ background: AD_CARD, border: `1px solid ${AD_BORDER}` }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                                <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: AD_TEXT }}>
                                    <CloudRain className="size-5" style={{ color: AD_MID }} />
                                    Rainfall Forecast — Next 10 Hours
                                </h3>
                                <span
                                    className="text-sm font-semibold px-3 py-1 rounded-full"
                                    style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FCA5A5' }}
                                >
                                    ⚠ Peak spike at 2 PM
                                </span>
                            </div>
                            <p className="text-sm mb-4" style={{ color: AD_MUTED }}>
                                Critical levels detected between 1 PM – 3 PM. Flooding risk is high.
                            </p>

                            {/* Bar chart */}
                            <div className="flex items-end gap-1.5 sm:gap-2 h-44">
                                {RAIN_DATA.map((val, i) => {
                                    const pct    = (val / maxRain) * 100;
                                    const isPeak = val === maxRain;
                                    const col    = barColor(val, isPeak);
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end group">
                                            {isPeak && (
                                                <div
                                                    className="text-[10px] font-black mb-0.5 animate-pulse"
                                                    style={{ color: '#F08080' }}
                                                >
                                                    ▲ PEAK
                                                </div>
                                            )}
                                            <div
                                                title={`${RAIN_HOURS[i]}: ${val}mm — ${barLabel(val)}`}
                                                className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-80 cursor-default"
                                                style={{
                                                    height: `${pct}%`,
                                                    background: col,
                                                    border: `1px solid ${isPeak ? '#FCA5A5' : AD_BORDER}`,
                                                    borderBottom: 'none',
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* X-axis */}
                            <div className="flex gap-1.5 sm:gap-2 mt-2">
                                {RAIN_HOURS.map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 text-center text-xs font-medium"
                                        style={{ color: AD_MUTED }}
                                    >
                                        {h}
                                    </div>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="mt-4 mb-3" style={{ borderTop: `1px solid ${AD_BORDER}` }} />

                            {/* Legend */}
                            <div className="flex items-center gap-5 text-sm flex-wrap">
                                {[
                                    { col: AD_SKY,    label: 'Normal (<55mm)' },
                                    { col: AD_MID,    label: 'High (55–80mm)' },
                                    { col: '#F08080', label: 'Critical (>80mm)' },
                                ].map(({ col, label }) => (
                                    <span key={label} className="flex items-center gap-2 font-medium" style={{ color: AD_MUTED }}>
                                        <span
                                            className="size-3 rounded-full shrink-0 inline-block"
                                            style={{ background: col, border: `1px solid ${AD_BORDER}` }}
                                        />
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ── Live Sensor Stats Row ── */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Water Level',  value: '1.2 m',  sub: '↑ Rising fast',  color: '#EF4444' },
                                { label: 'Rainfall Rate', value: '95 mm', sub: 'Peak intensity',  color: '#F59E0B' },
                                { label: 'IoT Sensors',  value: '12/14',  sub: 'Online now',      color: '#22C55E' },
                            ].map(({ label, value, sub, color }) => (
                                <div
                                    key={label}
                                    className="rounded-2xl py-4 px-3 text-center"
                                    style={{ background: AD_CARD, border: `1px solid ${AD_BORDER}` }}
                                >
                                    <p
                                        className="text-xs font-bold uppercase tracking-wider mb-1"
                                        style={{ color: AD_MUTED }}
                                    >
                                        {label}
                                    </p>
                                    <p className="text-2xl font-black" style={{ color }}>
                                        {value}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: AD_MUTED }}>
                                        {sub}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ╔══════════════════════════════════════╗
                        ║  RIGHT — Quick Access  (4/12 ≈ 33%)║
                        ╚══════════════════════════════════════╝ */}
                    <div className="space-y-4 lg:col-span-4">
                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: AD_TEXT }}>
                            Quick Access
                        </h2>

                        {/* Nav cards */}
                        {NAV_CARDS.map(({ id, route, label, title, sub, accent, icon }) => (
                            <button
                                key={id}
                                id={id}
                                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all duration-200 active:scale-[0.98] group"
                                style={{
                                    background: AD_CARD,
                                    border: `1px solid ${AD_BORDER}`,
                                    cursor: 'pointer',
                                }}
                                onClick={() => navigate(route)}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = AD_MID)}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = AD_BORDER)}
                            >
                                <div
                                    className="flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors"
                                    style={{ background: '#F9FAFB', border: `1px solid ${AD_BORDER}` }}
                                >
                                    {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: AD_MUTED }}>
                                        {label}
                                    </p>
                                    <p className="text-xl font-black mt-0.5" style={{ color: AD_TEXT }}>
                                        {title}
                                    </p>
                                    {sub && (
                                        <p className="text-sm font-semibold mt-0.5" style={{ color: accent }}>
                                            {sub}
                                        </p>
                                    )}
                                </div>
                                <ChevronRight
                                    className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                                    style={{ color: AD_MUTED }}
                                />
                            </button>
                        ))}

                        {/* ── 3D Simulation Card ── */}
                        <button
                            id="simulation-card"
                            className="w-full rounded-2xl overflow-hidden text-left transition-all duration-200 active:scale-[0.98] group"
                            style={{ border: `1px solid ${AD_BORDER}`, background: AD_CARD }}
                            onClick={() => navigate('/simulation')}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = AD_MID)}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = AD_BORDER)}
                        >
                            {/* Mini 3D scene */}
                            <div className="relative h-40 w-full overflow-hidden"
                                style={{ background: 'linear-gradient(to bottom, #0c1a3a, #1e3a5f, #1e293b)' }}
                            >
                                {/* Sun */}
                                <div className="absolute top-4 right-6 size-9 rounded-full"
                                    style={{ background: 'rgba(251,191,36,0.85)', boxShadow: '0 0 30px rgba(251,191,36,0.6)' }}
                                />
                                {/* Clouds */}
                                <div className="absolute top-5 left-8 h-4 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                                <div className="absolute top-3 left-16 h-3 w-12 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />

                                {/* Ground */}
                                <div className="absolute bottom-0 inset-x-0 h-20"
                                    style={{ background: 'linear-gradient(to top, rgba(20,83,45,0.7), rgba(21,128,61,0.3))' }}
                                />

                                {/* Trees */}
                                {[8, 20, 72, 84].map((l, i) => (
                                    <div key={i} className="absolute bottom-14" style={{ left: `${l}%` }}>
                                        <div className="w-0 h-0 mx-auto border-l-[7px] border-r-[7px] border-b-[18px] border-l-transparent border-r-transparent border-b-emerald-600/90" />
                                        <div className="w-0 h-0 mx-auto border-l-[5px] border-r-[5px] border-b-[14px] border-l-transparent border-r-transparent border-b-emerald-500/90 -mt-2" />
                                        <div className="w-2.5 h-4 mx-auto bg-amber-900/60 rounded-sm mt-0.5" />
                                    </div>
                                ))}

                                {/* House */}
                                <div className="absolute bottom-13 left-1/2 -translate-x-1/2">
                                    <div className="w-0 h-0 mx-auto border-l-[26px] border-r-[26px] border-b-[16px] border-l-transparent border-r-transparent border-b-amber-700/90" />
                                    <div className="w-13 h-10 bg-slate-200/90 mx-auto flex items-end justify-center">
                                        <div className="w-4 h-6 bg-amber-900/70" />
                                    </div>
                                </div>

                                {/* Person */}
                                <div className="absolute bottom-13 right-[32%] flex flex-col items-center">
                                    <div className="size-3 rounded-full bg-rose-300 border border-rose-200" />
                                    <div className="w-px h-5 bg-slate-200/80" />
                                    <div className="flex gap-2 -mt-4">
                                        <div className="w-2.5 h-px bg-slate-200/80 rotate-[25deg] origin-left" />
                                        <div className="w-2.5 h-px bg-slate-200/80 -rotate-[25deg] origin-right" />
                                    </div>
                                </div>

                                {/* Animated flood water — Arctic blue */}
                                <div className="absolute bottom-0 inset-x-0 h-12 overflow-hidden">
                                    <div
                                        className="h-full w-[200%] animate-[shimmer_1.8s_linear_infinite]"
                                        style={{
                                            background: `linear-gradient(90deg, ${AD_MID}bb 0%, ${AD_SKY}88 25%, ${AD_CARD}99 50%, ${AD_SKY}88 75%, ${AD_MID}bb 100%)`,
                                        }}
                                    />
                                </div>

                                {/* Water level label */}
                                <div
                                    className="absolute bottom-12 left-3 rounded-full px-2.5 py-1 text-xs font-bold text-white"
                                    style={{ background: `${AD_MID}ee` }}
                                >
                                    Water: 1.2m ↑
                                </div>

                                {/* LIVE SIM badge */}
                                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                                    <Activity className="size-3 text-emerald-400" />
                                    LIVE SIM
                                </div>
                            </div>

                            {/* Card footer */}
                            <div className="flex items-center gap-4 p-4">
                                <div
                                    className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                                    style={{ background: '#F9FAFB', border: `1px solid ${AD_BORDER}` }}
                                >
                                    <Eye className="size-6" style={{ color: AD_MID }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: AD_MUTED }}>
                                        Interactive 3D
                                    </p>
                                    <p className="text-xl font-black mt-0.5" style={{ color: AD_TEXT }}>
                                        Flood Simulation
                                    </p>
                                    <p className="text-sm font-semibold mt-0.5" style={{ color: AD_MID }}>
                                        Tap to explore live model
                                    </p>
                                </div>
                                <ChevronRight
                                    className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                                    style={{ color: AD_MUTED }}
                                />
                            </div>
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}
