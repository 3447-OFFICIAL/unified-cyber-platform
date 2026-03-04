"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";

export default function ThreatMap() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointerInteracting = useRef<number | null>(null);
    const pointerInteractionMovement = useRef(0);
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        // Check initial theme and set up listener
        const applyTheme = () => {
            setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
        };
        applyTheme();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    applyTheme();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        let phi = 0;

        // Theme colors
        const baseColor: [number, number, number] = theme === "dark" ? [0.1, 0.2, 0.35] : [0.8, 0.85, 0.9];
        const markerColor: [number, number, number] = [0.93, 0.26, 0.26]; // Red for threats
        const glowColor: [number, number, number] = theme === "dark" ? [0.1, 0.2, 0.4] : [0.9, 0.9, 0.95];

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600,
            height: 600,
            phi: 0,
            theta: 0,
            dark: theme === "dark" ? 1 : 0,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor,
            markerColor,
            glowColor,
            markers: [
                { location: [37.0902, -95.7129], size: 0.1 }, // US
                { location: [20.5937, 78.9629], size: 0.1 },  // IN
                { location: [51.1657, 10.4515], size: 0.08 }, // DE
                { location: [58.5953, 25.0136], size: 0.07 }, // EE
            ],
            onRender: (state) => {
                // Called on every animation frame.
                if (!pointerInteracting.current) {
                    phi += 0.005;
                }
                state.phi = phi + pointerInteractionMovement.current;
            },
        });

        return () => {
            globe.destroy();
        };
    }, [theme]);

    return (
        <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", maxWidth: "300px", maxHeight: "300px", cursor: "grab" }}
                onPointerDown={(e) => {
                    pointerInteracting.current =
                        e.clientX - pointerInteractionMovement.current;
                    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null;
                    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null;
                    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
                }}
                onMouseMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const delta = e.clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta * 0.01;
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const delta = e.touches[0].clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta * 0.01;
                    }
                }}
            />
        </div>
    );
}
