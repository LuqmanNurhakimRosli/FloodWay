import { useState, useCallback, useMemo } from 'react';
import type { AIVerificationResult, AutoTags, ReportFormOutput } from '../types/report';
import { ReportCategory, VerificationStatus, HumanReviewStatus, CATEGORY_META, isFloodActive } from '../types/report';
import type { FloodReport } from '../types/report';

import EmergencyMode from '../components/report/EmergencyMode';
import AIVerification from '../components/report/AIVerification';
import ReportForm from '../components/report/ReportForm';
import ModeratorPanel from '../components/report/ModeratorPanel';
import { useGeolocation } from '../hooks/useGeolocation';
import { useApp } from '../store';
import '../components/report/report.css';
import './ReportPage.css';

type ReportScreen = 'LIST' | 'EMERGENCY' | 'VERIFICATION' | 'REPORT' | 'MODERATOR';
type FilterTab = 'all' | 'verified' | 'pending';
type AreaFilter = 'MY_AREA' | 'OTHER_AREAS';
type TimeFilter = 'TODAY' | 'HISTORY';

// ── Fake user profiles for the 2 seeded reports ──────────────────────────────
const PROFILES = [
    { handle: '@razif_kl', name: 'Razif Hasan', avatar: '🧔🏽', city: 'Kuala Lumpur' },
    { handle: '@norhaida91', name: 'Norhaida Zainal', avatar: '👩🏽', city: 'Ampang' },
    { handle: '@floodwatch_my', name: 'FloodWatch MY', avatar: '🛰️', city: 'KL Metro' },
    { handle: '@fikri_rescue', name: 'Fikri Rashid', avatar: '👨🏽‍🚒', city: 'Kuala Lumpur' },
];

function getProfile(report: FloodReport) {
    // Deterministic profile from report id
    const idx = report.id.charCodeAt(0) % PROFILES.length;
    return PROFILES[idx];
}

// ── Place name from coords ────────────────────────────────────────────────────
function placeLabel(lat: number, lng: number): string {
    if (lat > 3.14 && lat < 3.16 && lng < 101.70) return 'Masjid India / Jln TAR, KL';
    if (lat > 3.15 && lng > 101.71) return 'Jln Ampang / Ampang Park, KL';
    if (lat > 3.10 && lat < 3.14) return 'Chow Kit, KL';
    if (lng < 101.68) return 'KL City Centre';
    return `KL (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
}

// ── Utilities ─────────────────────────────────────────────────────────────────
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
    if (hr === HumanReviewStatus.APPROVED) return { label: 'Verified', cls: 'tw-badge--green', icon: '✅', phase: 3 };
    if (hr === HumanReviewStatus.OVERRIDDEN) return { label: 'Approved', cls: 'tw-badge--cyan', icon: '✅', phase: 3 };
    if (hr === HumanReviewStatus.REJECTED) return { label: 'Rejected', cls: 'tw-badge--red', icon: '❌', phase: 3 };
    if (ai === VerificationStatus.VERIFIED) return { label: 'AI Passed', cls: 'tw-badge--yellow', icon: '⏳', phase: 2 };
    if (ai === VerificationStatus.UNVERIFIED) return { label: 'Escalated', cls: 'tw-badge--orange', icon: '⚠️', phase: 2 };
    return { label: 'Processing', cls: 'tw-badge--gray', icon: '🔄', phase: 1 };
}

// ── Distance & Time Utilities ────────────────────────────────────────────────
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function isToday(isoString: string) {
    const d = new Date(isoString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
}


// ─────────────────────────────────────────────────────────────────────────────
export function ReportPage() {
    const [screen, setScreen] = useState<ReportScreen>('LIST');
    const { floodReports, addFloodReport } = useApp();
    const geo = useGeolocation();

    const [pendingReport, setPendingReport] = useState<Omit<
        FloodReport, 'id' | 'aiResult' | 'humanReview' | 'createdAt'
    > | null>(null);

    const handleActivateEmergency = useCallback(() => setScreen('EMERGENCY'), []);
    const handleCancelEmergency = useCallback(() => { setScreen('LIST'); setPendingReport(null); }, []);

    const handleSubmitEvidence = useCallback((data: {
        photoDataURLs: string[]; category: ReportCategory;
        description: string; autoTags: AutoTags;
    }) => { setPendingReport(data); setScreen('VERIFICATION'); }, []);

    const handleVerificationComplete = useCallback((result: AIVerificationResult) => {
        if (!pendingReport) return;
        if (result.status !== VerificationStatus.REJECTED) {
            addFloodReport({
                id: crypto.randomUUID(),
                photoDataURLs: pendingReport.photoDataURLs,
                category: pendingReport.category,
                description: pendingReport.description,
                autoTags: pendingReport.autoTags,
                aiResult: result,
                humanReview: { status: HumanReviewStatus.PENDING, reviewedAt: null, moderatorNote: null },
                createdAt: new Date().toISOString(),
            });
        }
        setPendingReport(null);
        setScreen('LIST');
    }, [pendingReport, addFloodReport]);

    const handleRetry = useCallback(() => { setScreen('EMERGENCY'); setPendingReport(null); }, []);
    const handleReportSubmit = useCallback((_d: ReportFormOutput) => setScreen('LIST'), []);
    const handleSafe = useCallback(() => setScreen('LIST'), []);

    return (
        <>
            {screen === 'LIST' && (
                <FeedScreen
                    reports={floodReports}
                    onActivateEmergency={handleActivateEmergency}
                    onOpenModerator={() => setScreen('MODERATOR')}
                />
            )}
            {screen === 'EMERGENCY' && (
                <EmergencyMode onSubmit={handleSubmitEvidence} onCancel={handleCancelEmergency} />
            )}
            {screen === 'VERIFICATION' && pendingReport && (
                <AIVerification report={pendingReport} onComplete={handleVerificationComplete} onRetry={handleRetry} />
            )}
            {screen === 'REPORT' && (
                <ReportForm
                    userLocation={{ lat: geo.lat ?? 3.1578, lng: geo.lng ?? 101.7119, accuracy: geo.accuracy ?? 10 }}
                    onSubmit={handleReportSubmit}
                    onSafe={handleSafe}
                    onCancel={() => setScreen('LIST')}
                />
            )}
            {screen === 'MODERATOR' && <ModeratorPanel onBack={() => setScreen('LIST')} />}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feed / List screen
// ─────────────────────────────────────────────────────────────────────────────
function FeedScreen({
    reports,
    onActivateEmergency,
    onOpenModerator,
}: {
    reports: FloodReport[];
    onActivateEmergency: () => void;
    onOpenModerator: () => void;
}) {
    const { floodReports, userPosition } = useApp();
    const [filter, setFilter] = useState<FilterTab>('all');
    const [areaFilter, setAreaFilter] = useState<AreaFilter>('MY_AREA');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('TODAY');

    const userLat = userPosition.lat;
    const userLng = userPosition.lng;

    const filtered = useMemo(() => {
        let list = [...reports];

        // 1. Status Filter
        if (filter === 'verified') {
            list = list.filter(r =>
                r.humanReview.status === HumanReviewStatus.APPROVED ||
                r.humanReview.status === HumanReviewStatus.OVERRIDDEN,
            );
        } else if (filter === 'pending') {
            list = list.filter(r => r.humanReview.status === HumanReviewStatus.PENDING);
        }

        // 2. Area Filter
        list = list.filter(r => {
            const dist = calculateDistance(userLat, userLng, r.autoTags.lat, r.autoTags.lng);
            const inArea = dist <= 5;

            // Debug distance log to help identify why reports might be mis-categorized
            console.log(`[Filter] Report ${r.id.slice(0, 8)}: dist=${dist.toFixed(2)}km, inArea=${inArea}, filter=${areaFilter}`);

            return areaFilter === 'MY_AREA' ? inArea : !inArea;
        });

        // 3. Time Filter
        list = list.filter(r => {
            const today = isToday(r.createdAt);
            return timeFilter === 'TODAY' ? today : !today;
        });

        return list;
    }, [reports, filter, areaFilter, timeFilter, userLat, userLng]);


    const verifiedCount = reports.filter(
        r => r.humanReview.status === HumanReviewStatus.APPROVED ||
            r.humanReview.status === HumanReviewStatus.OVERRIDDEN,
    ).length;
    const pendingCount = reports.filter(r => r.humanReview.status === HumanReviewStatus.PENDING).length;

    return (
        <div className="tw-screen">

            {/* ── Top header ── */}
            <header className="tw-header">
                <div className="tw-header__left">
                    <div className="tw-header__logo">🛰️</div>
                    <div>
                        <h1 className="tw-header__title">Community <em>Sentinel</em></h1>
                        <p className="tw-header__sub">AI + Human verified reports · KL Metro</p>
                    </div>
                </div>
                <div className="tw-header__right">
                    <div className="tw-header__location-chip">
                        <span className="tw-loc-dot" />
                        <span className="tw-loc-text">{placeLabel(userLat, userLng)}</span>
                    </div>
                    
                    <button className="tw-header-report-btn" onClick={onActivateEmergency} id="report-emergency-btn">
                        🚨 Report Flood
                    </button>

                    <button className="tw-icon-btn" onClick={onOpenModerator} id="moderator-panel-btn" title="Moderator">
                        🔑
                    </button>
                    <span className="tw-live-pill"><span className="tw-live-dot" />LIVE</span>
                </div>
            </header>

            {/* ── Stats row ── */}
            <div className="tw-stats-row">
                <div className="tw-stat">
                    <span className="tw-stat__n">{reports.length}</span>
                    <span className="tw-stat__l">Total</span>
                </div>
                <div className="tw-stat-sep" />
                <div className="tw-stat">
                    <span className="tw-stat__n tw-stat__n--green">{verifiedCount}</span>
                    <span className="tw-stat__l">Verified</span>
                </div>
                <div className="tw-stat-sep" />
                <div className="tw-stat">
                    <span className="tw-stat__n tw-stat__n--yellow">{pendingCount}</span>
                    <span className="tw-stat__l">Pending</span>
                </div>
                <div className="tw-stat-sep" />
                <div className="tw-stat">
                    <span className="tw-stat__n tw-stat__n--red">
                        {reports.filter(r => isFloodActive(r)).length}
                    </span>
                    <span className="tw-stat__l">Flood Active</span>
                </div>
            </div>

            {/* ── Filter Station (New Design) ── */}
            <div className="tw-filter-station-v2">
                <div className="tw-area-row">
                    {(['MY_AREA', 'OTHER_AREAS'] as AreaFilter[]).map(a => (
                        <button
                            key={a}
                            className={`tw-area-tab ${areaFilter === a ? 'active' : ''}`}
                            onClick={() => setAreaFilter(a)}
                        >
                            <span className="tw-tab-icon">{a === 'MY_AREA' ? '📍' : '👥'}</span>
                            {a === 'MY_AREA' ? 'My Area' : 'Other Areas'}
                        </button>
                    ))}
                </div>

                <div className="tw-time-container">
                    {/* ── Sub-tabs for MY_AREA ── */}
                    <div className={`tw-time-row ${areaFilter !== 'MY_AREA' ? 'tw-time-row--dimmed' : ''}`}>
                        {(['TODAY', 'HISTORY'] as TimeFilter[]).map(t => (
                            <button
                                key={`my-${t}`}
                                className={`tw-time-tab ${areaFilter === 'MY_AREA' && timeFilter === t ? 'active' : ''}`}
                                onClick={() => {
                                    setAreaFilter('MY_AREA');
                                    setTimeFilter(t);
                                }}
                            >
                                <span className="tw-tab-icon">{t === 'TODAY' ? '📅' : '🕒'}</span>
                                {t === 'TODAY' ? 'Today' : 'History'}
                            </button>
                        ))}
                    </div>

                    {/* ── Sub-tabs for OTHER_AREAS ── */}
                    <div className={`tw-time-row ${areaFilter !== 'OTHER_AREAS' ? 'tw-time-row--dimmed' : ''}`}>
                        {(['TODAY', 'HISTORY'] as TimeFilter[]).map(t => (
                            <button
                                key={`other-${t}`}
                                className={`tw-time-tab ${areaFilter === 'OTHER_AREAS' && timeFilter === t ? 'active' : ''}`}
                                onClick={() => {
                                    setAreaFilter('OTHER_AREAS');
                                    setTimeFilter(t);
                                }}
                            >
                                <span className="tw-tab-icon">{t === 'TODAY' ? '📅' : '🕒'}</span>
                                {t === 'TODAY' ? 'Today' : 'History'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="tw-control-bar">
                <div className="tw-status-pills">
                    <button className={`tw-pill-v2 ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        📅 All
                    </button>
                    <button className={`tw-pill-v2 ${filter === 'verified' ? 'active' : ''}`} onClick={() => setFilter('verified')}>
                        ✅ Verified
                    </button>
                    <button className={`tw-pill-v2 ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                        🟡 Pending
                    </button>
                </div>

                <div className="tw-bar-actions">
                    <button className="tw-bar-btn"><span className="btn-icon">🔍</span> Filters ▾</button>
                    <button className="tw-bar-btn"><span className="btn-icon">⇅</span> Sort: Newest ▾</button>
                    <div className="tw-view-toggle">
                        <button className="tw-view-btn active">▦</button>
                        <button className="tw-view-btn">☰</button>
                    </div>
                </div>
            </div>


            {/* ── Feed content ── */}
            <div className="tw-content">
                {filtered.length === 0 ? (
                    <EmptyState filter={filter} />
                ) : (
                    <div className="tw-grid">
                        {filtered.map((r, i) => (
                            <TweetCard key={r.id} report={r} index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Bottom info bar ── */}
            <div className="tw-bottom-bar">
                <span className="tw-bottom-bar__dot" />
                Verified reports appear on the Shelter map
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual tweet-style card
// ─────────────────────────────────────────────────────────────────────────────
function TweetCard({ report, index }: { report: FloodReport; index: number }) {
    const [open, setOpen] = useState(false);
    const [imgFail, setImgFail] = useState(false);

    const profile = getProfile(report);
    const pipeline = pipelineInfo(report);
    const cat = CATEGORY_META[report.category];
    const isFlood = report.aiResult?.waterDetected === true;
    const conf = report.aiResult?.confidence ?? 0;
    const depth = report.aiResult?.depthEstimate ?? 'N/A';
    const place = placeLabel(report.autoTags.lat, report.autoTags.lng);
    const hasImg = report.photoDataURLs.length > 0;

    return (
        <article
            className="tw-card"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* ── User row ── */}
            <div className="tw-card__user-row">
                <span className="tw-card__avatar">{profile.avatar}</span>
                <div className="tw-card__user-info">
                    <span className="tw-card__name">{profile.name}</span>
                    <span className="tw-card__handle">{profile.handle} · {timeAgo(report.createdAt)}</span>
                </div>
                <span className={`tw-badge ${pipeline.cls}`}>{pipeline.icon} {pipeline.label}</span>
            </div>

            {/* ── Location ── */}
            <div className="tw-card__location">
                <span className="tw-card__loc-icon">📍</span>
                <span className="tw-card__loc-text">{place}</span>
                <span className={`tw-card__cat-chip`} style={{ color: cat.color, borderColor: cat.color }}>
                    {cat.emoji} {cat.label}
                </span>
            </div>

            {/* ── Text content ── */}
            <p className="tw-card__text">{report.description}</p>

            {/* ── Image ── */}
            {hasImg && !imgFail && (
                <div className="tw-card__img-wrap">
                    <img
                        className="tw-card__img"
                        src={report.photoDataURLs[0]}
                        alt="Flood evidence"
                        loading="lazy"
                        onError={() => setImgFail(true)}
                    />
                    {/* overlays */}
                    <div className="tw-card__img-gradient" />
                    <div className="tw-card__img-badges">
                        {isFlood && <span className="tw-img-pill tw-img-pill--red">🌊 FLOOD DETECTED</span>}
                        <span className="tw-img-pill tw-img-pill--dark">📷 User submitted</span>
                    </div>
                    <div className="tw-card__img-unverified">
                        ⚠️ Image authenticity unconfirmed — report is under verification
                    </div>
                </div>
            )}

            {/* ── Metrics row ── */}
            <div className="tw-card__metrics">
                <div className="tw-metric">
                    <span className="tw-metric__label">AI Confidence</span>
                    <div className="tw-metric__bar-bg">
                        <div
                            className="tw-metric__bar-fill"
                            style={{
                                width: `${conf}%`,
                                background: conf >= 80 ? '#22c55e' : conf >= 60 ? '#f5c542' : '#ef4444',
                            }}
                        />
                    </div>
                    <span className="tw-metric__val">{conf}%</span>
                </div>
                <div className="tw-metric-tag">
                    <span>💧</span><span>{depth}</span>
                </div>
                <div className="tw-metric-tag">
                    <span>±{report.autoTags.accuracy}m</span>
                </div>
            </div>

            {/* ── Action row ── */}
            <div className="tw-card__actions">
                <button
                    className="tw-action-btn"
                    onClick={() => setOpen(x => !x)}
                    aria-expanded={open}
                >
                    {open ? '▲ Hide details' : '▼ View AI analysis'}
                </button>
                <span className="tw-card__coords">
                    {report.autoTags.lat.toFixed(5)}, {report.autoTags.lng.toFixed(5)}
                </span>
            </div>

            {/* ── Expanded panel ── */}
            {open && (
                <div className="tw-card__expand">
                    {/* Pipeline bar */}
                    <div className="tw-pipeline">
                        {[
                            { icon: '📷', label: 'Submitted', done: pipeline.phase >= 1 },
                            { icon: '🤖', label: 'AI Review', done: pipeline.phase >= 2 },
                            { icon: '👤', label: 'Human OK', done: pipeline.phase >= 3 },
                        ].map((step, i, arr) => (
                            <span key={step.label} className="tw-pipeline__group">
                                <span className={`tw-pipeline__step ${step.done ? 'done' : ''}`}>
                                    <span className="tw-pipeline__icon">{step.icon}</span>
                                    <span className="tw-pipeline__label">{step.label}</span>
                                </span>
                                {i < arr.length - 1 && (
                                    <span className={`tw-pipeline__line ${pipeline.phase > i + 1 ? 'done' : ''}`} />
                                )}
                            </span>
                        ))}
                    </div>

                    {/* AI verdict */}
                    {report.aiResult?.summary && (
                        <div className="tw-expand__block tw-expand__block--blue">
                            <span className="tw-expand__label">🤖 AI Verdict</span>
                            <p className="tw-expand__text">{report.aiResult.summary}</p>
                        </div>
                    )}

                    {/* Anomaly tags */}
                    {(report.aiResult?.anomalies?.length ?? 0) > 0 && (
                        <div className="tw-tags">
                            {report.aiResult!.anomalies.map(a => (
                                <span key={a} className="tw-tag">⚠️ {a}</span>
                            ))}
                        </div>
                    )}

                    {/* Moderator note */}
                    {report.humanReview.moderatorNote && (
                        <div className="tw-expand__block tw-expand__block--green">
                            <span className="tw-expand__label">👤 Moderator Note</span>
                            <p className="tw-expand__text">{report.humanReview.moderatorNote}</p>
                        </div>
                    )}

                    {/* Coordinates detail */}
                    <div className="tw-coord-row">
                        <span>📡</span>
                        <span>Lat {report.autoTags.lat.toFixed(6)}, Lng {report.autoTags.lng.toFixed(6)}</span>
                        <span className="tw-coord-acc">±{report.autoTags.accuracy}m accuracy</span>
                    </div>
                </div>
            )}
        </article>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: FilterTab }) {
    return (
        <div className="tw-empty">
            <div className="tw-empty__icon">🛰️</div>
            <h2 className="tw-empty__title">
                {filter === 'all' ? 'No Reports Yet'
                    : filter === 'verified' ? 'No Verified Reports'
                        : 'No Pending Reports'}
            </h2>
            <p className="tw-empty__desc">
                {filter === 'all'
                    ? 'Use the 🚨 button to submit the first flood report.'
                    : 'Check back soon — reports are being processed.'}
            </p>
        </div>
    );
}
