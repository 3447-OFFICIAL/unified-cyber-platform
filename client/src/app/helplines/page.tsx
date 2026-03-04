"use client";
import { useState, useEffect } from "react";
import { api, Helpline } from "@/lib/api";

export default function HelplinesPage() {
    const [helplines, setHelplines] = useState<Helpline[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHelplines = (code: string) => {
        setLoading(true);
        api.get(`/helplines?regionCode=${code}`).then(r => setHelplines(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => {
        const code = localStorage.getItem("selectedRegionCode") || "IN";
        fetchHelplines(code);
        const handler = (e: Event) => fetchHelplines((e as CustomEvent).detail);
        window.addEventListener("regionChanged", handler);
        return () => window.removeEventListener("regionChanged", handler);
    }, []);

    return (
        <div className="fade-in">
            <div style={{ marginBottom: "2rem" }}>
                <h1 className="section-title" style={{ marginBottom: 6 }}>📞 Official Helplines</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Emergency contacts for cybercrime victims</p>
            </div>

            {/* Emergency Banner */}
            <div style={{
                background: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(124,58,237,0.1))",
                border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "1rem 1.5rem",
                marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 12,
            }}>
                <span style={{ fontSize: "1.5rem" }}>🚨</span>
                <div>
                    <div style={{ fontWeight: 700, color: "#ef4444", fontSize: "0.9rem" }}>EMERGENCY — Immediate Reporting</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        If you are an active victim of cybercrime, contact your region's primary helpline immediately. Preserve all evidence (screenshots, transaction IDs, emails).
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}
                </div>
            ) : helplines.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>No helplines found for this region.</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                    {helplines.map(h => (
                        <div key={h.id} className="card fade-in glow-border">
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1rem" }}>{h.name}</div>
                                <span className="badge badge-green">{h.region?.name}</span>
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16, lineHeight: 1.6 }}>
                                {h.purpose}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: "1.2rem" }}>📱</span>
                                    <div>
                                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact</div>
                                        <div style={{ color: "#00d4ff", fontWeight: 700, fontSize: "1.1rem" }}>{h.contact}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: "1.2rem" }}>🕐</span>
                                    <div>
                                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Availability</div>
                                        <div style={{ color: "var(--text-primary)", fontSize: "0.88rem" }}>{h.availability}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Disclaimer */}
            <div style={{ marginTop: "2rem", padding: "1rem 1.5rem", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, fontSize: "0.8rem", color: "#78716c", lineHeight: 1.6 }}>
                ⚠️ <strong style={{ color: "#f59e0b" }}>Disclaimer:</strong> Contact details are aggregated from official government sources. Always verify numbers on official government websites before calling. This platform is for informational purposes only and does not store any personal information.
            </div>
        </div>
    );
}
