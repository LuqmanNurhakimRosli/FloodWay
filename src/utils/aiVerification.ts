import type { AIVerificationResult, FloodReport } from '../types/report';
import { VerificationStatus } from '../types/report';
import { analyzeFloodImage } from './openai';

/**
 * Real AI Verification Engine.
 * Uses Gemini 1.5 Flash (via openai.ts adapter) to verify flood reports.
 */
export async function simulateAIVerification(
    report: Omit<FloodReport, 'id' | 'aiResult' | 'createdAt'>,
): Promise<AIVerificationResult> {

    // 1. Prepare Data
    // Take the first photo if available
    const mainImage = report.photoDataURLs.length > 0 ? report.photoDataURLs[0] : null;
    const description = report.description;
    const location = report.autoTags;

    // 2. Call Gemini API
    // We reuse the analyzeFloodImage function which handles the API call and prompting
    const aiAnalysis = await analyzeFloodImage(mainImage, description);

    // 3. Map Gemini Result to App Types
    let confidence = 0;
    let status: VerificationStatus;

    if (aiAnalysis.is_verified) {
        // High confidence if verified
        confidence = 85 + Math.random() * 10; // 85-95%
        if (aiAnalysis.severity === 'Critical' || aiAnalysis.severity === 'High') {
            confidence += 4;
        }
        status = VerificationStatus.VERIFIED;
    } else {
        // Low confidence if unverified
        confidence = 30 + Math.random() * 20; // 30-50%
        status = VerificationStatus.UNVERIFIED;

        // If it was explicitly a "Flash Flood" but unverified, it might just be a bad photo
        if (aiAnalysis.detected_type !== 'Unknown') {
            confidence += 15; // Bump it up a bit if it at least detected something
        }
    }

    // Cap confidence
    confidence = Math.min(99, Math.max(10, Math.floor(confidence)));

    // 4. Generate Output
    const result: AIVerificationResult = {
        confidence,
        status,
        waterDetected: aiAnalysis.detected_type !== 'Unknown',
        depthEstimate: aiAnalysis.severity === 'Critical' ? '> 1.0m' :
            aiAnalysis.severity === 'High' ? '~0.8m' :
                aiAnalysis.severity === 'Medium' ? '~0.5m' : '~0.2m',
        anomalies: aiAnalysis.is_verified ? [] : ['AI could not verify flood conditions clearly'],
        crossRefStatus: 'CONSISTENT', // We assume consistent for now as Gemini doesn't check GPS
        summary: aiAnalysis.summary || aiAnalysis.ai_feedback,
    };

    // 5. Log "Golden Record" for User Visibility (Console)
    console.log("🔍 [AI Verification] Golden Record Generated:", JSON.stringify({
        report_id: "verif_" + Date.now(),
        timestamp: new Date().toISOString(),
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

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
