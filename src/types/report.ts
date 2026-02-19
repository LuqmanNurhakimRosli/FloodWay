// ── Community Sentinel: Core Types ──

export const ReportCategory = {
    RISING_WATER: 'RISING_WATER',
    BLOCKED_ROAD: 'BLOCKED_ROAD',
    TRAPPED_VICTIM: 'TRAPPED_VICTIM',
    LANDSLIDE: 'LANDSLIDE',
} as const;
export type ReportCategory = (typeof ReportCategory)[keyof typeof ReportCategory];

export const CATEGORY_META: Record<
    ReportCategory,
    { emoji: string; label: string; color: string; severity: number }
> = {
    [ReportCategory.RISING_WATER]: {
        emoji: '🌊',
        label: 'Rising Water',
        color: '#f5c542',
        severity: 2,
    },
    [ReportCategory.BLOCKED_ROAD]: {
        emoji: '⛔',
        label: 'Blocked Road',
        color: '#e74c3c',
        severity: 3,
    },
    [ReportCategory.TRAPPED_VICTIM]: {
        emoji: '🏠',
        label: 'Trapped Victim',
        color: '#e040fb',
        severity: 4,
    },
    [ReportCategory.LANDSLIDE]: {
        emoji: '⛰️',
        label: 'Landslide',
        color: '#ff9800',
        severity: 3,
    },
};

export const VerificationStatus = {
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    UNVERIFIED: 'UNVERIFIED',
    REJECTED: 'REJECTED',
} as const;
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export interface AutoTags {
    lat: number;
    lng: number;
    accuracy: number; // meters
    timestamp: string; // ISO-8601
    compassHeading: number | null; // degrees 0-360
}

export interface AIVerificationResult {
    confidence: number; // 0-100
    status: VerificationStatus;
    waterDetected: boolean;
    depthEstimate: string | null; // e.g. "~0.5m"
    anomalies: string[];
    crossRefStatus: 'CONSISTENT' | 'MISMATCH' | 'UNKNOWN';
    summary: string; // human-readable AI verdict
    rawAiResponse?: Record<string, unknown>; // raw Gemini JSON for demo visibility
    apiDurationMs?: number; // how long the API call took
}

// ── Human Review Pipeline ──
export const HumanReviewStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    OVERRIDDEN: 'OVERRIDDEN', // moderator overrides AI rejection
    REJECTED: 'REJECTED',
} as const;
export type HumanReviewStatus = (typeof HumanReviewStatus)[keyof typeof HumanReviewStatus];

export interface HumanReview {
    status: HumanReviewStatus;
    reviewedAt: string | null; // ISO-8601
    moderatorNote: string | null;
}

export interface FloodReport {
    id: string;
    photoDataURLs: string[];
    category: ReportCategory;
    description: string;
    autoTags: AutoTags;
    aiResult: AIVerificationResult | null;
    humanReview: HumanReview; // dual verification layer 2
    createdAt: string;
}

// Helper: is a report fully verified (both AI + Human)?
export function isFullyVerified(report: FloodReport): boolean {
    const aiOk = report.aiResult?.status === VerificationStatus.VERIFIED;
    const humanOk = report.humanReview.status === HumanReviewStatus.APPROVED
        || report.humanReview.status === HumanReviewStatus.OVERRIDDEN;
    return aiOk || humanOk;
}

export type AppScreen = 'MAP' | 'EMERGENCY' | 'VERIFICATION' | 'REPORT';

// ── ReportForm "Golden Record" ──
export interface ReportFormOutput {
    report_id: string;
    user_id: string;
    timestamp: string;
    location: {
        latitude: number;
        longitude: number;
        accuracy: number;
    };
    user_input: {
        image_blob: string | null;
        description: string;
        needs_rescue: boolean;
    };
    ai_analysis: {
        detected_type: string;
        severity: string;
        is_verified: boolean;
        ai_feedback: string;
    };
}
