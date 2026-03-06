"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, DashboardStats, Article } from "../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Shield, Phone, Building2, Zap, AlertTriangle, ChevronRight, Activity, Globe
} from "lucide-react";
import TacticalGlobe from "../components/TacticalGlobe";

const COLORS = ["#00f2ff", "#ff6b00", "#08f7af", "#ff2e63", "#7c3aed"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

function StatCard({ icon: Icon, label, value, sub, delay = 0 }: { icon: any; label: string; value: string | number; sub?: string; delay?: number }) {
  return (
    <motion.div
      variants={itemVariants as any}
      className="glass glass-interactive"
      style={{
        padding: "1.5rem",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.05 }}>
        <Icon size={80} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
        <Icon size={16} />
        <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
      {sub && <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{sub}</div>}
    </motion.div>
  );
}

function AdvisoryRow({ article }: { article: Article }) {
  return (
    <div
      className="glass-interactive"
      style={{
        padding: "1.25rem",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}
      onClick={() => window.open(article.sourceUrl, "_blank")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: "0.65rem",
          fontWeight: 900,
          padding: "2px 8px",
          background: article.category?.name === "Advisories" ? "rgba(255, 46, 99, 0.1)" : "rgba(0, 242, 255, 0.1)",
          color: article.category?.name === "Advisories" ? "var(--danger)" : "var(--accent)",
          borderRadius: "4px",
          textTransform: "uppercase"
        }}>
          {article.category?.name}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{formatDate(article.publishDate)}</span>
      </div>
      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>{article.title}</div>
      <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", height: "auto", maxHeight: "3em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {article.content}
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
    <div style={{ padding: "2rem" }}>
      <div style={{ height: "400px", background: "var(--bg-card)", borderRadius: 16, marginBottom: 24 }} className="skeleton" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
      </div>
    </div>
  );

  if (!stats) return null;

  const totalResources = stats.resourceCountPerRegion.reduce((a, r) => a + r._count.articles + r._count.helplines + r._count.cyberPortals, 0);
  const activeRegion = stats.resourceCountPerRegion.find(r => r.code === regionCode)?.name || regionCode;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="dashboard-container"
      style={{ paddingBottom: "4rem" }}
    >
      {/* Hero Section with 3D Globe */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        gap: "2rem",
        marginBottom: "3rem",
        alignItems: "center",
        minHeight: "500px"
      }}>
        <motion.div variants={itemVariants as any}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Activity className="neon-text" color="var(--accent)" size={24} />
            <span style={{ fontWeight: 800, fontSize: "0.8rem", letterSpacing: "0.2em", color: "var(--accent)" }}>LIVE INTELLIGENCE FEED</span>
          </div>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
            Securing the <span className="neon-text" style={{ color: "var(--accent)" }}>Digital</span> Frontier.
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "2.5rem", maxWidth: "500px", lineHeight: 1.6 }}>
            Unified Cyber Resource Intelligence Platform providing real-time technical advisories and emergency response for <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{activeRegion}</span>.
          </p>

          <div className="glass" style={{ padding: "1.5rem", borderRadius: "16px", borderLeft: "4px solid var(--accent-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>EMERGENCY CONTACT</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "0.05em" }}>
                {stats.emergencyContact}
              </div>
            </div>
            <a href="/helplines" className="glass glass-interactive" style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", textDecoration: "none", color: "var(--text-primary)", fontWeight: 700, fontSize: "0.8rem" }}>
              DIAL NOW
            </a>
          </div>
        </motion.div>

        <motion.div variants={itemVariants as any} style={{ height: "100%", minHeight: "400px", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <TacticalGlobe />
          </div>
          {/* HUD Overlay elements */}
          <div style={{ position: "absolute", top: 20, right: 20, textAlign: "right" }} className="neon-text">
            <div style={{ fontSize: "0.6rem", fontWeight: 700, opacity: 0.6 }}>SYSTEM STATUS</div>
            <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "var(--success)" }}>ENCRYPTED / ONLINE</div>
          </div>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "4rem" }}>
        <StatCard icon={Shield} label="Technical Advisories" value={stats.latestAdvisories.length} sub="Filtered regional alerts" />
        <StatCard icon={Phone} label="Response Nodes" value={stats.helplineCount} sub="Verified emergency lines" />
        <StatCard icon={Building2} label="Central Portals" value={stats.portalCount} sub="Infrastructure units" />
        <StatCard icon={Zap} label="Active Assets" value={totalResources} sub="Platform nodes detected" />
      </div>

      {/* Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Advisories Section */}
        <motion.div variants={itemVariants as any} className="glass" style={{ borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", background: "rgba(255, 46, 99, 0.05)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", fontWeight: 900 }}>
              <AlertTriangle size={18} color="var(--danger)" /> CRITICAL FEED
            </h3>
            <a href="/advisories" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--danger)", textDecoration: "none" }}>VIEW ALL →</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {stats.latestAdvisories.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>No tactical advisories in sector.</div>
            ) : (
              stats.latestAdvisories.map(a => <AdvisoryRow key={a.id} article={a} />)
            )}
          </div>
        </motion.div>

        {/* Global News Section */}
        <motion.div variants={itemVariants as any} className="glass" style={{ borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", background: "rgba(0, 242, 255, 0.05)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", fontWeight: 900 }}>
              <Activity size={18} color="var(--accent)" /> SECTOR NEWS
            </h3>
            <a href="/advisories" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>GLOBAL BROADCAST →</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {stats.latestNews.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Scanning for global updates...</div>
            ) : (
              stats.latestNews.map(a => <AdvisoryRow key={a.id} article={a} />)
            )}
          </div>
        </motion.div>
      </div>

      {/* Distribution Chart */}
      <motion.div variants={itemVariants as any} style={{ marginTop: "3rem" }}>
        <div className="glass" style={{ padding: "2rem", borderRadius: "20px" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 900, marginBottom: "2rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}>REGIONAL DATA DISTRIBUTION</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.resourceCountPerRegion.map(r => ({
                    name: r.name,
                    value: r._count.articles + r._count.helplines + r._count.cyberPortals
                  }))}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={10}
                  dataKey="value"
                >
                  {stats.resourceCountPerRegion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.8rem" }}
                  itemStyle={{ color: "var(--text-primary)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
