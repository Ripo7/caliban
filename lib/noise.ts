import { prngFromId } from "./hash";

interface NoiseWave {
  axis: [number, number, number];
  frequency: number;
  phase: number;
  amplitude: number;
}

export interface AsteroidNoiseProfile {
  waves: NoiseWave[];
}

/**
 * Builds a small set of sine waves over directions on the unit sphere,
 * seeded from the asteroid's id. Summing them gives a smooth but
 * irregular "lumpiness" field that is identical every time the same
 * id is displaced, without pulling in a noise library.
 */
export function buildNoiseProfile(id: string): AsteroidNoiseProfile {
  const rand = prngFromId(id);
  const waveCount = 4;
  const waves: NoiseWave[] = [];

  for (let i = 0; i < waveCount; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(rand() * 2 - 1);
    const axis: [number, number, number] = [
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi),
    ];
    waves.push({
      axis,
      frequency: 1.5 + rand() * 3.5,
      phase: rand() * Math.PI * 2,
      amplitude: 1 / (i + 1.6),
    });
  }

  return { waves };
}

/** Evaluates the noise field at a point on the unit sphere. Returns roughly [-1, 1]. */
export function evaluateNoise(
  profile: AsteroidNoiseProfile,
  x: number,
  y: number,
  z: number,
): number {
  let sum = 0;
  let totalAmplitude = 0;
  for (const wave of profile.waves) {
    const dot = x * wave.axis[0] + y * wave.axis[1] + z * wave.axis[2];
    sum += Math.sin(dot * wave.frequency * Math.PI + wave.phase) * wave.amplitude;
    totalAmplitude += wave.amplitude;
  }
  return sum / totalAmplitude;
}
