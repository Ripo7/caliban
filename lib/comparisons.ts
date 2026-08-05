interface ComparisonUnit {
  lengthMeters: number;
  phrase: (count: string, isOne: boolean) => string;
}

const UNITS: ComparisonUnit[] = [
  {
    lengthMeters: 4.28,
    phrase: (count, isOne) =>
      `about ${count} Volkswagen Golf${isOne ? "" : "s"}, lined up bumper to bumper`,
  },
  {
    lengthMeters: 5.5,
    phrase: (count, isOne) =>
      `about ${count} average giraffe${isOne ? "" : "s"}, stacked hoof to horn`,
  },
  {
    lengthMeters: 11,
    phrase: (count, isOne) => `about ${count} London bus${isOne ? "" : "es"}, end to end`,
  },
  {
    lengthMeters: 24,
    phrase: (count, isOne) => `about ${count} blue whale${isOne ? "" : "s"}, nose to tail`,
  },
];

function formatCount(value: number): { text: string; isOne: boolean } {
  if (value >= 10) return { text: Math.round(value).toString(), isOne: false };
  if (value >= 1) return { text: value.toFixed(1), isOne: Math.round(value * 10) === 10 };
  return { text: value.toFixed(2), isOne: false };
}

/** Picks the largest reference unit that still yields at least one whole one, for a readable count. */
export function comparisonLine(diameterMeters: number): string {
  const candidates = [...UNITS].sort((a, b) => b.lengthMeters - a.lengthMeters);
  const fit = candidates.find((unit) => diameterMeters / unit.lengthMeters >= 1);
  const unit = fit ?? candidates[candidates.length - 1];
  const count = diameterMeters / unit.lengthMeters;
  const { text, isOne } = formatCount(count);
  return unit.phrase(text, isOne);
}
