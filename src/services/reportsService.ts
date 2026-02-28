/**
 * reportsService.ts — Firebase Firestore service for FloodWay Community Sentinel.
 * Images live in /public; only metadata + image paths are stored in Firestore.
 *
 * Deduplication strategy:
 *   - Seeds use FIXED document IDs (setDoc, not addDoc) → re-seeding overwrites, never duplicates.
 *   - fetchReports deduplicates by matching description to handle any existing Firestore duplicates.
 *   - User-submitted reports use addDoc (random ID) and are kept as-is.
 */

import {
    collection,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { FloodReport, HumanReview } from '../types/report';
import { VerificationStatus, HumanReviewStatus, ReportCategory } from '../types/report';

const COLLECTION = 'floodReports';

// Fixed document IDs for the two seed reports — setDoc with these IDs is idempotent.
const SEED_ID_1 = 'demo-masjid-india-2026';
const SEED_ID_2 = 'demo-jln-ampang-2026';

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_REPORTS: Array<{ id: string; data: Omit<FloodReport, 'id'> }> = [
    {
        id: SEED_ID_1,
        data: {
            photoDataURLs: ['/banjir2.jpg'],
            category: ReportCategory.RISING_WATER,
            description:
                'Serious flash flood at Dataran Merdeka / Masjid India junction. Water level rising rapidly — motorcycles and cars stalled mid-road. Avoid Jalan TAR heading south.',
            autoTags: {
                lat: 3.1488,
                lng: 101.6942,
                accuracy: 8,
                timestamp: '2026-02-28T06:14:22.000Z',
                compassHeading: 270,
            },
            aiResult: {
                confidence: 93,
                status: VerificationStatus.VERIFIED,
                waterDetected: true,
                depthEstimate: '~0.8m',
                anomalies: ['multiple vehicles submerged', 'pedestrians wading waist-deep'],
                crossRefStatus: 'CONSISTENT',
                summary:
                    'High-confidence rising-water event. Brown floodwater clearly visible across the full road width. Urban infrastructure affected.',
            },
            humanReview: {
                status: HumanReviewStatus.APPROVED,
                reviewedAt: '2026-02-28T06:30:00.000Z',
                moderatorNote: 'Confirmed by JPS Selangor/KL flood alert bulletin.',
            },
            createdAt: '2026-02-28T06:14:22.000Z',
        },
    },
    {
        id: SEED_ID_2,
        data: {
            photoDataURLs: ['/banjir3.jfif'],
            category: ReportCategory.BLOCKED_ROAD,
            description:
                'Jalan Ampang near LRT Ampang Park fully submerged. Vehicles crawling through 40–50 cm water. Spotted one civilian wading with belongings — rescue may be needed.',
            autoTags: {
                lat: 3.1578,
                lng: 101.7194,
                accuracy: 12,
                timestamp: '2026-02-28T07:02:55.000Z',
                compassHeading: 180,
            },
            aiResult: {
                confidence: 87,
                status: VerificationStatus.VERIFIED,
                waterDetected: true,
                depthEstimate: '~0.5m',
                anomalies: ['heavy slow-moving traffic', 'pedestrian in active floodwater'],
                crossRefStatus: 'CONSISTENT',
                summary:
                    'Confirmed road-blocking flood. Moderate water level across full carriageway. Low-clearance vehicles should avoid.',
            },
            humanReview: {
                status: HumanReviewStatus.APPROVED,
                reviewedAt: '2026-02-28T07:20:00.000Z',
                moderatorNote: 'Ampang Park road closure confirmed with DBKL.',
            },
            createdAt: '2026-02-28T07:02:55.000Z',
        },
    },
];

/**
 * The two demo reports with their stable Firestore IDs.
 * Used as initial state so the feed renders instantly before Firestore responds.
 */
export const INITIAL_REPORTS: FloodReport[] = SEED_REPORTS.map(({ id, data }) => ({
    id,
    ...data,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function docToReport(id: string, data: Record<string, unknown>): FloodReport {
    return {
        id,
        photoDataURLs: (data.photoDataURLs as string[]) ?? [],
        category: data.category as FloodReport['category'],
        description: (data.description as string) ?? '',
        autoTags: data.autoTags as FloodReport['autoTags'],
        aiResult: (data.aiResult as FloodReport['aiResult']) ?? null,
        humanReview: data.humanReview as FloodReport['humanReview'],
        createdAt:
            data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : ((data.createdAt as string) ?? new Date().toISOString()),
    };
}

function sortByDate(reports: FloodReport[]): FloodReport[] {
    return [...reports].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

/**
 * Deduplicate Firestore results using description as the universal key.
 * This catches ALL copies of the same report regardless of document ID
 * (old addDoc random IDs AND new fixed seed IDs collapse into one).
 * The first occurrence in the (date-sorted) list wins.
 */
function deduplicate(reports: FloodReport[]): FloodReport[] {
    const seen = new Set<string>();
    const result: FloodReport[] = [];
    for (const r of reports) {
        // Universal key: first 120 chars of description (always unique between real reports)
        const key = r.description.trim().slice(0, 120);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(r);
        }
    }
    return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all reports from Firestore, purge old duplicates, deduplicate, sort.
 */
export async function fetchReports(): Promise<FloodReport[]> {
    const col = collection(db, COLLECTION);

    try {
        // Upsert the two canonical seed docs (idempotent)
        await ensureSeedDocs();

        const snap = await getDocs(col);
        const allDocs = snap.docs;

        // --- Auto-purge stale duplicate docs from Firestore -----------------
        // Any doc whose description matches a seed description but whose ID is
        // NOT one of the fixed seed IDs is a stale addDoc leftover → delete it.
        const SEED_DESCRIPTIONS = SEED_REPORTS.map(s => s.data.description.trim());
        const stale = allDocs.filter(d => {
            const desc = ((d.data().description as string) ?? '').trim();
            const isSeedContent = SEED_DESCRIPTIONS.includes(desc);
            const isOfficialSeedDoc = d.id === SEED_ID_1 || d.id === SEED_ID_2;
            return isSeedContent && !isOfficialSeedDoc;
        });
        if (stale.length > 0) {
            console.log(`[reportsService] Purging ${stale.length} stale duplicate doc(s)...`);
            await Promise.all(stale.map(d => deleteDoc(d.ref)));
        }
        // --------------------------------------------------------------------

        const reports = allDocs
            .filter(d => !stale.find(s => s.id === d.id)) // exclude just-deleted docs
            .map(d => docToReport(d.id, d.data() as Record<string, unknown>));

        return sortByDate(deduplicate(reports));
    } catch (err) {
        console.warn('[reportsService] Firestore unavailable, using local seed data:', err);
        return sortByDate([...INITIAL_REPORTS]);
    }
}

/** Save a user-submitted FloodReport to Firestore. Returns the document id. */
export async function saveReport(report: Omit<FloodReport, 'id'>): Promise<string> {
    const col = collection(db, COLLECTION);
    const ref = await addDoc(col, report);
    return ref.id;
}

/** Persist a moderator review decision to Firestore. */
export async function updateReportHumanReview(
    reportId: string,
    review: HumanReview,
): Promise<void> {
    const ref = doc(db, COLLECTION, reportId);
    await updateDoc(ref, { humanReview: review });
}

/** Permanently delete a flood report from Firestore. */
export async function deleteReport(reportId: string): Promise<void> {
    const ref = doc(db, COLLECTION, reportId);
    await deleteDoc(ref);
}

// ─── Private ──────────────────────────────────────────────────────────────────

/**
 * Write (or overwrite) the two seed documents using fixed IDs.
 * setDoc is idempotent — calling this 100 times creates exactly 2 documents.
 */
async function ensureSeedDocs(): Promise<void> {
    for (const { id, data } of SEED_REPORTS) {
        const ref = doc(db, COLLECTION, id);
        // merge:false → fully overwrites, ensuring data stays current
        await setDoc(ref, data, { merge: false });
    }
}
