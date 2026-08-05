"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { NeosResponse } from "@/lib/types";
import Header from "@/components/Header";
import Manifest from "@/components/Manifest";
import Dossier from "@/components/Dossier";
import TrueScalePayoff from "@/components/TrueScalePayoff";

const Scene = dynamic(() => import("@/components/scene/Scene"), { ssr: false });

const SCALE_TRANSITION_MS = 2200;
const EMPTY_FRAME_HOLD_MS = 900;

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
  const [payoffVisible, setPayoffVisible] = useState(false);
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
    const duration = SCALE_TRANSITION_MS;
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

  useEffect(() => {
    if (scaleMode !== "true") {
      setPayoffVisible(false);
      return;
    }
    if (reducedMotion) {
      setPayoffVisible(true);
      return;
    }
    const timeout = setTimeout(
      () => setPayoffVisible(true),
      SCALE_TRANSITION_MS + EMPTY_FRAME_HOLD_MS,
    );
    return () => clearTimeout(timeout);
  }, [scaleMode, reducedMotion]);

  if (error) {
    return (
      <main className="flex h-screen items-center justify-center bg-field px-6 text-center">
        <p className="max-w-md font-mono text-sm text-bone-dim">
          The feed did not respond and the archive did not load either. There is
          nothing to file. ({error})
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex h-screen items-center justify-center bg-field">
        <p className="font-mono text-sm uppercase tracking-widest text-instrument">
          Requesting orbital data&hellip;
        </p>
      </main>
    );
  }

  const hovered = data.asteroids.find((a) => a.id === hoveredId) ?? null;
  const selected = data.asteroids.find((a) => a.id === selectedId) ?? null;

  return (
    <main className="flex h-screen flex-col bg-field text-bone">
      <Header
        date={data.date}
        elementCount={data.elementCount}
        hazardousCount={data.hazardousCount}
        isArchived={data.isArchived}
        scaleMode={scaleMode}
        onToggleScale={() => setScaleMode(scaleMode === "readable" ? "true" : "readable")}
      />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative h-[46vh] shrink-0 border-b border-rule md:h-auto md:flex-[1.6] md:border-b-0 md:border-r">
          <Scene
            asteroids={data.asteroids}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onHover={setHoveredId}
            scaleT={scaleT}
            reducedMotion={reducedMotion}
          />

          <div className="pointer-events-none absolute left-3 top-3 font-mono text-[11px] uppercase tracking-widest text-instrument">
            {scaleMode === "readable" ? "Readable scale" : "True scale"}
          </div>

          {hovered && hovered.id !== selectedId && !payoffVisible && (
            <div className="pointer-events-none absolute bottom-3 left-3 border border-rule bg-field/90 px-2.5 py-1.5 font-mono text-xs text-bone">
              {hovered.name} — {hovered.missDistanceLunar.toFixed(2)} LD
            </div>
          )}

          {scaleMode === "true" && (
            <TrueScalePayoff
              visible={payoffVisible}
              reducedMotion={reducedMotion}
              onReturn={() => setScaleMode("readable")}
            />
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:w-[380px] md:flex-none">
          <div className={selected ? "hidden md:flex md:min-h-0 md:flex-1 md:flex-col" : "flex min-h-0 flex-1 flex-col"}>
            <Manifest asteroids={data.asteroids} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          {selected && (
            <div className="flex min-h-0 flex-1 flex-col border-t border-rule md:flex-[1.3]">
              <Dossier asteroid={selected} onClose={() => setSelectedId(null)} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
