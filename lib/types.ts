export interface Asteroid {
  id: string;
  name: string;
  nasaJplUrl: string;
  diameterMinMeters: number;
  diameterMaxMeters: number;
  isPotentiallyHazardous: boolean;
  isSentryObject: boolean;
  closeApproachDateFull: string;
  velocityKmPerSecond: number;
  missDistanceLunar: number;
  missDistanceKm: number;
  orbitingBody: string;
}

export interface NeosResponse {
  date: string;
  elementCount: number;
  hazardousCount: number;
  asteroids: Asteroid[];
  isArchived: boolean;
}
