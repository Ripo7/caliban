"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { NeosResponse } from "@/lib/types";

const Scene = dynamic(() => import("@/components/scene/Scene"), { ssr: false });

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function Home() {
  const [data, setData] = useState<NeosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [scaleMode, setScaleMode] = useState<"readable" | "true">("readable");
  const [scaleT, setScaleT] = useState(0);
  const reducedMotion = useReducedMotion();
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/neos")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(String(err)));
  }, []);

  useEffect(() => {
    const target = scaleMode === "true" ? 1 : 0;
    if (reducedMotion) {
      setScaleT(target);
      return;
    }
    const duration = 2200;
    const start = performance.now();
    const startValue = scaleT;
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);

    function step(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = ease(t);
      setScaleT(startValue + (target - startValue) * eased);
      if (t < 1) {
        animFrame.current = requestAnimationFrame(step);
      }
    }
    animFrame.current = requestAnimationFrame(step);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scaleMode, reducedMotion]);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading...</p>;

  const hovered = data.asteroids.find((a) => a.id === hoveredId) ?? null;
  const selected = data.asteroids.find((a) => a.id === selectedId) ?? null;

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header>
        <h1>Asteroid Roulette</h1>
        <p>
          {data.date} — {data.elementCount} objects — {data.hazardousCount} flagged
          potentially hazardous (a technical orbital classification, not a forecast).
          {data.isArchived ? " Showing archived data." : ""}
        </p>
        <button onClick={() => setScaleMode(scaleMode === "readable" ? "true" : "readable")}>
          {scaleMode === "readable" ? "TRUE SCALE" : "READABLE SCALE"}
        </button>
        <span>{scaleMode === "readable" ? "READABLE SCALE" : "TRUE SCALE"}</span>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Scene
            asteroids={data.asteroids}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onHover={setHoveredId}
            scaleT={scaleT}
            reducedMotion={reducedMotion}
          />
          {hovered && !selected && (
            <div style={{ position: "absolute", top: 8, left: 8 }}>
              {hovered.name} — {hovered.missDistanceLunar.toFixed(2)} LD
            </div>
          )}
        </div>

        <div style={{ width: 320, overflowY: "auto" }}>
          <ul>
            {data.asteroids.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setSelectedId(a.id === selectedId ? null : a.id)}
                  aria-pressed={a.id === selectedId}
                  style={{ fontWeight: a.id === selectedId ? "bold" : "normal" }}
                >
                  {a.name} — {((a.diameterMinMeters + a.diameterMaxMeters) / 2).toFixed(0)}
                  m — {a.missDistanceLunar.toFixed(2)} LD
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div>
              <h2>{selected.name}</h2>
              <p>
                Diameter: {selected.diameterMinMeters.toFixed(1)}–
                {selected.diameterMaxMeters.toFixed(1)} m
              </p>
              <p>
                Miss distance: {selected.missDistanceLunar.toFixed(3)} LD (
                {selected.missDistanceKm.toLocaleString()} km)
              </p>
              <p>Velocity: {selected.velocityKmPerSecond.toFixed(2)} km/s</p>
              <p>Close approach: {selected.closeApproachDateFull}</p>
              <a href={selected.nasaJplUrl} target="_blank" rel="noreferrer">
                the actual scientists
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
