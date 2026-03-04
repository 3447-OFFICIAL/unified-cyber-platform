"use client";
import { useState, useEffect } from "react";
import { api, CyberPortal } from "@/lib/api";

const crimeIcons: Record<string, string> = {
    "phishing": "🎣",
    "financial fraud": "💸",
    "banking": "🏦",
    "upi": "📲",
    "identity theft": "🪪",
    "harassment": "⚠️",
    "social media": "📱",
    "ransomware": "🔒",
    "fraud": "🚨",
    "scam": "🎭",
    "default": "🔗",
};

function getCrimeIcon(crimeType: string): string {
    const lower = crimeType.toLowerCase();
    for (const [key, icon] of Object.entries(crimeIcons)) {
        if (lower.includes(key)) return icon;
    }
    return crimeIcons.default;
}

export default function PortalsPage() {
    const [portals, setPortals] = useState<CyberPortal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchPortals = (code: string) => {
        setLoading(true);
        api.get(`/portals?regionCode=${code}`).then(r => setPortals(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => {
        const code = localStorage.getItem("selectedRegionCode") || "IN";
        fetchPortals(code);
        const handler = (e: Event) => fetchPortals((e as CustomEvent).detail);
        window.addEventListener("regionChanged", handler);
        return () => window.removeEventListener("regionChanged", handler);
    }, []);

    const filtered = portals.filter(p =>
        search === "" ||
        p.crimeType.toLowerCase().includes(search.toLowerCase()) ||
        p.portalName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fade-in">
            <div style={{ marginBottom: "2rem" }}>
                <h1 className="section-title" style={{ marginBottom: 6 }}>🔗 Reporting Portals</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Official portals to report specific types of cybercrime. Find the right portal for your situation.
                </p>
            </div>

            {/* Search Bar */}
            <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: 480 }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>🔍</span>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by crime type or portal name..."
                    style={{
                        width: "100%", padding: "0.7rem 0.9rem 0.7rem 2.5rem",
                        background: "rgba(255,255,255,0.04)", border: "1px solid #1e3a5f",
                        borderRadius: 10, color: "var(--text-primary)", fontSize: "0.9rem",
                        outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#00d4ff"}
                    onBlur={(e) => e.target.style.borderColor = "#1e3a5f"}
                />
            </div>

            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200 }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>No portals found.</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                    {filtered.map(p => (
                        <div key={p.id} className="card fade-in">
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15))",
                                    border: "1px solid rgba(0,212,255,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1.3rem",
                                }}>
                                    {getCrimeIcon(p.crimeType)}
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                                        {p.crimeType}
                                    </div>
                                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                                        {p.portalName}
                                    </div>
                                </div>
                            </div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", lineHeight: 1.6, marginBottom: 16 }}>
                                {p.description}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span className="badge badge-blue">{p.region?.name}</span>
                                <a href={p.officialUrl} target="_blank" rel="noopener noreferrer"
                                    className="btn-primary" style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.4rem 1rem" }}>
                                    Report Now →
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
