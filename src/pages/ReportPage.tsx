// Reports Page — FloodWay Community Sentinel
// Blue / White / Black · Clean, human-centric feed
import { useState, useCallback, useMemo } from 'react';
import type { AIVerificationResult, AutoTags, ReportFormOutput } from '../types/report';
import { ReportCategory, VerificationStatus, HumanReviewStatus, CATEGORY_META } from '../types/report';
import type { FloodReport } from '../types/report';

import EmergencyMode from '../components/report/EmergencyMode';
import AIVerification from '../components/report/AIVerification';
import ReportForm from '../components/report/ReportForm';
import ModeratorPanel from '../components/report/ModeratorPanel';
import { useGeolocation } from '../hooks/useGeolocation';
import { useApp } from '../store';
import '../components/report/report.css';

type ReportScreen = 'LIST' | 'EMERGENCY' | 'VERIFICATION' | 'REPORT' | 'MODERATOR';
type FilterTab = 'all' | 'verified' | 'pending';

const PROFILES = [
    { handle: '@razif_kl', name: 'Razif Hasan', avatar: '🧔🏽', city: 'Kuala Lumpur' },
    { handle: '@norhaida91', name: 'Norhaida Zainal', avatar: '👩🏽', city: 'Ampang' },
    { handle: '@floodwatch_my', name: 'FloodWatch MY', avatar: '🛰️', city: 'KL Metro' },
    { handle: '@fikri_rescue', name: 'Fikri Rashid', avatar: '👨🏽‍🚒', city: 'Kuala Lumpur' },
];

function getProfile(report: FloodReport) {
    const idx = report.id.charCodeAt(0) % PROFILES.length;
    return PROFILES[idx];
}

function placeLabel(lat: number, lng: number): string {
    if (lat > 3.14 && lat < 3.16 && lng < 101.70) return 'Masjid India / Jln TAR';
    if (lat > 3.15 && lng > 101.71) return 'Jln Ampang / Ampang Park';
    if (lat > 3.10 && lat < 3.14) return 'Chow Kit, KL';
    if (lng < 101.68) return 'KL City Centre';
    return `KL (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function pipelineInfo(report: FloodReport) {
    const ai = report.aiResult?.status;
    const hr = report.humanReview.status;
    if (hr === HumanReviewStatus.APPROVED) return { label: 'Verified', cls: 'badge--green', icon: '✅', phase: 3 };
    if (hr === HumanReviewStatus.OVERRIDDEN) return { label: 'Approved', cls: 'badge--cyan', icon: '✅', phase: 3 };
    if (hr === HumanReviewStatus.REJECTED) return { label: 'Rejected', cls: 'badge--red', icon: '❌', phase: 3 };
    if (ai === VerificationStatus.VERIFIED) return { label: 'AI Passed', cls: 'badge--yellow', icon: '⏳', phase: 2 };
    if (ai === VerificationStatus.UNVERIFIED) return { label: 'Escalated', cls: 'badge--orange', icon: '⚠️', phase: 2 };
    return { label: 'Processing', cls: 'badge--gray', icon: '🔄', phase: 1 };
}

const BADGE_STYLES: Record<string, React.CSSProperties> = {
    'badge--green': { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' },
    'badge--cyan': { background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#22d3ee' },
    'badge--red': { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' },
    'badge--yellow': { background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)', color: '#facc15' },
    'badge--orange': { background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#fb923c' },
    'badge--gray': { background: 'rgba(100,116,139,0.12)', border: '1px solid rgba(100,116,139,0.25)', color: '#94a3b8' },
    'badge--blue': { background: 'rgba(26,115,232,0.12)', border: '1px solid rgba(26,115,232,0.25)', color: '#4A90E2' },
};

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
    return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap" style={BADGE_STYLES[cls] ?? BADGE_STYLES['badge--gray']}>
            {children}
        </span>
    );
}

function ReportCard({ report }: { report: FloodReport }) {
    const [expanded, setExpanded] = useState(false);
    const { label, cls, phase } = pipelineInfo(report);
    const profile = getProfile(report);
    const meta = CATEGORY_META[report.category] ?? CATEGORY_META[ReportCategory.OTHER];

    return (
        <div className="rounded-2xl overflow-hidden transition-all" style={{ background: 'rgba(10,20,40,0.85)', border: '1px solid rgba(26,115,232,0.12)', backdropFilter: 'blur(16px)' }}>
            {/* Top row */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-0">
                {/* Avatar */}
                <div className="size-10 rounded-full flex items-center justify-center text-xl shrink-0"
                    style={{ background: 'rgba(26,115,232,0.10)', border: '1.5px solid rgba(26,115,232,0.20)' }}>
                    {profile.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{profile.name}</span>
                        <span className="text-[10px] text-slate-500">{profile.handle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px]">{meta.icon}</span>
                        <span className="text-[10px] text-slate-400 truncate">{placeLabel(report.location.lat, report.location.lng)}</span>
                        <span className="text-[9px] text-slate-600">·</span>
                        <span className="text-[10px] text-slate-500">{timeAgo(report.timestamp)}</span>
                    </div>
                </div>
                <Badge cls={cls}>{label}</Badge>
            </div>

            {/* Image */}
            {report.imageUrl && (
                <div className="relative mx-4 mt-3 rounded-xl overflow-hidden" style={{ maxHeight: 220 }}>
                    <img src={report.imageUrl} alt="Flood" className="w-full object-cover" style={{ maxHeight: 220 }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {/* Severity badge */}
                    {report.aiResult?.severity && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                            style={{ background: 'rgba(239,68,68,0.80)', backdropFilter: 'blur(8px)' }}>
                            {report.aiResult.severity}
                        </span>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(8px)' }}>
                        {meta.icon} {meta.label}
                    </span>
                </div>
            )}

            {/* Description */}
            {report.description && (
                <p className="px-4 pt-3 text-sm text-slate-300 leading-relaxed line-clamp-3">{report.description}</p>
            )}

            {/* Expand / Actions */}
            <div className="flex items-center justify-between px-4 py-3 mt-1">
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600">
                    {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs font-bold py-1.5 px-3 rounded-lg transition-all"
                    style={{ background: 'rgba(26,115,232,0.08)', border: '1px solid rgba(26,115,232,0.15)', color: '#4A90E2' }}>
                    {expanded ? 'Less ↑' : 'Details ↓'}
                </button>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'rgba(26,115,232,0.08)' }}>
                    {/* Pipeline */}
                    <div className="pt-3 flex items-center gap-1 flex-wrap">
                        {(['Submitted', 'AI Review', 'Human Verified'] as const).map((step, i) => (
                            <div key={step} className="flex items-center gap-1">
                                <span className={`px-2 py-1 rounded text-[9px] font-bold`}
                                    style={phase >= i + 1 ? { background: 'rgba(26,115,232,0.15)', border: '1px solid rgba(26,115,232,0.30)', color: '#4A90E2' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#475569' }}>
                                    {phase >= i + 1 ? '✓ ' : ''}{step}
                                </span>
                                {i < 2 && <span className="mx-0.5 text-slate-600 text-[10px]">→</span>}
                            </div>
                        ))}
                    </div>

                    {/* AI Summary */}
                    {report.aiResult?.summary && (
                        <div className="p-3 rounded-xl text-xs text-slate-300 leading-relaxed"
                            style={{ background: 'rgba(26,115,232,0.06)', border: '1px solid rgba(26,115,232,0.15)' }}>
                            <span className="block text-[9px] font-black text-blue-400 uppercase tracking-wider mb-1">AI Analysis</span>
                            {report.aiResult.summary}
                        </div>
                    )}

                    {/* Auto tags */}
                    {report.autoTags && report.autoTags.affectedAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {report.autoTags.affectedAreas.map((a, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold"
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}>
                                    📍 {a}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function ReportPage() {
    const { floodReports, addFloodReport } = useApp();
    const { location: geoLoc } = useGeolocation();

    const [screen, setScreen] = useState<ReportScreen>('LIST');
    const [pendingFormData, setPendingFormData] = useState<ReportFormOutput | null>(null);
    const [aiResult, setAiResult] = useState<AIVerificationResult | null>(null);
    const [filter, setFilter] = useState<FilterTab>('all');

    const handleFormSubmit = useCallback((data: ReportFormOutput) => {
        setPendingFormData(data);
        setScreen('VERIFICATION');
    }, []);

    const handleAiComplete = useCallback((result: AIVerificationResult) => {
        setAiResult(result);
    }, []);

    const handleConfirmReport = useCallback(() => {
        if (!pendingFormData || !aiResult) return;
        const report: FloodReport = {
            id: `r_${Date.now()}`,
            category: pendingFormData.category,
            description: pendingFormData.description,
            location: pendingFormData.location ?? { lat: 3.1412, lng: 101.6865, accuracy: 50 },
            imageUrl: pendingFormData.imageBase64 ? `data:image/jpeg;base64,${pendingFormData.imageBase64}` : undefined,
            timestamp: new Date().toISOString(),
            aiResult: {
                ...aiResult,
                confidence: aiResult.confidence ?? 0.85,
            },
            humanReview: { status: HumanReviewStatus.PENDING },
            rescueRequested: pendingFormData.rescueRequested ?? false,
            waterDepth: aiResult.estimatedDepth ?? undefined,
            autoTags: pendingFormData.autoTags ?? { affectedAreas: [], floodType: 'urban', weatherContext: 'heavy rain', urgencyLevel: 'medium', infrastructureImpact: [], evacuationRecommended: false },
        };
        addFloodReport(report);
        setPendingFormData(null); setAiResult(null);
        setScreen('LIST');
    }, [pendingFormData, aiResult, addFloodReport]);

    const filteredReports = useMemo(() => {
        const sorted = [...floodReports].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (filter === 'verified') return sorted.filter(r =>
            r.humanReview.status === HumanReviewStatus.APPROVED || r.aiResult?.status === VerificationStatus.VERIFIED
        );
        if (filter === 'pending') return sorted.filter(r =>
            r.humanReview.status === HumanReviewStatus.PENDING
        );
        return sorted;
    }, [floodReports, filter]);

    const counts = useMemo(() => ({
        all: floodReports.length,
        verified: floodReports.filter(r => r.humanReview.status === HumanReviewStatus.APPROVED || r.aiResult?.status === VerificationStatus.VERIFIED).length,
        pending: floodReports.filter(r => r.humanReview.status === HumanReviewStatus.PENDING).length,
    }), [floodReports]);

    if (screen === 'EMERGENCY') return <EmergencyMode onBack={() => setScreen('LIST')} onSubmit={() => setScreen('LIST')} location={geoLoc} />;
    if (screen === 'REPORT') return (
        <ReportForm onSubmit={handleFormSubmit} onCancel={() => setScreen('LIST')} initialLocation={geoLoc ? { lat: geoLoc.coords.latitude, lng: geoLoc.coords.longitude, accuracy: geoLoc.coords.accuracy } : undefined} />
    );
    if (screen === 'VERIFICATION' && pendingFormData) return (
        <AIVerification formData={pendingFormData} onVerified={handleAiComplete} onConfirm={handleConfirmReport} onCancel={() => setScreen('REPORT')} />
    );
    if (screen === 'MODERATOR') return <ModeratorPanel reports={floodReports} onClose={() => setScreen('LIST')} />;

    return (
        <div className="min-h-dvh flex flex-col pb-24" style={{ background: '#060C18', color: '#f0f4ff', fontFamily: 'Inter,-apple-system,sans-serif' }}>
            <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.rp-card{animation:cardIn .35s ease both}`}</style>

            {/* Header */}
            <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
                style={{ background: 'rgba(6,12,24,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(26,115,232,0.12)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', boxShadow: '0 0 16px rgba(26,115,232,0.35)' }}>
                        <span className="text-lg">🌊</span>
                    </div>
                    <div>
                        <h1 className="text-[1rem] font-black text-white">Community Reports</h1>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>KL Flood Intelligence</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold"
                        style={{ background: 'rgba(26,115,232,0.10)', border: '1px solid rgba(26,115,232,0.22)', color: '#4A90E2' }}>
                        <span className="size-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 5px #22C55E' }} />
                        LIVE
                    </div>
                    <button onClick={() => setScreen('MODERATOR')}
                        className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                        🛡 Mod
                    </button>
                </div>
            </header>

            {/* Stats row */}
            <div className="flex items-center justify-around px-4 py-3" style={{ background: 'rgba(10,20,40,0.6)', borderBottom: '1px solid rgba(26,115,232,0.08)' }}>
                {[
                    { n: counts.all, l: 'Total', c: '#4A90E2' },
                    { n: counts.verified, l: 'Verified', c: '#22C55E' },
                    { n: counts.pending, l: 'Pending', c: '#F59E0B' },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                        <span className="text-2xl font-black" style={{ color: stat.c }}>{stat.n}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.l}</span>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid rgba(26,115,232,0.08)' }}>
                {(['all', 'verified', 'pending'] as FilterTab[]).map(tab => (
                    <button key={tab} onClick={() => setFilter(tab)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all capitalize"
                        style={filter === tab ? { background: 'rgba(26,115,232,0.15)', border: '1px solid rgba(26,115,232,0.35)', color: '#4A90E2' } : { background: 'transparent', border: '1px solid transparent', color: 'rgba(255,255,255,0.35)' }}>
                        {tab}
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                            style={{ background: filter === tab ? 'rgba(26,115,232,0.20)' : 'rgba(255,255,255,0.05)', color: filter === tab ? '#4A90E2' : 'rgba(255,255,255,0.25)' }}>
                            {counts[tab]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Disclaimer */}
            <div className="flex gap-2.5 mx-4 mt-3 p-3 rounded-xl text-xs text-slate-500"
                style={{ background: 'rgba(26,115,232,0.05)', border: '1px solid rgba(26,115,232,0.12)' }}>
                ℹ️ Reports are AI-screened then reviewed by moderators. Severity labels are predictions only.
            </div>

            {/* Feed */}
            <div className="px-4 pt-3 flex-1 flex flex-col gap-3">
                {filteredReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="text-5xl mb-4 opacity-40">🌊</div>
                        <h3 className="text-base font-bold text-white/70 mb-2">No reports yet</h3>
                        <p className="text-sm text-slate-500 max-w-[240px]">Be the first to report a flood in your area to help the community stay safe.</p>
                    </div>
                ) : (
                    filteredReports.map((r, i) => (
                        <div key={r.id} className="rp-card" style={{ animationDelay: `${i * 60}ms` }}>
                            <ReportCard report={r} />
                        </div>
                    ))
                )}
            </div>

            {/* FAB group */}
            <div className="fixed right-4 flex flex-col items-center gap-2 z-40"
                style={{ bottom: 'calc(80px + env(safe-area-inset-bottom,0px))' }}>
                {/* Emergency */}
                <button onClick={() => setScreen('EMERGENCY')}
                    className="size-12 rounded-[14px] flex items-center justify-center transition-all active:scale-95 shadow-lg"
                    style={{ background: 'rgba(239,68,68,0.85)', border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 4px 16px rgba(239,68,68,0.35)' }}>
                    <span className="text-xl">🆘</span>
                </button>
                {/* Primary Report */}
                <button onClick={() => setScreen('REPORT')}
                    className="w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl transition-all active:scale-95 shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #1A73E8, #0D47A1)', boxShadow: '0 6px 24px rgba(26,115,232,0.45)' }}>
                    📍
                </button>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Report</span>
            </div>
        </div>
    );
}
