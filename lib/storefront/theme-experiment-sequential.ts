/**
 * Sequential testing — O'Brien-Fleming spending function (simplified z-scale).
 * @see https://en.wikipedia.org/wiki/O%27Brien%E2%80%93Fleming_boundary
 */

export type SequentialLook = {
  lookIndex: number;
  maxLooks: number;
  zBoundary: number;
  canStopEarly: boolean;
};

export type SequentialDecision = {
  enabled: boolean;
  look: SequentialLook | null;
  passedBoundary: boolean;
  headline: string;
  detail: string;
};

/** O'Brien-Fleming critical z at information fraction t ∈ (0,1]. */
export function obrienFlemingZ(t: number, alpha = 0.05): number {
  const clamped = Math.min(1, Math.max(0.01, t));
  const zAlpha = 1.96;
  return zAlpha / Math.sqrt(clamped);
}

export function evaluateSequentialLook(input: {
  lookIndex: number;
  maxLooks: number;
  alpha?: number;
}): SequentialLook {
  const maxLooks = Math.max(1, Math.floor(input.maxLooks));
  const lookIndex = Math.min(maxLooks, Math.max(1, Math.floor(input.lookIndex)));
  const t = lookIndex / maxLooks;
  const zBoundary = obrienFlemingZ(t, input.alpha ?? 0.05);
  return {
    lookIndex,
    maxLooks,
    zBoundary,
    canStopEarly: lookIndex < maxLooks,
  };
}

/** Map two-proportion z-stat to sequential boundary check. */
export function evaluateSequentialDecision(input: {
  zStat: number;
  lookIndex: number;
  maxLooks: number;
  alpha?: number;
}): SequentialDecision {
  if (process.env.THEME_EXPERIMENT_SEQUENTIAL !== "1") {
    return {
      enabled: false,
      look: null,
      passedBoundary: true,
      headline: "Sequential testing off",
      detail: "Set THEME_EXPERIMENT_SEQUENTIAL=1 to enable early-stop boundaries.",
    };
  }

  const look = evaluateSequentialLook(input);
  const passedBoundary = Math.abs(input.zStat) >= look.zBoundary;

  return {
    enabled: true,
    look,
    passedBoundary,
    headline: passedBoundary
      ? `Sequential boundary met (look ${look.lookIndex}/${look.maxLooks})`
      : `Continue experiment (look ${look.lookIndex}/${look.maxLooks})`,
    detail: passedBoundary
      ? `|z|=${Math.abs(input.zStat).toFixed(2)} ≥ O'Brien-Fleming ${look.zBoundary.toFixed(2)}`
      : `|z|=${Math.abs(input.zStat).toFixed(2)} < boundary ${look.zBoundary.toFixed(2)} — not enough evidence to stop early`,
  };
}

export function defaultMaxLooks(): number {
  const n = Number(process.env.THEME_EXPERIMENT_SEQUENTIAL_MAX_LOOKS ?? "4");
  return Math.min(8, Math.max(2, Math.floor(n)));
}
