"use client";
import { useState, useEffect } from "react";
import { api, DashboardStats, Article } from "../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#258cf4", "#7c3aed", "#22c55e", "#f59e0b", "#ef4444"];

const categoryBadge: Record<string, string> = {
  "Advisories": "badge-red",
  "Cyber News": "badge-blue",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="card fade-in" style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
      </div>
      <div className="stat-number">{value}</div>
      {sub && <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function AdvisoryCard({ article }: { article: Article }) {
  return (
    <div style={{
      padding: "1rem 1.25rem",
      borderBottom: "1px solid var(--border)",
      transition: "all 0.3s ease",
      cursor: "pointer",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      onClick={() => window.open(article.sourceUrl, "_blank")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
        <span className={`badge ${categoryBadge[article.category?.name] || "badge-blue"}`}>
          {article.category?.name}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
          {formatDate(article.publishDate)}
        </span>
      </div>
      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: 1.4 }}>
        {article.title}
      </div>
      <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 4, lineHeight: 1.5 }}>
        {article.content.substring(0, 90)}...
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [regionCode, setRegionCode] = useState("IN");

  const fetchStats = (code: string) => {
    setLoading(true);
    api.get(`/dashboard/stats?regionCode=${code}`)
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedRegionCode") || "IN";
    setRegionCode(saved);
    fetchStats(saved);

    const handler = (e: Event) => {
      const code = (e as CustomEvent).detail;
      setRegionCode(code);
      fetchStats(code);
    };
    window.addEventListener("regionChanged", handler);
    return () => window.removeEventListener("regionChanged", handler);
  }, []);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
    </div>
  );

  if (!stats) return null;

  const totalResources = stats.resourceCountPerRegion.reduce((a, r) => a + r._count.articles + r._count.helplines + r._count.cyberPortals, 0);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="section-title" style={{ marginBottom: 6 }}>
          Cyber Intelligence Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Real-time cybercrime resource overview for <span className="text-accent" style={{ fontWeight: 600 }}>
            {stats.resourceCountPerRegion.find(r => r.code === regionCode)?.name || regionCode}
          </span>
        </p>
      </div>

      {/* Top Banner: Emergency Hotline */}
      <div className="card glow-border" style={{
        marginBottom: "2rem",
        borderLeft: "5px solid var(--accent)",
        background: "rgba(37, 140, 244, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem 2rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            fontSize: "2.5rem",
            background: "rgba(37, 140, 244, 0.15)",
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid var(--accent)"
          }}>🚨</div>
          <div>
            <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "1.1rem", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
              EMERGENCY CYBER RESPONSE UNIT
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              {regionCode === "IN" ? "National Cyber Crime Reporting Portal (Official) — Dial " :
                regionCode === "US" ? "CISA / FBI Cyber Incident Response — Dial " :
                  regionCode === "DE" ? "BSI IT-Sicherheitslagezentrum — Dial " :
                    "National CERT Incident Response — Dial "}
              <span style={{
                color: "var(--accent)",
                fontWeight: 900,
                fontSize: "1.5rem",
                marginLeft: 8,
                textShadow: "0 0 15px rgba(37, 140, 244, 0.5)"
              }}>
                {regionCode === "IN" ? "1930" :
                  regionCode === "US" ? "1-800-CALL-FBI" :
                    regionCode === "DE" ? "+49 228 9582-444" :
                      "CERT-EE Helpline"}
              </span>
            </div>
          </div>
        </div>
        <a href="/helplines" className="btn-primary" style={{ textDecoration: "none", padding: "0.8rem 1.8rem" }}>
          GET IMMEDIATE HELP
        </a>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: "2.5rem" }}>
        <StatCard icon="🛡️" label="Latest Advisories" value={stats.latestAdvisories.length} sub="Official government alerts" />
        <StatCard icon="📞" label="Helplines" value={stats.helplineCount} sub="Emergency victim support" />
        <StatCard icon="🏛️" label="Portals" value={stats.portalCount} sub="Cybercrime reporting" />
        <StatCard icon="⚡" label="Total Assets" value={totalResources} sub="Secured resource nodes" />
      </div>

      {/* Main Intel Grid: Two Primary Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Section 1: Official Advisories */}
        <div className="card" style={{ padding: 0, overflow: "hidden", borderTop: "4px solid var(--danger)" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(239, 68, 68, 0.05)" }}>
            <div style={{ fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.05em" }}>📡 CRITICAL ADVISORIES</div>
            <a href="/advisories" style={{ fontSize: "0.8rem", color: "var(--danger)", textDecoration: "none", fontWeight: 700 }}>FULL FEED →</a>
          </div>
          {stats.latestAdvisories.length === 0
            ? <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No technical advisories currently logged.</div>
            : stats.latestAdvisories.map(a => <AdvisoryCard key={a.id} article={a} />)
          }
        </div>

        {/* Section 2: Global Cyber News */}
        <div className="card" style={{ padding: 0, overflow: "hidden", borderTop: "4px solid var(--accent)" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(37, 140, 244, 0.05)" }}>
            <div style={{ fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.05em" }}>📰 RECENT CYBER NEWS</div>
            <a href="/advisories" style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>READ ALL →</a>
          </div>
          {stats.latestNews.length === 0
            ? <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No world news found for this region.</div>
            : stats.latestNews.map(a => <AdvisoryCard key={a.id} article={a} />)
          }
        </div>
      </div>

      {/* Analytics Summary */}
      <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem" }}>
        <div className="card">
          <div style={{ fontWeight: 800, color: "var(--text-primary)", marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>🌐 DATA DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={stats.resourceCountPerRegion.map(r => ({
                  name: r.name,
                  value: r._count.articles + r._count.helplines + r._count.cyberPortals
                }))}
                cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}
                dataKey="value"
              >
                {stats.resourceCountPerRegion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: "linear-gradient(135deg, rgba(37, 140, 244, 0.05), transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div style={{ fontSize: "2rem" }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>Continuous Cyber Intelligence Active</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Monitoring official government feeds and global news 24/7.</div>
            </div>
          </div>
          <div style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "6px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 800, border: "1px solid rgba(34, 197, 94, 0.2)" }}>
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </div>
  );
}
