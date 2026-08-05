"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Asteroid as AsteroidData } from "@/lib/types";
import { buildNoiseProfile, evaluateNoise } from "@/lib/noise";
import { prngFromId } from "@/lib/hash";
import {
  orbitPlacement,
  placementToVector,
  readableDistance,
  readableRadius,
  trueDistance,
  trueRadius,
} from "@/lib/scale";

const HAZARD = new THREE.Color("#c8873b");

function buildDisplacedIcosahedron(id: string): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(1, 3);
  const position = geometry.attributes.position;
  const profile = buildNoiseProfile(id);
  const displacementScale = 0.28;

  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    v.normalize();
    const n = evaluateNoise(profile, v.x, v.y, v.z);
    const r = 1 + n * displacementScale;
    v.multiplyScalar(r);
    position.setXYZ(i, v.x, v.y, v.z);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function rockColor(id: string): THREE.Color {
  const rand = prngFromId(id + "-color");
  const shade = 0.32 + rand() * 0.14;
  const warmth = rand() * 0.03;
  return new THREE.Color(shade + warmth, shade, shade - warmth * 0.5);
}

export interface AsteroidMeshProps {
  asteroid: AsteroidData;
  scaleT: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  registerPosition: (id: string, position: THREE.Vector3) => void;
  reducedMotion: boolean;
}

export default function AsteroidMesh({
  asteroid,
  scaleT,
  isSelected,
  onSelect,
  onHover,
  registerPosition,
  reducedMotion,
}: AsteroidMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => buildDisplacedIcosahedron(asteroid.id), [asteroid.id]);
  const color = useMemo(() => rockColor(asteroid.id), [asteroid.id]);
  const placement = useMemo(() => orbitPlacement(asteroid.id), [asteroid.id]);
  const spinAxis = useMemo(() => {
    const rand = prngFromId(asteroid.id + "-spin");
    return new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
  }, [asteroid.id]);
  const spinSpeed = useMemo(() => {
    const rand = prngFromId(asteroid.id + "-speed");
    return 0.15 + rand() * 0.3;
  }, [asteroid.id]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const avgDiameter = (asteroid.diameterMinMeters + asteroid.diameterMaxMeters) / 2;

  const distance = THREE.MathUtils.lerp(
    readableDistance(asteroid.missDistanceLunar),
    trueDistance(asteroid.missDistanceLunar),
    scaleT,
  );
  const radius = THREE.MathUtils.lerp(
    readableRadius(avgDiameter),
    trueRadius(avgDiameter),
    scaleT,
  );

  const position = useMemo(
    () => placementToVector(placement, distance),
    [placement, distance],
  );

  useEffect(() => {
    registerPosition(asteroid.id, new THREE.Vector3(...position));
  }, [asteroid.id, position, registerPosition]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (groupRef.current) {
      groupRef.current.rotateOnAxis(spinAxis, delta * spinSpeed);
    }
  });

  const displayRadius = Math.max(radius, 0.0002);
  const hitRadius = Math.max(displayRadius * 2.2, 0.4);

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={geometry} scale={displayRadius}>
        <meshStandardMaterial color={color} roughness={1} metalness={0} />
      </mesh>

      {asteroid.isPotentiallyHazardous && (
        <mesh geometry={geometry} scale={displayRadius * 1.05}>
          <meshBasicMaterial
            color={HAZARD}
            side={THREE.BackSide}
            transparent
            opacity={0.55}
          />
        </mesh>
      )}

      {(hovered || isSelected) && (
        <mesh scale={hitRadius}>
          <ringGeometry args={[0.92, 1, 32]} />
          <meshBasicMaterial
            color={isSelected ? "#e6e1d6" : "#6e9a93"}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(asteroid.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(asteroid.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[hitRadius, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
