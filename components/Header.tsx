interface HeaderProps {
  date: string;
  elementCount: number;
  hazardousCount: number;
  isArchived: boolean;
  scaleMode: "readable" | "true";
  onToggleScale: () => void;
}

export default function Header({
  date,
  elementCount,
  hazardousCount,
  isArchived,
  scaleMode,
  onToggleScale,
}: HeaderProps) {
  return (
    <header className="border-b border-rule px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="font-display text-2xl uppercase tracking-tightish text-bone sm:text-3xl">
          Asteroid Roulette
        </h1>
        <button
          type="button"
          onClick={onToggleScale}
          className="font-mono text-xs uppercase tracking-wide text-instrument border border-rule px-3 py-1.5 hover:border-instrument hover:text-bone transition-colors focus-visible:outline-2 focus-visible:outline-instrument"
        >
          {scaleMode === "readable" ? "True scale" : "Readable scale"}
        </button>
      </div>

      <p className="mt-2 max-w-3xl text-sm text-bone-dim">
        <span className="font-mono text-bone">{date}</span> &mdash;{" "}
        <span className="font-mono text-bone">{elementCount}</span> object
        {elementCount === 1 ? "" : "s"} tracked &mdash;{" "}
        <span className="font-mono text-hazard">{hazardousCount}</span> flagged
        potentially hazardous, a technical orbital classification and not a
        forecast.
        {isArchived && (
          <span className="ml-2 border border-rule px-1.5 py-0.5 font-mono text-[11px] uppercase text-instrument">
            live feed unavailable — showing last archived capture
          </span>
        )}
      </p>
    </header>
  );
}
