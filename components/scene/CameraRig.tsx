"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  MIN_SELECTED_VIEW_DISTANCE,
  READABLE_OVERVIEW_DISTANCE,
} from "@/lib/scale";

const ORIGIN = new THREE.Vector3(0, 0, 0);

export interface CameraRigProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  selectedPosition: THREE.Vector3 | null;
  selectedRadius: number;
  trueOverviewDistance: number;
  scaleT: number;
  reducedMotion: boolean;
}

export default function CameraRig({
  controlsRef,
  selectedPosition,
  selectedRadius,
  trueOverviewDistance,
  scaleT,
  reducedMotion,
}: CameraRigProps) {
  const { camera } = useThree();
  const currentDistance = useRef(READABLE_OVERVIEW_DISTANCE);
  const initialized = useRef(false);

  useEffect(() => {
    currentDistance.current = camera.position.length() || READABLE_OVERVIEW_DISTANCE;
  }, [camera]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const goalTarget = selectedPosition ?? ORIGIN;
    const overviewDistance = THREE.MathUtils.lerp(
      READABLE_OVERVIEW_DISTANCE,
      trueOverviewDistance,
      scaleT,
    );
    const goalDistance = selectedPosition
      ? Math.max(selectedRadius * 9, MIN_SELECTED_VIEW_DISTANCE)
      : overviewDistance;

    const alpha = reducedMotion || !initialized.current ? 1 : 1 - Math.pow(0.001, delta);
    initialized.current = true;

    controls.target.lerp(goalTarget, alpha);

    let direction = camera.position.clone().sub(controls.target);
    if (direction.lengthSq() < 1e-6) {
      direction = new THREE.Vector3(0.4, 0.35, 1);
    }
    direction.normalize();

    currentDistance.current = THREE.MathUtils.lerp(
      currentDistance.current,
      goalDistance,
      alpha,
    );

    const desiredPosition = controls.target
      .clone()
      .add(direction.multiplyScalar(currentDistance.current));

    camera.position.lerp(desiredPosition, alpha);
    controls.update();
  });

  return null;
}
