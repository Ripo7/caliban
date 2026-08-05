import type { Asteroid } from "./types";

interface RawCloseApproachData {
  close_approach_date_full: string;
  relative_velocity: {
    kilometers_per_second: string;
  };
  miss_distance: {
    lunar: string;
    kilometers: string;
  };
  orbiting_body: string;
}

interface RawNeoObject {
  id: string;
  name: string;
  nasa_jpl_url: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  is_sentry_object: boolean;
  close_approach_data: RawCloseApproachData[];
}

export interface RawNeoFeedResponse {
  element_count: number;
  near_earth_objects: Record<string, RawNeoObject[]>;
}

function stripParens(name: string): string {
  return name.replace(/^\(|\)$/g, "").trim();
}

export function normalizeFeed(raw: RawNeoFeedResponse, date: string): Asteroid[] {
  const objects = raw.near_earth_objects[date] ?? [];

  const asteroids: Asteroid[] = objects.map((obj) => {
    const approach = obj.close_approach_data[0];
    return {
      id: obj.id,
      name: stripParens(obj.name),
      nasaJplUrl: obj.nasa_jpl_url,
      diameterMinMeters: obj.estimated_diameter.meters.estimated_diameter_min,
      diameterMaxMeters: obj.estimated_diameter.meters.estimated_diameter_max,
      isPotentiallyHazardous: obj.is_potentially_hazardous_asteroid,
      isSentryObject: obj.is_sentry_object,
      closeApproachDateFull: approach?.close_approach_date_full ?? "unknown",
      velocityKmPerSecond: Number(approach?.relative_velocity.kilometers_per_second ?? 0),
      missDistanceLunar: Number(approach?.miss_distance.lunar ?? 0),
      missDistanceKm: Number(approach?.miss_distance.kilometers ?? 0),
      orbitingBody: approach?.orbiting_body ?? "Earth",
    };
  });

  return asteroids.sort((a, b) => a.missDistanceLunar - b.missDistanceLunar);
}
