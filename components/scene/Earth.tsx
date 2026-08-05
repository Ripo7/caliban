"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ATMOSPHERE_SCENE_RADIUS, EARTH_SCENE_RADIUS } from "@/lib/scale";

const BONE = new THREE.Color("#e6e1d6");
const INSTRUMENT = new THREE.Color("#6e9a93");
const FIELD = new THREE.Color("#151b21");

function buildGraticuleTexture(): THREE.Texture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(110, 154, 147, 0.55)";
  ctx.lineWidth = 1;

  for (let lon = 0; lon <= 360; lon += 20) {
    const x = (lon / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let lat = 0; lat <= 180; lat += 20) {
    const y = (lat / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(230, 225, 214, 0.7)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  uniform vec3 uColor;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
    gl_FragColor = vec4(uColor, intensity * 0.85);
  }
`;

export default function Earth({ reducedMotion }: { reducedMotion: boolean }) {
  const globeRef = useRef<THREE.Mesh>(null);
  const graticuleTexture = useMemo(() => buildGraticuleTexture(), []);

  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: INSTRUMENT.clone().lerp(BONE, 0.3) },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group>
      <mesh ref={globeRef}>
        <sphereGeometry args={[EARTH_SCENE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color={FIELD}
          roughness={0.95}
          metalness={0.05}
          emissiveMap={graticuleTexture}
          emissive={INSTRUMENT}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh scale={ATMOSPHERE_SCENE_RADIUS}>
        <sphereGeometry args={[EARTH_SCENE_RADIUS, 48, 48]} />
        <shaderMaterial
          args={[
            {
              uniforms: atmosphereUniforms,
              vertexShader: atmosphereVertexShader,
              fragmentShader: atmosphereFragmentShader,
              transparent: true,
              side: THREE.BackSide,
              depthWrite: false,
            },
          ]}
        />
      </mesh>
    </group>
  );
}
