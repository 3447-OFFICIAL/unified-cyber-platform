import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../services/prisma.service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        const systemPrompt = `You are a cybercrime victim assistance assistant for the Unified Cyber Resource Intelligence Platform.
The user is based in: ${regionContext}

Official Reporting Portals available in ${regionContext}:
${portalsContext || "No portals data available for this region."}

Emergency Helplines available in ${regionContext}:
${helplinesContext || "No helplines data available for this region."}

Instructions:
- Be empathetic, clear, and concise.
- Provide step-by-step guidance for cybercrime victims.
- Always suggest the correct official reporting portal based on the crime type.
- Remind users to preserve evidence (screenshots, emails, transaction IDs).
- Never provide legal advice — only informational guidance.
- If unsure, direct users to the nearest cybercrime station or official portal.

User says: ${message}`;

        // 3. Call Gemini
        const result = await model.generateContent(systemPrompt);
        const aiResponse = result.response.text();

        // 4. Log session in DB
        const sid = sessionId || `anon-${Date.now()}`;
        const existing = await prisma.chatSession.findUnique({ where: { sessionId: sid } });
        const historyEntry = JSON.stringify({ role: "user", text: message });
        const aiEntry = JSON.stringify({ role: "assistant", text: aiResponse });

        if (existing) {
            const prevHistory = JSON.parse(existing.history) as object[];
            await prisma.chatSession.update({
                where: { sessionId: sid },
                data: { history: JSON.stringify([...prevHistory, historyEntry, aiEntry]) },
            });
        } else {
            await prisma.chatSession.create({
                data: { sessionId: sid, history: JSON.stringify([historyEntry, aiEntry]) },
            });
        }

        res.json({ response: aiResponse, sessionId: sid });
    } catch (e: any) {
        console.error("Chat error:", e);
        res.status(500).json({ error: "Chatbot unavailable", detail: e.message });
    }
};
