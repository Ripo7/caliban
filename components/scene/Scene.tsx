"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { Asteroid } from "@/lib/types";
import { readableRadius, trueDistance, trueRadius } from "@/lib/scale";
import Earth from "./Earth";
import Starfield from "./Starfield";
import AsteroidMesh from "./Asteroid";
import CameraRig from "./CameraRig";

export interface SceneProps {
  asteroids: Asteroid[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  scaleT: number;
  reducedMotion: boolean;
}

export default function Scene({
  asteroids,
  selectedId,
  onSelect,
  onHover,
  scaleT,
  reducedMotion,
}: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const positionsRef = useRef<Map<string, THREE.Vector3>>(new Map());

  const registerPosition = (id: string, position: THREE.Vector3) => {
    positionsRef.current.set(id, position);
  };

  const selected = asteroids.find((a) => a.id === selectedId) ?? null;
  const selectedPosition = selectedId ? positionsRef.current.get(selectedId) ?? null : null;
  const selectedRadius = selected
    ? THREE.MathUtils.lerp(
        readableRadius((selected.diameterMinMeters + selected.diameterMaxMeters) / 2),
        trueRadius((selected.diameterMinMeters + selected.diameterMaxMeters) / 2),
        scaleT,
      )
    : 0.15;

  const trueOverviewDistance = useMemo(() => {
    if (asteroids.length === 0) return 400;
    const maxLd = Math.max(...asteroids.map((a) => a.missDistanceLunar), 5);
    return Math.max(trueDistance(maxLd) * 1.35, 250);
  }, [asteroids]);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ position: [18, 14, 34], fov: 42, near: 0.1, far: 20000 }}
      aria-hidden="true"
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#0d1114"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 6, 10]} intensity={1.4} color="#e6e1d6" />
      <Suspense fallback={null}>
        <Starfield />
        <Earth reducedMotion={reducedMotion} />
        {asteroids.map((asteroid) => (
          <AsteroidMesh
            key={asteroid.id}
            asteroid={asteroid}
            scaleT={scaleT}
            isSelected={asteroid.id === selectedId}
            onSelect={(id) => onSelect(id === selectedId ? null : id)}
            onHover={onHover}
            registerPosition={registerPosition}
            reducedMotion={reducedMotion}
          />
        ))}
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        enableDamping={!reducedMotion}
        dampingFactor={0.08}
        minDistance={1.35}
        maxDistance={6000}
      />
      <CameraRig
        controlsRef={controlsRef}
        selectedPosition={selectedPosition}
        selectedRadius={selectedRadius}
        trueOverviewDistance={trueOverviewDistance}
        scaleT={scaleT}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
