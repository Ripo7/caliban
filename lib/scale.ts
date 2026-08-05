import { prngFromId } from "./hash";

export const EARTH_SCENE_RADIUS = 1;
export const ATMOSPHERE_SCENE_RADIUS = 1.08;

export const EARTH_RADIUS_KM = 6371;
export const LUNAR_DISTANCE_KM = 384400;

/** Scene units per lunar distance, if Earth's true radius were 1 unit. */
export const UNITS_PER_LD_TRUE = LUNAR_DISTANCE_KM / EARTH_RADIUS_KM;

export const READABLE_MIN_LD = 0.5;
export const READABLE_MAX_LD = 50;
export const READABLE_MIN_DIST = 2.4;
export const READABLE_MAX_DIST = 32;

export const READABLE_OVERVIEW_DISTANCE = 44;
export const MIN_SELECTED_VIEW_DISTANCE = 0.9;

export const READABLE_MIN_DIAM_M = 1;
export const READABLE_MAX_DIAM_M = 2000;
export const READABLE_MIN_RADIUS = 0.13;
export const READABLE_MAX_RADIUS = 0.62;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function logT(value: number, min: number, max: number): number {
  const v = clamp(value, min, max);
  return (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min));
}

/** READABLE SCALE: log-mapped distance so 0.5-50 LD fits on screen. Honestly compressed. */
export function readableDistance(missDistanceLunar: number): number {
  const t = logT(missDistanceLunar, READABLE_MIN_LD, READABLE_MAX_LD);
  return lerp(READABLE_MIN_DIST, READABLE_MAX_DIST, t);
}

/** READABLE SCALE: log-mapped size on a separate compressed scale so the smallest rock is still clickable. */
export function readableRadius(diameterMeters: number): number {
  const t = logT(diameterMeters, READABLE_MIN_DIAM_M, READABLE_MAX_DIAM_M);
  return lerp(READABLE_MIN_RADIUS, READABLE_MAX_RADIUS, t);
}

/** TRUE SCALE: actual proportional distance. Earth radius = 1 unit = 6371 km. */
export function trueDistance(missDistanceLunar: number): number {
  return missDistanceLunar * UNITS_PER_LD_TRUE;
}

/** TRUE SCALE: actual proportional radius. At this scale most rocks are sub-pixel. */
export function trueRadius(diameterMeters: number): number {
  const diameterKm = diameterMeters / 1000;
  return diameterKm / 2 / EARTH_RADIUS_KM;
}

export interface OrbitPlacement {
  theta: number;
  phi: number;
}

/** Deterministic, per-id placement around the globe so a rock stays put between renders. */
export function orbitPlacement(id: string): OrbitPlacement {
  const rand = prngFromId(id);
  const theta = rand() * Math.PI * 2;
  const phi = Math.acos(rand() * 1.6 - 0.8);
  return { theta, phi };
}

export function placementToVector(
  placement: OrbitPlacement,
  distance: number,
): [number, number, number] {
  const { theta, phi } = placement;
  return [
    distance * Math.sin(phi) * Math.cos(theta),
    distance * Math.cos(phi),
    distance * Math.sin(phi) * Math.sin(theta),
  ];
}
