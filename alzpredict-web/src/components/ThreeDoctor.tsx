"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float, Html } from "@react-three/drei";

type Severity = "critical" | "high" | "moderate" | "low" | "normal";

interface ThreeDoctorProps {
  severity?: Severity;
  riskTier?: string;
}

function HolographicGrid({ color }: { color: string }) {
  const mesh = useRef<THREE.LineSegments>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2, 2), []);

  return (
    <lineSegments ref={mesh}>
      <edgesGeometry args={[geometry]} />
      <lineBasicMaterial color={color} transparent opacity={0.15} linewidth={1} />
    </lineSegments>
  );
}

function ScanningBeam({ color }: { color: string }) {
  const beam = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (beam.current) {
      beam.current.position.y = Math.sin(state.clock.getElapsedTime() * 3) * 2.2;
    }
  });

  return (
    <mesh ref={beam} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0, 2.5, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function BrainParticles({ color, particleCount = 800 }: { color: string; particleCount?: number }) {
  const mesh = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Create two spherical lobes representing the left and right brain hemispheres
      const side = Math.random() > 0.5 ? 1 : -1;
      const r = 1.5;
      const theta = THREE.MathUtils.randFloatSpread(Math.PI * 1.8);
      const phi = THREE.MathUtils.randFloatSpread(Math.PI * 1.8);
      
      const x = (r * Math.sin(theta) * Math.cos(phi)) * 0.8 + (side * 0.4);
      const y = (r * Math.sin(theta) * Math.sin(phi)) * 1.1;
      const z = (r * Math.cos(theta)) * 0.8;

      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, [particleCount]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      const s = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.02;
      mesh.current.scale.setScalar(s);
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function DiagnosticLabels({ severity, riskTier, color }: { severity: Severity; riskTier: string; color: string }) {
  return (
    <Html position={[0, 0, 0]} center>
      <div className="pointer-events-none flex flex-col items-center gap-4 font-display">
        {/* Target scanning bracket UI decor */}
        <div className="absolute w-48 h-48 border border-dashed animate-spin-slow opacity-25 rounded-full pointer-events-none" style={{borderColor: color, animationDuration: '15s'}} />
        <div className="absolute w-64 h-64 border-2 opacity-10 rounded-full pointer-events-none" style={{borderColor: color, borderStyle: 'dashed'}} />

        {/* High-fidelity visual HUD readouts */}
        <div className="mt-36 flex flex-col items-center glass-panel px-6 py-3 rounded-xl border border-white/5 bg-black/60 backdrop-blur-md shadow-2xl relative z-10 w-64 text-center animate-pulse-slow">
          <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{backgroundColor: color}} />
            3D SCAN: ACTIVE
          </div>
          <div className="mt-1 text-sm font-mono font-black uppercase" style={{color}}>
            {riskTier || "CALIBRATING"}
          </div>
          <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full animate-glow-pulse transition-all duration-1000" style={{width: '100%', backgroundColor: color}} />
          </div>
          <div className="mt-2 text-[9px] text-slate-500 font-bold uppercase tracking-wide">
            {severity === "critical" || severity === "high" ? "CRITICAL OVERRIDE REQUIRED" : "PHYSIOLOGICAL STEADY STATE"}
          </div>
        </div>
      </div>
    </Html>
  );
}

export default function ThreeDoctor({ severity = "normal", riskTier = "NORMAL RISK" }: ThreeDoctorProps) {
  // Determine holographic color based on risk assessment output
  const color = useMemo(() => {
    const normalized = severity.toLowerCase();
    if (normalized === "critical" || normalized === "high") {
      return "#EF4444"; // Danger Red
    }
    if (normalized === "moderate" || normalized === "converted") {
      return "#F59E0B"; // Alert Amber
    }
    return "#10B981"; // Safe Emerald
  }, [severity]);

  return (
    <div className="w-full h-full min-h-[380px] relative">
      <Canvas camera={{ position: [0, 0, 7], fov: 40 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} color={color} />
        
        <Float speed={3} rotationIntensity={0.5} floatIntensity={0.4}>
          <HolographicGrid color={color} />
          <BrainParticles color={color} />
          <ScanningBeam color={color} />
        </Float>
        
        <DiagnosticLabels severity={severity} riskTier={riskTier} color={color} />
      </Canvas>
      
      {/* Digital Corner Brackets CSS decoration */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 pointer-events-none" style={{borderColor: color}} />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 pointer-events-none" style={{borderColor: color}} />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 pointer-events-none" style={{borderColor: color}} />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 pointer-events-none" style={{borderColor: color}} />
    </div>
  );
}
