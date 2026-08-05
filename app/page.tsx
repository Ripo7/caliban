"use client";

import { useEffect, useState } from "react";
import type { NeosResponse } from "@/lib/types";

export default function Home() {
  const [data, setData] = useState<NeosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/neos")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(String(err)));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <main>
      <h1>Asteroid Roulette</h1>
      <p>
        Date: {data.date} — {data.elementCount} objects — {data.hazardousCount}{" "}
        flagged potentially hazardous.
        {data.isArchived ? " (showing archived data)" : ""}
      </p>
      <table border={1} cellPadding={4}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Diameter min (m)</th>
            <th>Diameter max (m)</th>
            <th>Miss distance (LD)</th>
            <th>Miss distance (km)</th>
            <th>Velocity (km/s)</th>
            <th>Close approach</th>
            <th>Hazardous</th>
            <th>Sentry</th>
          </tr>
        </thead>
        <tbody>
          {data.asteroids.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.diameterMinMeters.toFixed(1)}</td>
              <td>{a.diameterMaxMeters.toFixed(1)}</td>
              <td>{a.missDistanceLunar.toFixed(3)}</td>
              <td>{a.missDistanceKm.toLocaleString()}</td>
              <td>{a.velocityKmPerSecond.toFixed(2)}</td>
              <td>{a.closeApproachDateFull}</td>
              <td>{a.isPotentiallyHazardous ? "yes" : "no"}</td>
              <td>{a.isSentryObject ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
