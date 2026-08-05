interface VerdictInput {
  diameterMinMeters: number;
  diameterMaxMeters: number;
  missDistanceLunar: number;
  isPotentiallyHazardous: boolean;
}

type SizeBand = "pebble" | "boulder" | "stadium" | "huge";

function sizeBandOf(avgDiameter: number): SizeBand {
  if (avgDiameter < 15) return "pebble";
  if (avgDiameter < 75) return "boulder";
  if (avgDiameter < 300) return "stadium";
  return "huge";
}

function moons(ld: number): string {
  return `${Math.round(ld)} Moon${Math.round(ld) === 1 ? "" : "s"}`;
}

const GRAZING: Record<SizeBand, string> = {
  pebble: "THREAT LEVEL: small, close, and none of your concern.",
  boulder: "THREAT LEVEL: closer than several of your friendships.",
  stadium:
    "THREAT LEVEL: stadium-sized, and close enough that somebody checked the math twice.",
  huge: "ASSESSMENT: filed as urgent. remains, on review, still just a filing.",
};

const NEAR: Record<SizeBand, string> = {
  pebble: "ASSESSMENT: a pebble by any reasonable definition, tracked anyway.",
  boulder: "THREAT LEVEL: hazardous on paper, uneventful in practice.",
  stadium: "ASSESSMENT: large enough to matter, if it mattered. it does not, this time.",
  huge: "THREAT LEVEL: the size of a small nation's worry, none of it yours.",
};

const COMFORTABLE: Record<SizeBand, string> = {
  pebble: "ASSESSMENT: filed. no action required. no action possible.",
  boulder: "THREAT LEVEL: you will die of something else.",
  stadium: "ASSESSMENT: impressive dimensions, irrelevant trajectory.",
  huge: "ASSESSMENT: noted for the record, closed without incident.",
};

const THEORETICAL = "THREAT LEVEL: this far out, it is basically a rumor.";
const THEORETICAL_HAZARDOUS =
  "ASSESSMENT: hazardous per the classification, harmless per the distance. the paperwork and the sky disagree.";

const HAZARDOUS_ASIDE_NEAR_BOULDER =
  "THREAT LEVEL: officially hazardous, currently missing. filed as a near miss, emphasis on miss.";
const HAZARDOUS_ASIDE_COMFORTABLE_STADIUM =
  "ASSESSMENT: technically hazardous. practically, filed and forgotten.";

/** Pure function of size and miss distance. Deadpan, never exclamatory, never about casualties. */
export function verdictFor(asteroid: VerdictInput): string {
  const avgDiameter = (asteroid.diameterMinMeters + asteroid.diameterMaxMeters) / 2;
  const ld = asteroid.missDistanceLunar;
  const band = sizeBandOf(avgDiameter);
  const hazardous = asteroid.isPotentiallyHazardous;

  if (ld < 1) return GRAZING[band];

  if (ld < 5) {
    if (hazardous && band === "boulder") return HAZARDOUS_ASIDE_NEAR_BOULDER;
    return NEAR[band];
  }

  if (ld < 15) {
    if (hazardous && band === "stadium") return HAZARDOUS_ASIDE_COMFORTABLE_STADIUM;
    return COMFORTABLE[band];
  }

  if (ld < 35) {
    return `THREAT LEVEL: this rock will miss us by ${moons(ld)}. it is not thinking about you.`;
  }

  return hazardous ? THEORETICAL_HAZARDOUS : THEORETICAL;
}
