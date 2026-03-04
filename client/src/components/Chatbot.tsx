"use client";
import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";

interface Message {
    role: "user" | "assistant";
    text: string;
}

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", text: "Hello! I'm your Cyber Crime Assistance Bot. How can I help you today? You can describe what happened to you and I'll guide you step by step." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(`session-${Date.now()}`);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const getRegion = () => localStorage.getItem("selectedRegionCode") || "IN";

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);

        try {
            const res = await api.post("/chat", {
                message: userMessage,
                regionCode: getRegion(),
                sessionId,
            });
            setMessages((prev) => [...prev, { role: "assistant", text: res.data.response }]);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble connecting. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <>
            {/* Floating Button */}
            <button onClick={() => setOpen(!open)} style={{
                position: "fixed", bottom: 24, right: 24, zIndex: 100,
                width: 56, height: 56, borderRadius: "50%",
                background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
                border: "none", cursor: "pointer", fontSize: "1.5rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 0 0 rgba(0,212,255,0.4)",
                animation: open ? "none" : "pulse-glow 2s ease-in-out infinite",
                transition: "transform 0.2s",
                transform: open ? "scale(0.9)" : "scale(1)",
            }}>
                {open ? "✕" : "🤖"}
            </button>

            {/* Chat Window */}
            {open && (
                <div style={{
                    position: "fixed", top: "50%", left: "50%", zIndex: 100,
                    transform: "translate(-50%, -50%)",
                    width: 400, height: 600, maxHeight: "85vh",
                    background: "#0d1526", border: "1px solid #1e3a5f",
                    borderRadius: 16, display: "flex", flexDirection: "column",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
                    overflow: "hidden",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "1rem 1.25rem",
                        background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.1))",
                        borderBottom: "1px solid #1e3a5f",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: "1.5rem" }}>🤖</div>
                            <div>
                                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.95rem" }}>CyberGuide AI</div>
                                <div style={{ fontSize: "0.7rem", color: "#22c55e" }}>● Online — Powered by Gemini</div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: 12 }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            }}>
                                <div style={{
                                    maxWidth: "80%", padding: "0.7rem 1rem",
                                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                    background: msg.role === "user"
                                        ? "linear-gradient(135deg, #00d4ff22, #7c3aed33)"
                                        : "rgba(255,255,255,0.05)",
                                    border: msg.role === "user" ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                                    color: "#e2e8f0", fontSize: "0.85rem", lineHeight: 1.6,
                                    whiteSpace: "pre-wrap",
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: "flex", gap: 4, padding: "0.5rem 0" }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: 8, height: 8, borderRadius: "50%", background: "#00d4ff", opacity: 0.6,
                                        animation: `pulse ${0.8 + i * 0.15}s ease-in-out infinite alternate`
                                    }} />
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: "0.75rem", borderTop: "1px solid #1e3a5f", display: "flex", gap: 8 }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your issue... (Enter to send)"
                            rows={2}
                            style={{
                                flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid #1e3a5f",
                                borderRadius: 10, padding: "0.6rem 0.8rem", color: "#e2e8f0",
                                fontSize: "0.85rem", resize: "none", outline: "none", fontFamily: "inherit",
                            }}
                        />
                        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                            background: "linear-gradient(135deg, #00d4ff, #7c3aed)", border: "none",
                            borderRadius: 10, padding: "0 0.8rem", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                            opacity: loading || !input.trim() ? 0.5 : 1, fontSize: "1.2rem", color: "white",
                        }}>
                            ➤
                        </button>
                    </div>

                    {/* Disclaimer */}
                    <div style={{ padding: "0.4rem 1rem", background: "rgba(245,158,11,0.05)", borderTop: "1px solid #1e3a5f", fontSize: "0.65rem", color: "#78716c", textAlign: "center" }}>
                        ⚠️ Informational only. Not legal advice. No PII stored.
                    </div>
                </div>
            )}
        </>
    );
}
