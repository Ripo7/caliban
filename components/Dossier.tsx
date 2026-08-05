import type { Asteroid } from "@/lib/types";
import { verdictFor } from "@/lib/verdict";
import { comparisonLine } from "@/lib/comparisons";

interface DossierProps {
  asteroid: Asteroid;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="font-mono text-[11px] uppercase tracking-wide text-instrument">
        {label}
      </dt>
      <dd className="text-right font-mono text-sm text-bone">{value}</dd>
    </div>
  );
}

export default function Dossier({ asteroid, onClose }: DossierProps) {
  const verdict = verdictFor(asteroid);
  const avgDiameter = (asteroid.diameterMinMeters + asteroid.diameterMaxMeters) / 2;
  const comparison = comparisonLine(avgDiameter);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-rule px-4 py-2">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-instrument">
          Dossier
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs uppercase text-bone-dim hover:text-bone focus-visible:outline-2 focus-visible:outline-instrument"
          aria-label="Close dossier"
        >
          close
        </button>
      </div>

      <div className="px-4 py-3">
        <h3 className="font-display text-xl uppercase tracking-tightish text-bone">
          {asteroid.name}
        </h3>
        {asteroid.isPotentiallyHazardous && (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-hazard">
            potentially hazardous object{asteroid.isSentryObject ? " — sentry monitored" : ""}
          </p>
        )}

        <dl className="mt-3 divide-y divide-rule border-y border-rule">
          <Row
            label="Diameter"
            value={`${asteroid.diameterMinMeters.toFixed(1)}–${asteroid.diameterMaxMeters.toFixed(1)} m`}
          />
          <Row
            label="Miss distance"
            value={`${asteroid.missDistanceLunar.toFixed(3)} LD / ${Math.round(
              asteroid.missDistanceKm,
            ).toLocaleString()} km`}
          />
          <Row label="Velocity" value={`${asteroid.velocityKmPerSecond.toFixed(2)} km/s`} />
          <Row label="Close approach" value={asteroid.closeApproachDateFull} />
          <Row label="Orbiting body" value={asteroid.orbitingBody} />
        </dl>

        <p className="mt-3 text-sm italic text-bone-dim">
          For scale: {comparison}.
        </p>

        <div className="mt-4 border border-hazard/60 px-3 py-2.5">
          <p className="font-mono text-xs uppercase tracking-wide text-hazard">
            {verdict}
          </p>
        </div>

        <a
          href={asteroid.nasaJplUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-instrument underline decoration-rule underline-offset-4 hover:text-bone focus-visible:outline-2 focus-visible:outline-instrument"
        >
          the actual scientists &rarr;
        </a>
      </div>
    </div>
  );
}
