"use client";

import { useState } from "react";

type GuideId = "ransomware" | "phishing" | "upi" | "identity";

interface GuideStep {
    title: string;
    action: string;
}

interface Guide {
    id: GuideId;
    title: string;
    icon: string;
    color: string;
    description: string;
    steps: GuideStep[];
}

const guides: Guide[] = [
    {
        id: "ransomware",
        title: "Ransomware Attack",
        icon: "🛑",
        color: "#ef4444",
        description: "Your files are encrypted and a ransom is demanded.",
        steps: [
            { title: "Isolate Immediately", action: "Disconnect the infected device from all networks (Wi-Fi, Ethernet, Bluetooth) to prevent spread." },
            { title: "Do Not Reboot", action: "Powering off or rebooting can sometimes destroy temporary decryption keys stored in memory or trigger further encryption." },
            { title: "Take a Photo", action: "Use your smartphone to take a picture of the ransom note on the screen. Do not pay the ransom." },
            { title: "Report & Seek Help", action: "Contact official authorities (e.g., your local CERT or police). Use the Helplines section on this site to find your local number." }
        ]
    },
    {
        id: "upi",
        title: "UPI / Bank Fraud",
        icon: "💸",
        color: "#f59e0b",
        description: "Money was transferred from your account without authorization.",
        steps: [
            { title: "Block Your Card/Account", action: "Immediately call your bank's 24/7 hotline to freeze your account and block any associated cards or UPI IDs." },
            { title: "Call the National Cyber Helpline", action: "Report the incident to the official cyber fraud helpline (e.g., 1930 in India) within the \"Golden Hour\" to freeze the transfer." },
            { title: "Gather Evidence", action: "Take screenshots of the SMS alerts, transaction IDs, and the offending application or website." },
            { title: "File an Official Report", action: "Lodge a formal complaint on the official government cybercrime reporting portal." }
        ]
    },
    {
        id: "phishing",
        title: "Phishing / Account Takeover",
        icon: "🎣",
        color: "#3b82f6",
        description: "You clicked a bad link or your social media/email was hacked.",
        steps: [
            { title: "Change Passwords", action: "If you still have access, change your password immediately. If locked out, use the \"Forgot Password\" or account recovery process." },
            { title: "Enable 2FA", action: "Turn on Two-Factor Authentication (2FA) using an authenticator app (not SMS if possible) for all critical accounts." },
            { title: "Review Linked Devices", action: "Go to account settings and \"Log out of all devices\" or revoke access to any unrecognized apps/phones." },
            { title: "Warn Your Contacts", action: "Hackers often use compromised accounts to scam the victim's friends. Post a warning on other channels." }
        ]
    },
    {
        id: "identity",
        title: "Identity Theft",
        icon: "👤",
        color: "#8b5cf6",
        description: "Someone is using your personal information to open accounts.",
        steps: [
            { title: "Place a Fraud Alert", action: "Contact major credit bureaus (e.g., Equifax, Experian, TransUnion) to place a fraud alert or credit freeze on your file." },
            { title: "Review Credit Reports", action: "Obtain copies of your credit reports and look for any accounts or inquiries you do not recognize." },
            { title: "Report the Theft", action: "File a report with the local police and the official government body handling identity theft." },
            { title: "Close Fraudulent Accounts", action: "Contact the fraud department of the businesses where accounts were opened and inform them of the theft." }
        ]
    }
];

export default function GuidesPage() {
    const [activeGuide, setActiveGuide] = useState<GuideId | null>(null);

    const toggleGuide = (id: GuideId) => {
        setActiveGuide(activeGuide === id ? null : id);
    };

    return (
        <div className="container" style={{ maxWidth: "900px" }}>
            <header style={{ marginBottom: "3rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundImage: "linear-gradient(90deg, #ef4444, #f59e0b)" }}>
                    Incidence Response Guides
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
                    Immediate action checklists for critical cybersecurity events.
                </p>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {guides.map((guide) => {
                    const isActive = activeGuide === guide.id;
                    return (
                        <div key={guide.id} className="card" style={{ padding: 0, borderLeft: `6px solid ${guide.color}`, overflow: "hidden", transition: "all 0.3s ease" }}>
                            <div
                                onClick={() => toggleGuide(guide.id)}
                                style={{
                                    padding: "1.5rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    background: isActive ? `rgba(${guide.color === '#ef4444' ? '239, 68, 68' : guide.color === '#f59e0b' ? '245, 158, 11' : guide.color === '#3b82f6' ? '59, 130, 246' : '139, 92, 246'}, 0.05)` : "transparent"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ fontSize: "2rem" }}>{guide.icon}</span>
                                    <div>
                                        <h2 style={{ fontSize: "1.2rem", margin: 0, color: "var(--text-primary)" }}>{guide.title}</h2>
                                        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{guide.description}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: "1.5rem", color: "var(--text-muted)", transform: isActive ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
                                    ▼
                                </div>
                            </div>

                            {isActive && (
                                <div style={{ padding: "0 1.5rem 1.5rem 1.5rem", borderTop: "1px solid var(--border)" }}>
                                    <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
                                        {guide.steps.map((step, index) => (
                                            <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                                <div style={{
                                                    width: "30px", height: "30px", borderRadius: "50%",
                                                    background: guide.color, color: "#fff",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontWeight: "bold", flexShrink: 0
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: "1rem", margin: "0 0 0.3rem 0", color: "var(--text-primary)" }}>{step.title}</h3>
                                                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.5 }}>{step.action}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
