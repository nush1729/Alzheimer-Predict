"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Float } from "@react-three/drei";

function Points() {
  const mesh = useRef<THREE.Points>(null);
  const count = 1200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 3;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      pos[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.cos(theta);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = time * 0.05;
      mesh.current.rotation.x = time * 0.02;
      
      // Slight undulation animation using custom geometry modification logic simplified:
      mesh.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.03);
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00F5FF"
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Lines() {
  const mesh = useRef<THREE.LineSegments>(null);
  const count = 300; // fewer connections for clean look

  const positions = useMemo(() => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const r = 3;
      const theta1 = THREE.MathUtils.randFloatSpread(360);
      const phi1 = THREE.MathUtils.randFloatSpread(360);
      
      // point A
      points.push(r * Math.sin(theta1) * Math.cos(phi1));
      points.push(r * Math.sin(theta1) * Math.sin(phi1));
      points.push(r * Math.cos(theta1));

      // randomly find a neighboring point within a small offset for connectivity
      const offset = 1.2;
      points.push((r * Math.sin(theta1) * Math.cos(phi1)) + THREE.MathUtils.randFloatSpread(offset));
      points.push((r * Math.sin(theta1) * Math.sin(phi1)) + THREE.MathUtils.randFloatSpread(offset));
      points.push((r * Math.cos(theta1)) + THREE.MathUtils.randFloatSpread(offset));
    }
    return new Float32Array(points);
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = time * 0.05;
      mesh.current.rotation.x = time * 0.02;
    }
  });

  return (
    <lineSegments ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * 2}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#BF5AF2"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

export default function ThreeBrain() {
  return (
    <div className="w-full h-full min-h-[500px] opacity-70">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#00F5FF" intensity={1} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Points />
          <Lines />
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
