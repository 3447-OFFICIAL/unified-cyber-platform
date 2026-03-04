"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api, Region } from "../lib/api";

const REGION_KEY = "selectedRegionCode";

export default function Navbar() {
    const pathname = usePathname();
    const [regions, setRegions] = useState<Region[]>([]);
    const [selectedRegion, setSelectedRegion] = useState("IN");
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        const savedRegion = localStorage.getItem(REGION_KEY);
        if (savedRegion) setSelectedRegion(savedRegion);

        const savedTheme = localStorage.getItem("theme") || "dark";
        setTheme(savedTheme);
        document.documentElement.classList.toggle("light", savedTheme === "light");

        api.get("/regions").then((res) => setRegions(res.data));
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("light", newTheme === "light");
    };

    const handleRegionChange = (code: string) => {
        setSelectedRegion(code);
        localStorage.setItem(REGION_KEY, code);
        window.dispatchEvent(new CustomEvent("regionChanged", { detail: code }));
    };

    const navLinks = [
        { href: "/", label: "Dashboard", icon: "⬡" },
        { href: "/advisories", label: "Advisories", icon: "📋" },
        { href: "/helplines", label: "Helplines", icon: "📞" },
        { href: "/portals", label: "Portals", icon: "🔗" },
        { href: "/analyzer", label: "AI Analyzer", icon: "🧠" },
        { href: "/guides", label: "Guides", icon: "🛡️" },
    ];

    return (
        <nav style={{
            background: "var(--bg-card)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            zIndex: 50,
            padding: "0 2rem",
        }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", height: 64, gap: "2rem" }}>
                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", fontWeight: 900, color: "white",
                    }}>🛡</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.1 }}>UCRIP</div>
                        <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>CYBER INTELLIGENCE</div>
                    </div>
                </Link>

                {/* Nav Links */}
                <div style={{ display: "flex", gap: "0.25rem", flex: 1 }}>
                    {navLinks.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href} style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "0.4rem 0.9rem", borderRadius: 8,
                                textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
                                transition: "all 0.2s",
                                background: active ? "rgba(37, 140, 244,0.1)" : "transparent",
                                color: active ? "var(--accent)" : "var(--text-muted)",
                                border: active ? "1px solid rgba(37, 140, 244,0.2)" : "1px solid transparent",
                            }}>
                                <span>{link.icon}</span> {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Theme & Region Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: "rgba(30, 58, 95, 0.3)",
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                            transition: "all 0.2s"
                        }}
                        title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                    >
                        {theme === "dark" ? "🌙" : "☀️"}
                    </button>

                    <div style={{ height: 24, width: 1, background: "var(--border)" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>REGION</span>
                        <select
                            value={selectedRegion}
                            onChange={(e) => handleRegionChange(e.target.value)}
                            style={{
                                background: "rgba(30, 58, 95, 0.3)", color: "var(--text-primary)",
                                border: "1px solid var(--border)", borderRadius: 10,
                                padding: "0.5rem 1rem", fontSize: "0.85rem",
                                cursor: "pointer", outline: "none",
                                fontWeight: 600
                            }}
                        >
                            {regions.map((r) => (
                                <option key={r.code} value={r.code}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </nav>
    );
}
