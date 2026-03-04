"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, Float, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function Globe() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <group>
            {/* Glow effect back */}
            <Sphere args={[1.1, 32, 32]}>
                <meshBasicMaterial
                    color="#00f2ff"
                    transparent
                    opacity={0.05}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Main Globe Body */}
            <Sphere ref={meshRef} args={[1, 64, 64]}>
                <meshPhongMaterial
                    color="#0a1122"
                    emissive="#004466"
                    emissiveIntensity={0.2}
                    specular="#00f2ff"
                    shininess={100}
                    wireframe={true}
                />
            </Sphere>

            {/* Atmospheric Glow */}
            <Sphere args={[1.02, 32, 32]}>
                <meshPhongMaterial
                    color="#00f2ff"
                    transparent
                    opacity={0.1}
                    wireframe={false}
                />
            </Sphere>
        </group>
    );
}

function ThreatMarkers() {
    // Region coordinates (approximate normalized for sphere shell)
    // [Lat, Lon] -> converted to 3D roughly
    const markers = useMemo(() => [
        { country: "India", pos: new THREE.Vector3(0.3, 0.4, 0.86) },
        { country: "USA", pos: new THREE.Vector3(-0.8, 0.5, 0.3) },
        { country: "Germany", pos: new THREE.Vector3(0.1, 0.7, 0.6) },
        { country: "UK", pos: new THREE.Vector3(-0.1, 0.8, 0.5) },
    ], []);

    return (
        <group>
            {markers.map((m, i) => (
                <mesh key={i} position={m.pos}>
                    <sphereGeometry args={[0.02, 16, 16]} />
                    <meshBasicMaterial color="#ff6b00" />
                    <pointLight color="#ff6b00" intensity={0.5} distance={0.5} />
                </mesh>
            ))}
        </group>
    );
}

export default function TacticalGlobe() {
    return (
        <div style={{ width: "100%", height: "100%", minHeight: 400, cursor: "grab" }}>
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 3]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Globe />
                    <ThreatMarkers />
                </Float>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
}
