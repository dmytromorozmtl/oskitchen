/** Normal CDF approximation (Abramowitz & Stegun) for two-sided p-value from z. */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export type ProportionSignificanceResult = {
  z: number;
  pValue: number;
  significant: boolean;
  sampleSizeOk: boolean;
};

/**
 * Two-proportion z-test (draft vs published checkout conversion).
 * `significant` when two-sided p < 0.05 and each arm has at least `minPerArm` exposures.
 */
export function twoProportionSignificance(input: {
  published: { successes: number; trials: number };
  draft: { successes: number; trials: number };
  minPerArm?: number;
  alpha?: number;
}): ProportionSignificanceResult {
  const minPerArm = input.minPerArm ?? 100;
  const alpha = input.alpha ?? 0.05;
  const n1 = input.published.trials;
  const n2 = input.draft.trials;
  const sampleSizeOk = n1 >= minPerArm && n2 >= minPerArm;

  if (n1 === 0 || n2 === 0) {
    return { z: 0, pValue: 1, significant: false, sampleSizeOk };
  }

  const p1 = input.published.successes / n1;
  const p2 = input.draft.successes / n2;
  const pooled = (input.published.successes + input.draft.successes) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (se === 0) {
    return { z: 0, pValue: 1, significant: false, sampleSizeOk };
  }

  const z = (p2 - p1) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  return {
    z,
    pValue,
    significant: sampleSizeOk && pValue < alpha,
    sampleSizeOk,
  };
}

/** Lift of draft conversion rate vs published (% points, rounded 0.1). */
export function experimentLiftPercentPoints(
  publishedRate: number,
  draftRate: number,
): number {
  return Math.round((draftRate - publishedRate) * 10) / 10;
}
