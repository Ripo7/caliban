import { NextResponse } from "next/server";
import { normalizeFeed, type RawNeoFeedResponse } from "@/lib/normalize";
import fallbackRaw from "@/lib/fallback.json";
import type { NeosResponse } from "@/lib/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const date = todayIso();
  const apiKey = process.env.NASA_API_KEY;

  if (apiKey) {
    try {
      const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });

      if (res.ok) {
        const raw = (await res.json()) as RawNeoFeedResponse;
        const asteroids = normalizeFeed(raw, date);
        const body: NeosResponse = {
          date,
          elementCount: asteroids.length,
          hazardousCount: asteroids.filter((a) => a.isPotentiallyHazardous).length,
          asteroids,
          isArchived: false,
        };
        return NextResponse.json(body);
      }
    } catch {
      // fall through to archived fixture
    }
  }

  const fallbackDate = Object.keys(
    (fallbackRaw as RawNeoFeedResponse).near_earth_objects,
  )[0];
  const asteroids = normalizeFeed(fallbackRaw as RawNeoFeedResponse, fallbackDate);
  const body: NeosResponse = {
    date: fallbackDate,
    elementCount: asteroids.length,
    hazardousCount: asteroids.filter((a) => a.isPotentiallyHazardous).length,
    asteroids,
    isArchived: true,
  };
  return NextResponse.json(body);
}
