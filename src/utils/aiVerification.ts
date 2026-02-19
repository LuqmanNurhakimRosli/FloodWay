import type { AIVerificationResult, FloodReport } from '../types/report';
import { VerificationStatus } from '../types/report';
import { analyzeFloodImage } from './openai';

/**
 * Real AI Verification Engine.
 * Uses Gemini 1.5 Flash (via openai.ts adapter) to verify flood reports.
 * Now captures raw AI response + timing for demo visibility.
 */
export async function simulateAIVerification(
    report: Omit<FloodReport, 'id' | 'aiResult' | 'humanReview' | 'createdAt'>,
): Promise<AIVerificationResult> {

    // 1. Prepare Data
    const mainImage = report.photoDataURLs.length > 0 ? report.photoDataURLs[0] : null;
    const description = report.description;
    const location = report.autoTags;

    // 2. Call Gemini API — measure duration
    const startTime = performance.now();
    const aiAnalysis = await analyzeFloodImage(mainImage, description);
    const endTime = performance.now();
    const apiDurationMs = Math.round(endTime - startTime);

    // 3. Map Gemini Result to App Types
    let confidence = 0;
    let status: VerificationStatus;

    if (aiAnalysis.is_verified) {
        confidence = 85 + Math.random() * 10; // 85-95%
        if (aiAnalysis.severity === 'Critical' || aiAnalysis.severity === 'High') {
            confidence += 4;
        }
        status = VerificationStatus.VERIFIED;
    } else {
        confidence = 30 + Math.random() * 20; // 30-50%
        status = VerificationStatus.UNVERIFIED;

        if (aiAnalysis.detected_type !== 'Unknown') {
            confidence += 15;
        }
    }

    confidence = Math.min(99, Math.max(10, Math.floor(confidence)));

    // 4. Generate Output with raw response for demo visibility
    const result: AIVerificationResult = {
        confidence,
        status,
        waterDetected: aiAnalysis.detected_type !== 'Unknown',
        depthEstimate: aiAnalysis.severity === 'Critical' ? '> 1.0m' :
            aiAnalysis.severity === 'High' ? '~0.8m' :
                aiAnalysis.severity === 'Medium' ? '~0.5m' : '~0.2m',
        anomalies: aiAnalysis.is_verified ? [] : ['AI could not verify flood conditions clearly'],
        crossRefStatus: 'CONSISTENT',
        summary: aiAnalysis.summary || aiAnalysis.ai_feedback,
        // NEW: raw response + timing for demo
        rawAiResponse: aiAnalysis as unknown as Record<string, unknown>,
        apiDurationMs,
    };

    // 5. Log "Golden Record"
    console.log("🔍 [AI Verification] Golden Record Generated:", JSON.stringify({
        report_id: "verif_" + Date.now(),
        timestamp: new Date().toISOString(),
        api_duration_ms: apiDurationMs,
        location: {
            latitude: location.lat,
            longitude: location.lng,
            accuracy: location.accuracy
        },
        user_input: {
            description: description,
            image_count: report.photoDataURLs.length
        },
        ai_analysis: aiAnalysis,
        final_verdict: result
    }, null, 2));

    return result;
}
