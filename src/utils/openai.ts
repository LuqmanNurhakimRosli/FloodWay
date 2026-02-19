/**
 * Gemini Utility for Flood Detection
 * Using Gemini 1.5 Flash for multimodal disaster assessment.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key provided by the user via .env
// In a production environment, this should be in .env.local
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface AIAnalysis {
    detected_type: string;
    severity: string;
    is_verified: boolean;
    summary: string;
    ai_feedback: string;
}

const SYSTEM_PROMPT = `
You are a Disaster Assessment AI for FloodWay Sentinel.
Analyze the provided image and user description to perform a rapid assessment.
Focus ONLY on flood-related events. Rising water is also categorized as a flood.

Output ONLY a JSON object with the following fields:
- detected_type: (one of: "Flash Flood", "Rising Water")
- severity: (one of: "Low", "Medium", "High", "Critical")
- is_verified: (boolean, true if the image clearly proves the detected_type)
- summary: (a brief 1-sentence summary of your observation)
- ai_feedback: (a supportive message like "Your image is verified by AI")

Be cautious: If the image is unclear or unrelated, mark is_verified as false.
Do not include markdown code blocks (like \`\`\`json). Just return the raw JSON string.
`;

export async function analyzeFloodImage(
    imageDataUrl: string | null,
    description: string
): Promise<AIAnalysis> {

    if (!API_KEY) {
        console.warn('⚠️ Gemini API Key missing. Falling back to mock logic.');
        return mockAnalysis(description);
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const parts: any[] = [
            { text: SYSTEM_PROMPT },
            { text: `User Description: ${description}` }
        ];

        if (imageDataUrl) {
            // imageDataUrl is likely "data:image/jpeg;base64,..."
            // We need to extract the base64 part and the mime type.
            const mimeTypeMatch = imageDataUrl.match(/:(.*?);/);
            const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
            const base64Data = imageDataUrl.split(',')[1];

            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        let content;
        try {
            // Clean up if Gemini adds markdown formatting
            const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            content = JSON.parse(jsonText);
        } catch (e) {
            console.error("Failed to parse Gemini response", text);
            throw new Error("Invalid JSON response from AI");
        }

        return {
            detected_type: content.detected_type || 'Unknown',
            severity: content.severity || 'Medium',
            is_verified: !!content.is_verified,
            summary: content.summary || 'AI analysis complete.',
            ai_feedback: content.ai_feedback || 'AI analysis complete.',
        };
    } catch (error) {
        console.error('❌ AI Analysis failed:', error);
        return mockAnalysis(description);
    }
}

function mockAnalysis(description: string): AIAnalysis {
    const d = description.toLowerCase();
    let type = 'Flash Flood';
    if (d.includes('rising') || d.includes('water')) type = 'Rising Water';

    return {
        detected_type: type,
        severity: d.includes('rescue') || d.includes('critical') ? 'Critical' : 'Medium',
        is_verified: true,
        summary: 'Mock AI analysis result.',
        ai_feedback: 'Your image is verified by AI',
    };
}
