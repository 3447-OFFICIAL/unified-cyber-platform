"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, Float, Points, Point } from "@react-three/drei";
import * as THREE from "three";

// Helper to convert Lat/Lon to 3D position on a radius R sphere
// Aligned with Three.js SphereGeometry UV mapping
const latLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    return new THREE.Vector3(x, y, z);
};

function DottedGlobe() {
    const groupRef = useRef<THREE.Group>(null);
    const texture = useLoader(THREE.TextureLoader, "/world_map.png");

    const markers = useMemo(() => [
        { label: "India", pos: latLonToVector3(20.5937, 78.9629, 1.01) },
        { label: "USA", pos: latLonToVector3(37.0902, -95.7129, 1.01) },
        { label: "Germany", pos: latLonToVector3(51.1657, 10.4515, 1.01) },
        { label: "UK", pos: latLonToVector3(55.3781, -3.4360, 1.01) },
    ], []);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Dark core */}
            <Sphere args={[0.98, 64, 64]}>
                <meshBasicMaterial color="#050a18" transparent opacity={0.6} />
            </Sphere>

            {/* Dotted Continents */}
            <points>
                <sphereGeometry args={[1, 180, 90]} />
                <pointsMaterial
                    color="#00f2ff"
                    size={0.012}
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                    alphaMap={texture}
                    alphaTest={0.5}
                />
            </points>

            {/* Pulsing Markers (Nested inside rotation) */}
            {markers.map((m, i) => (
                <PulsingMarker key={i} position={m.pos} label={m.label} />
            ))}

            {/* Faint Grid lines */}
            <Sphere args={[1.002, 32, 32]}>
                <meshPhongMaterial
                    color="#004466"
                    emissive="#002233"
                    emissiveIntensity={0.5}
                    wireframe={true}
                    transparent
                    opacity={0.05}
                />
            </Sphere>
        </group>
    );
}

function AtmosphericGlow() {
    return (
        <group>
            {/* Outer Glow */}
            <Sphere args={[1.35, 32, 32]}>
                <meshBasicMaterial
                    color="#00f2ff"
                    transparent
                    opacity={0.02}
                    side={THREE.BackSide}
                />
            </Sphere>
            {/* Inner Atmospheric Halo */}
            <Sphere args={[1.08, 32, 32]}>
                <meshBasicMaterial
                    color="#00f2ff"
                    transparent
                    opacity={0.06}
                    side={THREE.FrontSide}
                />
            </Sphere>
        </group>
    );
}

interface MarkerProps {
    position: THREE.Vector3;
    label: string;
}

function PulsingMarker({ position, label }: MarkerProps) {
    const pulseRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const scale = 1 + Math.sin(time * 3) * 0.4;
        if (pulseRef.current) {
            pulseRef.current.scale.set(scale, scale, scale);
            // @ts-ignore
            pulseRef.current.material.opacity = 0.4 - (Math.sin(time * 3) * 0.2);
        }
    });

    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.015, 16, 16]} />
                <meshBasicMaterial color="#ff6b00" />
            </mesh>
            <mesh ref={pulseRef}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color="#ff6b00" transparent opacity={0.3} />
            </mesh>
        </group>
    );
}

export default function TacticalGlobe() {
    return (
        <div style={{
            width: "100%",
            height: "100%",
            minHeight: 420,
            cursor: "grab",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
        }}>
            <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }} style={{ width: "100%", height: "100%" }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f2ff" />
                <spotLight position={[-5, 10, 5]} angle={0.25} penumbra={1} intensity={2} color="#7c3aed" />

                <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={0.5} />

                <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
                    <DottedGlobe />
                    <AtmosphericGlow />
                </Float>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate={false}
                    rotateSpeed={0.5}
                />
            </Canvas>

            {/* HUD Overlay Style */}
            <div style={{
                position: "absolute",
                top: "15%",
                left: "10%",
                borderLeft: "2px solid #00f2ff",
                paddingLeft: "15px",
                pointerEvents: "none",
                zIndex: 10
            }}>
                <div style={{ color: "#00f2ff", fontSize: "0.7rem", fontWeight: "900", letterSpacing: "3px" }}>TACTICAL INTEL</div>
                <div style={{ color: "#e2e8f0", fontSize: "0.55rem", opacity: 0.7, fontWeight: "bold" }}>STATUS: ACTIVE // GLOBAL LINK</div>
            </div>

            <div style={{
                position: "absolute",
                bottom: "15%",
                right: "10%",
                borderRight: "2px solid var(--accent)",
                paddingRight: "15px",
                textAlign: "right",
                pointerEvents: "none",
                zIndex: 10
            }}>
                <div style={{ color: "var(--accent)", fontSize: "0.7rem", fontWeight: "900", letterSpacing: "1px" }}>VECTOR TARGETING</div>
                <div style={{ color: "#e2e8f0", fontSize: "0.55rem", opacity: 0.7, fontWeight: "bold" }}>COORDS: LAT/LON CALIBRATED</div>
            </div>
        </div>
    );
}
