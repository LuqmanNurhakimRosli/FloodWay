// HomePage.tsx — FloodWay Intelligence Dashboard
// Expert Redesign: 2-col (70/30), data viz focus, Shadcn UI, no checklist
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

// ── Rainfall data (10h forecast) ────────────────────────────────────────
const RAIN_HOURS   = ['8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm'];
const RAIN_DATA    = [18,    28,   40,    52,    65,    78,   95,   82,   55,   30];
// Colour tier for each bar
const barColor = (v: number) =>
    v >= 80 ? '#ef4444' : v >= 55 ? '#f59e0b' : '#3b82f6';
const barLabel = (v: number) =>
    v >= 80 ? 'Critical' : v >= 55 ? 'High' : 'Normal';

// ── Status config ────────────────────────────────────────────────────────
const STATUS_CFG = {
    red: {
        label: 'Danger',
        title: 'Evacuate Now',
        desc:  'Flood predicted in under 2 hours. Move to higher ground immediately.',
        borderCls: 'border-rose-500/40',
        iconCls:   'bg-rose-500/10',
        badgeCls:  'bg-rose-600 text-white border-transparent',
        textCls:   'text-rose-400',
        icon: <AlertTriangle className="size-7 text-rose-500 animate-pulse" />,
    },
    yellow: {
        label: 'Warning',
        title: 'Stay Alert',
        desc:  'Heavy rain expected — prepare now and monitor closely.',
        borderCls: 'border-amber-500/40',
        iconCls:   'bg-amber-500/10',
        badgeCls:  'bg-amber-500 text-white border-transparent',
        textCls:   'text-amber-400',
        icon: <AlertTriangle className="size-7 text-amber-500" />,
    },
    green: {
        label: 'Safe',
        title: 'Area is Safe',
        desc:  'No flood threat detected for the next 24 hours.',
        borderCls: 'border-emerald-500/40',
        iconCls:   'bg-emerald-500/10',
        badgeCls:  'bg-emerald-500 text-white border-transparent',
        textCls:   'text-emerald-400',
        icon: <Shield className="size-7 text-emerald-500" />,
    },
};

export function HomePage() {
    const navigate = useNavigate();
    const { selectedLocation, floodReports } = useApp();

    // DEMO: force danger
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

    return (
        <div className="min-h-dvh bg-background text-foreground font-sans transition-colors duration-300">

            {/* ── Header ─────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25 shrink-0">
                            <Waves className="size-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none">FloodWay</h1>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Intelligence Dashboard</p>
                        </div>
                    </div>

                    {/* Location + Avatar */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium text-muted-foreground">
                            <MapPin className="size-4 text-blue-500" />
                            {selectedLocation?.name || 'Kuala Lumpur'}
                        </div>
                        <UserAvatar />
                    </div>
                </div>
            </header>

            {/* ── Main grid ──────────────────────────────────────────── */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">

                    {/* ╔══════════════════════════════════════════════════╗
                        ║  LEFT — Live Data Prediction  (col-span-7 ≈70%) ║
                        ╚══════════════════════════════════════════════════╝ */}
                    <div className="space-y-5 lg:col-span-7">

                        {/* Section label */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Live Prediction</h2>
                            <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-3 py-1 text-sm">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                LIVE
                            </Badge>
                        </div>

                        {/* ── Status card ── */}
                        <Card className={cn('border-2 shadow-lg', S.borderCls)}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start gap-4">
                                    <div className={cn('mt-0.5 flex size-14 shrink-0 items-center justify-center rounded-2xl', S.iconCls)}>
                                        {S.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={cn('text-sm font-bold px-3 py-1', S.badgeCls)}>
                                                {S.label}
                                            </Badge>
                                            {status === 'red' && (
                                                <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                                                    Impact in{' '}
                                                    <span className={cn('font-black', S.textCls)}>{timeLeft}</span>
                                                </span>
                                            )}
                                        </div>
                                        <CardTitle className="mt-2 text-3xl font-black tracking-tight">{S.title}</CardTitle>
                                        <CardDescription className="mt-1 text-base">{S.desc}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            {status === 'red' && (
                                <CardContent className="pt-0">
                                    <Button
                                        id="find-shelter-btn"
                                        size="lg"
                                        className="w-full gap-2 bg-rose-600 hover:bg-rose-700 text-white text-base font-bold shadow-lg shadow-rose-600/30"
                                        onClick={() => navigate('/shelters')}
                                    >
                                        <Navigation className="size-5 fill-current" />
                                        Find Shelter Now
                                        <ChevronRight className="size-5 ml-auto" />
                                    </Button>
                                </CardContent>
                            )}
                        </Card>

                        {/* ── Rainfall Forecast Chart ── */}
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <CloudRain className="size-5 text-blue-500" />
                                        Rainfall Forecast — Next 10 Hours
                                    </CardTitle>
                                    <Badge variant="outline" className="text-rose-500 border-rose-500/40 bg-rose-500/5 font-semibold text-sm">
                                        ⚠ Peak spike at 2 PM
                                    </Badge>
                                </div>
                                <CardDescription className="text-sm">
                                    Critical levels detected between 1 PM – 3 PM. Flooding risk is high.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Bar chart */}
                                <div className="flex items-end gap-1.5 sm:gap-2 h-40 mt-2">
                                    {RAIN_DATA.map((val, i) => {
                                        const pct  = (val / maxRain) * 100;
                                        const col  = barColor(val);
                                        const isPeak = val === maxRain;
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end group">
                                                {isPeak && (
                                                    <div className="text-[10px] font-black text-rose-400 mb-0.5 animate-pulse">▲ PEAK</div>
                                                )}
                                                <div
                                                    title={`${RAIN_HOURS[i]}: ${val}mm — ${barLabel(val)}`}
                                                    className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-80 cursor-default"
                                                    style={{
                                                        height: `${pct}%`,
                                                        background: `linear-gradient(to top, ${col}dd, ${col}88)`,
                                                        boxShadow: isPeak ? `0 0 16px ${col}80` : undefined,
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* X-axis */}
                                <div className="flex gap-1.5 sm:gap-2 mt-2">
                                    {RAIN_HOURS.map((h, i) => (
                                        <div key={i} className="flex-1 text-center text-xs text-muted-foreground font-medium">{h}</div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="mt-4 flex items-center gap-5 text-sm flex-wrap">
                                    {[
                                        { col: '#3b82f6', label: 'Normal (<55mm)' },
                                        { col: '#f59e0b', label: 'High (55–80mm)' },
                                        { col: '#ef4444', label: 'Critical (>80mm)' },
                                    ].map(({ col, label }) => (
                                        <span key={label} className="flex items-center gap-2 font-medium text-muted-foreground">
                                            <span className="size-3 rounded-full shrink-0" style={{ background: col }} />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── Live sensor mini-stats row ── */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Water Level', value: '1.2 m', sub: '↑ Rising fast', color: 'text-rose-400' },
                                { label: 'Rainfall Rate', value: '95 mm', sub: 'Peak intensity', color: 'text-amber-400' },
                                { label: 'IoT Sensors', value: '12/14', sub: 'Online now', color: 'text-emerald-400' },
                            ].map(({ label, value, sub, color }) => (
                                <Card key={label} className="text-center py-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                                    <p className={cn('text-2xl font-black', color)}>{value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* ╔══════════════════════════════════════════════════╗
                        ║  RIGHT — Interactive Overview  (col-span-3 ≈30%)║
                        ╚══════════════════════════════════════════════════╝ */}
                    <div className="space-y-4 lg:col-span-3">
                        <h2 className="text-2xl font-bold tracking-tight">Quick Access</h2>

                        {/* Find Shelter */}
                        <Card
                            className="group cursor-pointer border-blue-500/20 transition-all duration-200 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/10 active:scale-[0.98]"
                            onClick={() => navigate('/shelters')}
                            id="shelter-nav-card"
                        >
                            <CardContent className="flex items-center gap-4 py-5">
                                <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors p-3">
                                    <Navigation className="size-7 text-blue-500 fill-blue-500/20" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Navigate to</p>
                                    <p className="text-xl font-black mt-0.5">Shelter</p>
                                </div>
                                <ChevronRight className="size-5 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
                            </CardContent>
                        </Card>

                        {/* Report Flood */}
                        <Card
                            className="group cursor-pointer border-rose-500/20 transition-all duration-200 hover:border-rose-500/50 hover:shadow-md hover:shadow-rose-500/10 active:scale-[0.98]"
                            onClick={() => navigate('/reports')}
                            id="report-flood-card"
                        >
                            <CardContent className="flex items-center gap-4 py-5">
                                <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors p-3">
                                    <AlertOctagon className="size-7 text-rose-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Emergency</p>
                                    <p className="text-xl font-black mt-0.5">Report Flood</p>
                                </div>
                                <ChevronRight className="size-5 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all shrink-0" />
                            </CardContent>
                        </Card>

                        {/* Community Reports */}
                        <Card
                            className="group cursor-pointer border-violet-500/20 transition-all duration-200 hover:border-violet-500/50 hover:shadow-md hover:shadow-violet-500/10 active:scale-[0.98]"
                            onClick={() => navigate('/reports')}
                            id="community-reports-card"
                        >
                            <CardContent className="flex items-center gap-4 py-5">
                                <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors p-3">
                                    <Users className="size-7 text-violet-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Community</p>
                                    <p className="text-xl font-black mt-0.5">Reports</p>
                                    <p className="text-sm text-violet-400 font-semibold">{verifiedCount || 4} verified nearby</p>
                                </div>
                                <ChevronRight className="size-5 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-1 transition-all shrink-0" />
                            </CardContent>
                        </Card>

                        {/* ── 3D Simulation Card ── */}
                        <Card
                            className="group cursor-pointer border-emerald-500/20 relative overflow-hidden transition-all duration-200 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98]"
                            onClick={() => navigate('/simulation')}
                            id="simulation-card"
                        >
                            {/* Mini 3D scene preview */}
                            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950 rounded-t-xl">
                                {/* Sky & Sun */}
                                <div className="absolute top-4 right-6 size-9 rounded-full bg-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.6)]" />
                                {/* Clouds */}
                                <div className="absolute top-5 left-8 h-4 w-16 rounded-full bg-white/10" />
                                <div className="absolute top-3 left-16 h-3 w-12 rounded-full bg-white/8" />

                                {/* Ground */}
                                <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-emerald-900/70 to-emerald-800/30" />

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
                                    <div className="w-13 h-10 bg-slate-200/90 mx-auto flex items-end justify-center pb-0">
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

                                {/* Animated flood water */}
                                <div className="absolute bottom-0 inset-x-0 h-12 overflow-hidden">
                                    <div
                                        className="h-full w-[200%] animate-[shimmer_1.8s_linear_infinite]"
                                        style={{
                                            background: 'linear-gradient(90deg, rgba(37,99,235,0.75) 0%, rgba(96,165,250,0.55) 25%, rgba(147,197,253,0.65) 50%, rgba(96,165,250,0.55) 75%, rgba(37,99,235,0.75) 100%)',
                                        }}
                                    />
                                </div>

                                {/* Water level label */}
                                <div className="absolute bottom-12 left-3 rounded-full bg-blue-600/90 px-2.5 py-1 text-xs font-bold text-white shadow">
                                    Water: 1.2m ↑
                                </div>

                                {/* LIVE SIM badge */}
                                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                                    <Activity className="size-3 text-emerald-400" />
                                    LIVE SIM
                                </div>
                            </div>

                            <CardContent className="flex items-center gap-4 pt-4 pb-5">
                                <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors p-3">
                                    <Eye className="size-7 text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Interactive 3D</p>
                                    <p className="text-xl font-black mt-0.5">Flood Simulation</p>
                                    <p className="text-sm text-emerald-400 font-semibold">Tap to explore live model</p>
                                </div>
                                <ChevronRight className="size-5 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
