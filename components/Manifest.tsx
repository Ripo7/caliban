import type { Asteroid } from "@/lib/types";

interface ManifestProps {
  asteroids: Asteroid[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function Manifest({ asteroids, selectedId, onSelect }: ManifestProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-rule px-4 py-2">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-instrument">
          Manifest &mdash; {asteroids.length} object{asteroids.length === 1 ? "" : "s"}
        </h2>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {asteroids.map((a) => {
          const isSelected = a.id === selectedId;
          const avgDiameter = (a.diameterMinMeters + a.diameterMaxMeters) / 2;
          return (
            <li key={a.id} className="border-b border-rule">
              <button
                type="button"
                onClick={() => onSelect(a.id)}
                aria-pressed={isSelected}
                className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-instrument ${
                  isSelected ? "bg-field-raised" : "hover:bg-field-raised/60"
                }`}
              >
                <span className="truncate font-mono text-sm text-bone">
                  {a.name}
                  {a.isPotentiallyHazardous && (
                    <span
                      aria-label="potentially hazardous"
                      className="ml-2 inline-block border border-hazard px-1 text-[10px] uppercase text-hazard"
                    >
                      PHA
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap font-mono text-xs text-bone-dim">
                  {avgDiameter < 10 ? avgDiameter.toFixed(1) : Math.round(avgDiameter)} m
                </span>
                <span className="whitespace-nowrap font-mono text-xs text-instrument">
                  {a.missDistanceLunar.toFixed(2)} LD
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
