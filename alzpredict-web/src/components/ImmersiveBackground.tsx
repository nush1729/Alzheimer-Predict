"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScroll, useTransform } from "framer-motion";

function FloatingDust({ scrollProgress }: { scrollProgress: any }) {
  const meshRef = useRef<THREE.Points>(null);
  const count = 350;

  // Static random points
  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sz[i] = Math.random() * 0.08 + 0.02;
    }
    return [pos, sz];
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scrollVal = scrollProgress.get(); // Get instantaneous scroll depth (0 to 1)

    if (meshRef.current) {
      // Slow orbital rotation + scroll-induced rotation acceleration
      meshRef.current.rotation.y = time * 0.02 + scrollVal * 1.5;
      meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1 + scrollVal * 0.5;
      
      // Pull camera depth slightly based on scroll
      state.camera.position.z = 6 + Math.sin(scrollVal * Math.PI) * 1.5;
      state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#00F5FF"
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FlowingGrid() {
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const positions = useMemo(() => {
    const pts = [];
    const size = 20;
    const divisions = 20;
    
    // Create faint planar wireframe grid that floats underneath
    for (let i = -size / 2; i <= size / 2; i += size / divisions) {
      pts.push(-size / 2, -2, i, size / 2, -2, i); // horiz
      pts.push(i, -2, -size / 2, i, -2, size / 2); // vert
    }
    return new Float32Array(pts);
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.position.y = -3 + Math.sin(state.clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#BF5AF2" opacity={0.05} transparent />
    </lineSegments>
  );
}

export default function ImmersiveBackground() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden bg-[#030308]">
      {/* Canvas Element */}
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <FloatingDust scrollProgress={scrollYProgress} />
        <FlowingGrid />
      </Canvas>
      
      {/* Glowing Gradient Overlays hooked into scrolling blur depth */}
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-cyan/5 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-purple/5 filter blur-[120px] pointer-events-none" />
    </div>
  );
}
