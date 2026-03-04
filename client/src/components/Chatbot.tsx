"use client";
import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    role: "user" | "assistant";
    text: string;
}

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
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

    const toggleOpen = () => {
        setOpen(!open);
        if (open) setIsMaximized(false);
    };

    return (
        <>
            {/* Floating Button */}
            <button onClick={toggleOpen} style={{
                position: "fixed", bottom: 24, right: 24, zIndex: 9999,
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
                    position: "fixed",
                    bottom: isMaximized ? 0 : 100,
                    right: isMaximized ? 0 : 24,
                    zIndex: 9999,
                    width: isMaximized ? "100%" : 400,
                    height: isMaximized ? "100%" : 600,
                    maxHeight: isMaximized ? "100%" : "80vh",
                    background: "#0d1526",
                    border: isMaximized ? "none" : "1px solid rgba(0, 242, 255, 0.2)",
                    borderRadius: isMaximized ? 0 : 16,
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: isMaximized ? "none" : "0 20px 60px rgba(0,0,0,0.8)",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "1rem 1.25rem",
                        background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.1))",
                        borderBottom: "1px solid rgba(0, 242, 255, 0.2)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: "1.5rem" }}>🤖</div>
                            <div>
                                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.95rem" }}>CyberGuide AI</div>
                                <div style={{ fontSize: "0.7rem", color: "#22c55e", letterSpacing: "0.05em" }}>● SECURE LINK ACTIVE</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                onClick={() => setIsMaximized(!isMaximized)}
                                style={{
                                    background: "transparent", border: "none", color: "var(--accent)",
                                    cursor: "pointer", fontSize: "1rem", padding: "4px", borderRadius: "4px",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                            >
                                {isMaximized ? "🗗" : "🗖"}
                            </button>
                            <button
                                onClick={toggleOpen}
                                style={{
                                    background: "transparent", border: "none", color: "var(--text-muted)",
                                    cursor: "pointer", fontSize: "1.2rem", padding: "4px", borderRadius: "4px",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: isMaximized ? "2rem" : "1rem", display: "flex", flexDirection: "column", gap: 16 }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            }}>
                                <div style={{
                                    maxWidth: isMaximized ? "70%" : "85%",
                                    padding: "0.8rem 1.2rem",
                                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                    background: msg.role === "user"
                                        ? "linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(124, 58, 237, 0.2))"
                                        : "rgba(255,255,255,0.03)",
                                    border: msg.role === "user" ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(255,255,255,0.05)",
                                    color: "#f8fafc", fontSize: "0.9rem", lineHeight: 1.6,
                                }}>
                                    {msg.role === "user" ? (
                                        <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                                    ) : (
                                        <div className="markdown-body" style={{
                                            background: "transparent",
                                            color: "inherit",
                                            fontSize: "0.9rem"
                                        }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: "flex", gap: 4, padding: "0.5rem 0", alignSelf: "flex-start" }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", opacity: 0.6,
                                        animation: `pulse ${0.8 + i * 0.15}s ease-in-out infinite alternate`
                                    }} />
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: "1rem", borderTop: "1px solid rgba(0, 242, 255, 0.1)", display: "flex", gap: 12, background: "rgba(10, 17, 34, 0.6)" }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your cyber incident... (Enter to send)"
                            rows={isMaximized ? 3 : 2}
                            style={{
                                flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 12, padding: "0.8rem 1rem", color: "#e2e8f0",
                                fontSize: "0.9rem", resize: "none", outline: "none", fontFamily: "inherit",
                                transition: "border 0.2s"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "var(--accent-glow)"}
                            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                        />
                        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                            background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))", border: "none",
                            borderRadius: 12, padding: "0 1.2rem", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                            opacity: loading || !input.trim() ? 0.5 : 1, fontSize: "1.2rem", color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            ➤
                        </button>
                    </div>

                    {/* Disclaimer */}
                    <div style={{ padding: "0.5rem 1rem", background: "rgba(0,0,0,0.2)", fontSize: "0.65rem", color: "var(--text-muted)", textAlign: "center", letterSpacing: "0.05em" }}>
                        ⚠️ AI GENERATED GUIDANCE. NOT LEGAL OR BINDING ADVICE.
                    </div>
                </div>
            )}
        </>
    );
}
