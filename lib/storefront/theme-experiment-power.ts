export type ExperimentPowerEstimate = {
  targetLiftPp: number;
  power: number;
  alpha: number;
  baselineRatePercent: number;
  minCheckoutsPerArm: number;
  headline: string;
  detail: string;
};

function zForPower(power: number): number {
  if (power >= 0.9) return 1.28;
  if (power >= 0.8) return 0.84;
  return 0.84;
}

/**
 * Approximate min checkouts per arm for detecting `targetLiftPp` at given baseline rate.
 * Uses two-proportion normal approximation (conservative).
 */
export function estimateMinCheckoutsPerArm(input: {
  baselineRatePercent: number;
  targetLiftPp: number;
  power?: number;
  alpha?: number;
}): ExperimentPowerEstimate {
  const power = input.power ?? 0.8;
  const alpha = input.alpha ?? 0.05;
  const p1 = Math.min(99.9, Math.max(0.1, input.baselineRatePercent)) / 100;
  const p2 = Math.min(0.999, p1 + input.targetLiftPp / 100);
  const zAlpha = 1.96;
  const zBeta = zForPower(power);
  const pBar = (p1 + p2) / 2;
  const delta = Math.abs(p2 - p1);
  if (delta < 0.0001) {
    return {
      targetLiftPp: input.targetLiftPp,
      power,
      alpha,
      baselineRatePercent: input.baselineRatePercent,
      minCheckoutsPerArm: 10_000,
      headline: "Increase target lift",
      detail: "Target lift too small relative to baseline.",
    };
  }
  const n =
    ((zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) /
      delta) **
    2;
  const minCheckoutsPerArm = Math.ceil(n);

  return {
    targetLiftPp: input.targetLiftPp,
    power,
    alpha,
    baselineRatePercent: input.baselineRatePercent,
    minCheckoutsPerArm,
    headline: `~${minCheckoutsPerArm.toLocaleString()} checkouts per arm`,
    detail: `For ${input.targetLiftPp} pp lift at ${input.baselineRatePercent}% baseline (${Math.round(power * 100)}% power, α=${alpha}).`,
  };
}
