"use client";

import { useState } from "react";
import { api } from "../../lib/api";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface AnalysisResult {
    riskLevel: RiskLevel;
    analysis: string;
    keyIndicators: string[];
    action: string;
}

const RISK_COLORS: Record<RiskLevel, string> = {
    Low: "#22c55e",
    Medium: "#f59e0b",
    High: "#f97316",
    Critical: "#ef4444",
};

export default function AnalyzerPage() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await api.post("/analyze", { text: input });
            setResult(res.data);
        } catch (err: any) {
            console.error(err);
            setError("Failed to analyze content. The AI engine might be temporarily unavailable.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "calc(100vh - 120px)" }}>
            <header style={{ marginBottom: "2rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(90deg, #258cf4, #7c3aed)" }}>
                    AI Threat Analyzer
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
                    Paste suspicious emails, SMS messages, or URLs below for instant forensic analysis.
                </p>
            </header>

            <div className="card" style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. 'URGENT: Your account will be locked in 24 hours. Click here to verify your identity: http://verify-secure-login.net'"
                    style={{
                        width: "100%",
                        height: "150px",
                        background: "rgba(0,0,0,0.2)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "1rem",
                        color: "var(--text-primary)",
                        fontSize: "1rem",
                        resize: "vertical",
                        fontFamily: "monospace",
                        marginBottom: "1.5rem",
                        textAlign: "center"
                    }}
                />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", width: "100%" }}>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !input.trim()}
                        className="btn-primary"
                        style={{ padding: "0.8rem 2rem", fontSize: "1.1rem", opacity: loading || !input.trim() ? 0.7 : 1, width: "100%", maxWidth: "300px" }}
                    >
                        {loading ? "ANALYZING..." : "SCAN INTENT ⚡"}
                    </button>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>End-to-end encrypted analysis frame</span>
                </div>
            </div>

            {error && (
                <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", borderRadius: "8px", color: "var(--danger)", textAlign: "center" }}>
                    {error}
                </div>
            )}

            {result && (
                <div className="card" style={{ borderTop: `4px solid ${RISK_COLORS[result.riskLevel]}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Threat Intelligence Report</h2>
                        <div style={{ padding: "0.5rem 1rem", borderRadius: "20px", background: `${RISK_COLORS[result.riskLevel]}20`, color: RISK_COLORS[result.riskLevel], fontWeight: 800, border: `1px solid ${RISK_COLORS[result.riskLevel]}40`, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: RISK_COLORS[result.riskLevel], boxShadow: `0 0 10px ${RISK_COLORS[result.riskLevel]}` }}></span>
                            RISK LEVEL: {result.riskLevel.toUpperCase()}
                        </div>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Forensic Analysis</h3>
                        <p style={{ lineHeight: 1.6, color: "var(--text-primary)" }}>{result.analysis}</p>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Identified Red Flags</h3>
                        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                            {result.keyIndicators.length === 0 ? (
                                <li style={{ color: "var(--text-primary)", padding: "0.5rem 0" }}>✓ No critical red flags detected.</li>
                            ) : (
                                result.keyIndicators.map((indicator, idx) => (
                                    <li key={idx} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)", display: "flex", gap: "0.8rem", color: "var(--text-primary)" }}>
                                        <span style={{ color: "var(--danger)" }}>🚩</span> {indicator}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div style={{ background: "rgba(37, 140, 244, 0.05)", padding: "1.5rem", borderRadius: "8px", borderLeft: "4px solid var(--accent)" }}>
                        <h3 style={{ fontSize: "0.9rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Recommended Action</h3>
                        <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>{result.action}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
