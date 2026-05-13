"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float } from "@react-three/drei";

function Nucleus() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      const s = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
      mesh.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshBasicMaterial color="#10B981" wireframe opacity={0.7} transparent />
    </mesh>
  );
}

function ElectronRing({ radius, speed, color, tiltX, tiltY }: { radius: number, speed: number, color: string, tiltX: number, tiltY: number }) {
  const mesh = useRef<THREE.LineLoop>(null);
  
  const positions = useMemo(() => {
    const pts = [];
    const count = 64;
    for (let i = 0; i <= count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(positions), [positions]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.getElapsedTime() * speed;
    }
  });

  return (
    <group rotation={[tiltX, tiltY, 0]}>
      <lineLoop ref={mesh} geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.2} />
      </lineLoop>
      {/* Active electron node */}
      <ElectronNode radius={radius} speed={speed} color={color} />
    </group>
  );
}

function ElectronNode({ radius, speed, color }: { radius: number, speed: number, color: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      const t = state.clock.getElapsedTime() * speed;
      mesh.current.position.x = Math.cos(t) * radius;
      mesh.current.position.y = Math.sin(t) * radius;
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export default function ThreeAtom() {
  return (
    <div className="w-full h-full min-h-[250px] opacity-80 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.5} />
        <Float speed={3} rotationIntensity={0.4} floatIntensity={0.3}>
          <Nucleus />
          <ElectronRing radius={2} speed={1.2} color="#10B981" tiltX={Math.PI / 4} tiltY={Math.PI / 6} />
          <ElectronRing radius={2.4} speed={-0.8} color="#6366F1" tiltX={-Math.PI / 3} tiltY={Math.PI / 4} />
          <ElectronRing radius={2.8} speed={0.6} color="#8B5CF6" tiltX={Math.PI / 6} tiltY={-Math.PI / 3} />
        </Float>
      </Canvas>
    </div>
  );
}
