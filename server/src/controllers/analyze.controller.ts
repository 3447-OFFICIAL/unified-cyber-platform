import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "MOCK_KEY");

// POST /api/analyze-scam
export const analyzeScam = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text or URL to analyze is required" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = `
        You are an elite cybersecurity analyst specializing in OSINT and threat detection.
        Analyze the following text, email, or URL for signs of phishing, scams, or malicious intent.
        
        Provide a structured JSON response with the following keys:
        - "riskLevel": Must be exactly one of: "Low", "Medium", "High", or "Critical".
        - "analysis": A short, direct paragraph (max 3 sentences) explaining why it is safe or dangerous.
        - "keyIndicators": An array of strings highlighting specific red flags (e.g., "Urgency implied", "Suspicious domain").
        - "action": A single sentence instructing the user on what to do next (e.g., "Do not click any links and delete the message.").

        Text to analyze:
        """
        ${text}
        """
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // The model is forced to return JSON, parse it
        const analysisData = JSON.parse(responseText);

        res.json(analysisData);
    } catch (e: any) {
        console.error("AI Analysis Error:", e);
        res.status(500).json({
            error: "Failed to analyze the content",
            details: e.message || "Unknown error",
        });
    }
};
