import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../services/prisma.service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Model instantiation moved inside to allow dynamic system instructions

// POST /api/chat
export const chatWithBot = async (req: Request, res: Response) => {
    try {
        const { message, regionCode, sessionId } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        // 1. Fetch relevant context from DB
        let regionContext = "Unknown region";
        let portalsContext = "";
        let helplinesContext = "";

        if (regionCode) {
            const region = await prisma.region.findUnique({
                where: { code: regionCode },
                include: {
                    cyberPortals: { take: 5 },
                    helplines: { take: 5 },
                },
            });

            if (region) {
                regionContext = region.name;
                portalsContext = region.cyberPortals
                    .map((p) => `- ${p.crimeType}: ${p.officialUrl} (${p.portalName})`)
                    .join("\n");
                helplinesContext = region.helplines
                    .map((h) => `- ${h.name}: ${h.contact} (${h.availability})`)
                    .join("\n");
            }
        }

        // 2. Build augmented system prompt with DB context
        const systemInstruction = `You are a highly efficient, empathetic cybercrime victim assistance AI for the Unified Cyber Resource Intelligence Platform (UCRIP).
Active Region: ${regionContext}

Official Portals:
${portalsContext || "None in DB"}

Emergency Helplines:
${helplinesContext || "None in DB"}

CRITICAL RULES:
1. Minal and Concise: Do not dump walls of text. Keep your responses short (1-3 sentences max unless providing a specific list).
2. Highly Conversational: Engage in a two-way dialogue. Ask active follow-up questions to understand the exact situation before offering solutions.
3. Accurate & Actionable: Directly provide the phone number or portal URL from the context above if relevant. Do not guess links.
4. Formatting: Use bold text for numbers and links.`;

        // 3. Load Session History
        const sid = sessionId || `anon-${Date.now()}`;
        const existing = await prisma.chatSession.findUnique({ where: { sessionId: sid } });

        let previousHistory: any[] = [];
        let geminiHistory: any[] = [];

        if (existing && existing.history) {
            try {
                // Handling legacy raw JSON strings inside stringify issue safely
                let parsed = JSON.parse(existing.history);
                // Sometimes the history is stringified twice, let's make sure it's an array
                if (typeof parsed === 'string') parsed = JSON.parse(parsed);

                previousHistory = parsed;
                // Map to Gemini history format
                geminiHistory = previousHistory.map((entry: any) => {
                    // Try to safely parse the inner string if the migration script or previous logic over-stringified it
                    const data = typeof entry === 'string' ? JSON.parse(entry) : entry;
                    return {
                        role: data.role === "assistant" ? "model" : "user",
                        parts: [{ text: data.text || "..." }]
                    };
                });
            } catch (e) {
                console.error("Failed to parse chat history:", e);
                previousHistory = [];
                geminiHistory = [];
            }
        }

        // 4. Initialize Dynamic Model & Chat
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
        });

        const chat = model.startChat({
            history: geminiHistory,
        });

        // 5. Generate Response
        const result = await chat.sendMessage(message);
        const aiResponse = result.response.text();

        // 6. Log session in DB
        const newHistoryEntry = { role: "user", text: message };
        const newAiEntry = { role: "assistant", text: aiResponse };

        if (existing) {
            await prisma.chatSession.update({
                where: { sessionId: sid },
                data: { history: JSON.stringify([...previousHistory, newHistoryEntry, newAiEntry]) },
            });
        } else {
            await prisma.chatSession.create({
                data: { sessionId: sid, history: JSON.stringify([newHistoryEntry, newAiEntry]) },
            });
        }

        res.json({ response: aiResponse, sessionId: sid });
    } catch (e: any) {
        console.error("Chat error:", e);
        res.status(500).json({ error: "Chatbot unavailable" });
    }
};
