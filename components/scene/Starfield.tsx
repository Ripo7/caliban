"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/hash";

const STAR_COUNT = 2200;

export default function Starfield() {
  const geometry = useMemo(() => {
    const rand = mulberry32(1337);
    const positions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const radius = 400 + rand() * 1600;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(rand() * 2 - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#e6e1d6"
        size={1.1}
        sizeAttenuation={false}
        transparent
        opacity={0.55}
      />
    </points>
  );
}
