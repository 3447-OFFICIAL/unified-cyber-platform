"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api, Region } from "../lib/api";
import {
    Shield, LayoutDashboard, AlertCircle, PhoneCall, Link as LinkIcon,
    BrainCircuit, ShieldEllipsis, Sun, Moon, Globe
} from "lucide-react";

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
        { href: "/", label: "Ops Center", icon: LayoutDashboard },
        { href: "/advisories", label: "Advisories", icon: AlertCircle },
        { href: "/helplines", label: "Helplines", icon: PhoneCall },
        { href: "/portals", label: "Portals", icon: LinkIcon },
        { href: "/analyzer", label: "AI Analyzer", icon: BrainCircuit },
        { href: "/guides", label: "Guides", icon: ShieldEllipsis },
    ];

    return (
        <div style={{
            position: "sticky",
            top: 16,
            zIndex: 100,
            padding: "0 2rem",
            display: "flex",
            justifyContent: "center"
        }}>
            <nav className="glass" style={{
                height: 64,
                width: "100%",
                maxWidth: 1200,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                padding: "0 1.5rem",
                gap: "1.5rem",
                border: "1px solid var(--border-bright)"
            }}>
                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <div className="neon-border" style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--bg-primary)",
                    }}>
                        <Shield size={20} fill="currentColor" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: "0.9rem", color: "var(--text-primary)", letterSpacing: "0.05em" }}>UCRIP</div>
                        <div style={{ fontSize: "0.55rem", color: "var(--accent)", fontWeight: 800, letterSpacing: "0.1em" }}>TACTICAL INTEL</div>
                    </div>
                </Link>

                {/* Nav Links */}
                <div style={{ display: "flex", gap: "0.5rem", flex: 1, justifyContent: "center" }}>
                    {navLinks.map((link) => {
                        const active = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        padding: "0.5rem 0.8rem", borderRadius: 12,
                                        fontSize: "0.8rem", fontWeight: 700,
                                        transition: "all 0.2s",
                                        background: active ? "rgba(0, 242, 255, 0.1)" : "transparent",
                                        color: active ? "var(--accent)" : "var(--text-muted)",
                                        border: active ? "1px solid var(--border-bright)" : "1px solid transparent",
                                    }}
                                >
                                    <Icon size={14} />
                                    <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{link.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* Theme & Region Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={toggleTheme}
                        className="glass-interactive"
                        style={{
                            background: "transparent",
                            border: "1px solid var(--border)",
                            borderRadius: 12,
                            width: 36,
                            height: 36,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "var(--text-primary)"
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={theme}
                                initial={{ rotate: -20, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                            </motion.div>
                        </AnimatePresence>
                    </button>

                    <div style={{ height: 20, width: 1, background: "var(--border)" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Globe size={14} color="var(--text-muted)" />
                        <select
                            value={selectedRegion}
                            onChange={(e) => handleRegionChange(e.target.value)}
                            style={{
                                background: "transparent",
                                color: "var(--text-primary)",
                                border: "none",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                outline: "none",
                                fontWeight: 800,
                                textTransform: "uppercase"
                            }}
                        >
                            {regions.map((r) => (
                                <option key={r.code} value={r.code} style={{ background: "var(--bg-primary)" }}>{r.code}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </nav>
        </div>
    );
}
