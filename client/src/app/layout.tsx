import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";

export const metadata: Metadata = {
  title: "UCRIP | Unified Cyber Resource Intelligence Platform",
  description: "Region-aware cybercrime assistance platform aggregating official helplines, reporting portals, advisories, and AI-powered guidance for victims.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 64px)", padding: "2rem" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            {children}
          </div>
        </main>
        <Chatbot />
      </body>
    </html>
  );
}
