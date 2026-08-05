interface ComparisonUnit {
  name: string;
  plural: string;
  lengthMeters: number;
  phrase: (count: string) => string;
}

const UNITS: ComparisonUnit[] = [
  {
    name: "stacked Volkswagen Golf",
    plural: "stacked Volkswagen Golfs",
    lengthMeters: 4.28,
    phrase: (count) => `about ${count} ${count === "1" ? "stacked Volkswagen Golf" : "stacked Volkswagen Golfs"}, nose to tail`,
  },
  {
    name: "average giraffe",
    plural: "average giraffes",
    lengthMeters: 5.5,
    phrase: (count) => `about ${count} average ${count === "1" ? "giraffe" : "giraffes"}, stacked neck to hoof`,
  },
  {
    name: "London bus",
    plural: "London buses",
    lengthMeters: 11,
    phrase: (count) => `about ${count} London ${count === "1" ? "bus" : "buses"}, end to end`,
  },
  {
    name: "blue whale",
    plural: "blue whales",
    lengthMeters: 24,
    phrase: (count) => `about ${count} blue ${count === "1" ? "whale" : "whales"}, nose to tail`,
  },
];

function formatCount(value: number): string {
  if (value >= 10) return Math.round(value).toString();
  if (value >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

/** Picks the largest reference unit that still yields at least one whole one, for a readable count. */
export function comparisonLine(diameterMeters: number): string {
  const candidates = [...UNITS].sort((a, b) => b.lengthMeters - a.lengthMeters);
  const fit = candidates.find((unit) => diameterMeters / unit.lengthMeters >= 1);
  const unit = fit ?? candidates[candidates.length - 1];
  const count = diameterMeters / unit.lengthMeters;
  return unit.phrase(formatCount(count));
}
