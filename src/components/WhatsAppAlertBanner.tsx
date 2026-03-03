import { useState, useCallback } from 'react';
import type { DailyPrediction, HourlyPrediction } from '@/types/app';

interface WhatsAppAlertBannerProps {
    prediction: DailyPrediction;
    locationName?: string;
}

const STORAGE_KEY = 'floodway_wa_alert_dismissed';
const THROTTLE_HOURS = 6;

function hasBeenDismissedRecently(): boolean {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const ts = Number(raw);
        const hoursSince = (Date.now() - ts) / 1000 / 3600;
        return hoursSince < THROTTLE_HOURS;
    } catch {
        return false;
    }
}

function buildWhatsAppMessage(
    riskLevel: string,
    probability: number,
    peakHour: string,
    locationName: string,
): string {
    const emoji = riskLevel === 'danger' ? '🔴' : '⚠️';
    const label = riskLevel === 'danger' ? 'DANGER — Evacuate Now' : 'WARNING — Stay Alert';

    return [
        `${emoji} FLOOD ${label}`,
        `📍 Area: ${locationName}`,
        `💧 Risk Level: ${(probability * 100).toFixed(0)}% probability`,
        `⏰ Peak Risk: ${peakHour}`,
        ``,
        `🏃 Find nearest shelter:`,
        `https://floodways.netlify.app/shelters`,
        ``,
        `🔔 Share this alert with family & neighbours.`,
        `— FloodWay Early Warning System 🇲🇾`,
    ].join('\n');
}

export function WhatsAppAlertBanner({ prediction, locationName = 'your area' }: WhatsAppAlertBannerProps) {
    const [dismissed, setDismissed] = useState(() => {
        // DANGER always overrides dismiss — too critical to throttle.
        if (prediction.overallRisk === 'danger') return false;
        return hasBeenDismissedRecently();
    });

    const riskLevel = prediction.overallRisk; // 'safe' | 'warning' | 'danger'
    const shouldShow = (riskLevel === 'warning' || riskLevel === 'danger') && !dismissed;

    // Find the peak risk hour label from hourly data
    const peakEntry = prediction.hourlyPredictions?.reduce((max: HourlyPrediction, cur: HourlyPrediction) =>
        (cur.probability ?? 0) > (max.probability ?? 0) ? cur : max,
        prediction.hourlyPredictions[0],
    );
    const peakHour = peakEntry?.time ?? 'tonight';

    // Overall probability: highest hour value
    const maxProbability = peakEntry?.probability ?? 0.6;

    const handleShare = useCallback(() => {
        const msg = buildWhatsAppMessage(riskLevel, maxProbability, peakHour, locationName);
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }, [riskLevel, maxProbability, peakHour, locationName]);

    const handleDismiss = useCallback(() => {
        try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* ignore */ }
        setDismissed(true);
    }, []);

    if (!shouldShow) return null;

    const isDanger = riskLevel === 'danger';

    return (
        <div
            className={`
                relative overflow-hidden rounded-[1.5rem] p-4
                border backdrop-blur-xl shadow-2xl
                animate-in slide-in-from-top-3 fade-in duration-500
                ${isDanger
                    ? 'bg-red-950/90 border-red-500/40 shadow-red-900/40'
                    : 'bg-amber-950/90 border-amber-500/40 shadow-amber-900/40'
                }
            `}
            role="alert"
            aria-live="assertive"
        >
            {/* Glow blob */}
            <div className={`
                absolute -right-10 -top-10 size-32 rounded-full blur-[60px] opacity-30 pointer-events-none
                ${isDanger ? 'bg-red-500' : 'bg-amber-400'}
            `} />

            {/* Close button */}
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 size-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white text-sm transition-all z-10"
                aria-label="Dismiss alert"
                id="wa-alert-dismiss-btn"
            >
                ×
            </button>

            <div className="flex items-start gap-3 relative z-10 pr-6">
                {/* Icon */}
                <div className={`
                    shrink-0 size-10 rounded-xl flex items-center justify-center text-xl
                    ${isDanger
                        ? 'bg-red-500/20 border border-red-500/30'
                        : 'bg-amber-500/20 border border-amber-500/30'
                    }
                    ${isDanger ? 'animate-pulse' : ''}
                `}>
                    {isDanger ? '🔴' : '⚠️'}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <p className={`text-xs font-black uppercase tracking-widest mb-0.5 ${isDanger ? 'text-red-300' : 'text-amber-300'}`}>
                        Flood {isDanger ? 'Danger' : 'Warning'} Detected
                    </p>
                    <p className="text-sm text-white/85 font-medium leading-snug mb-3">
                        {isDanger
                            ? 'Evacuation advised. Alert your family now.'
                            : 'Heavy rain expected. Notify loved ones to prepare.'
                        }
                    </p>

                    {/* WhatsApp button */}
                    <button
                        onClick={handleShare}
                        id="wa-share-btn"
                        className="
                            flex items-center gap-2 px-4 py-2.5 rounded-xl
                            bg-[#25D366] hover:bg-[#20b558]
                            text-white font-bold text-sm
                            shadow-lg shadow-[#25D366]/30
                            active:scale-95 transition-all duration-150
                            select-none
                        "
                    >
                        {/* WhatsApp SVG icon */}
                        <svg
                            viewBox="0 0 32 32"
                            className="size-4 fill-white shrink-0"
                            aria-hidden="true"
                        >
                            <path d="M16 0C7.163 0 0 7.163 0 16c0 2.833.744 5.494 2.043 7.8L0 32l8.4-2.143A15.933 15.933 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.27 22.37c-.34.96-1.98 1.84-2.72 1.96-.7.11-1.58.16-2.55-.16a23.3 23.3 0 01-2.31-.85C13.2 21.93 10.5 19.1 9.86 18.22c-.64-.88-1.08-1.87-1.08-2.93 0-1.05.52-1.97 1.09-2.55.29-.3.64-.45.95-.45.12 0 .23.01.33.01.29.01.44.03.63.5.21.5.72 1.73.78 1.86.07.13.11.28.02.45-.08.17-.12.28-.24.43-.12.15-.25.33-.36.44-.12.12-.24.25-.1.49.14.24.61 1.01 1.31 1.63.9.8 1.66 1.05 1.9 1.17.24.11.38.09.52-.05.14-.14.59-.7.75-.94.16-.24.32-.2.54-.12.22.08 1.37.64 1.6.76.24.12.4.18.46.28.06.1.06.6-.28 1.56z" />
                        </svg>
                        Share Alert on WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}
