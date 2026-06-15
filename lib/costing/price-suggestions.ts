import type { MergedCostingSettings } from "./costing-settings";

function roundPsychological99(n: number): number {
  if (n <= 0) return 0;
  const bumped = Math.ceil(n * 100) / 100;
  const whole = Math.floor(bumped);
  const frac = bumped - whole;
  if (frac < 0.005) return whole - 0.01;
  if (frac <= 0.5) return whole + 0.99;
  return whole + 1.99;
}

function roundNearestNickel(n: number): number {
  return Math.ceil(n * 20) / 20;
}

/**
 * Suggested list price from variable + fixed costs and a **gross margin target** (0–100).
 * Output is an operational estimate, not tax or retail pricing advice.
 */
export function suggestPriceFromTargetMargin(
  totalCostBeforePriceScaledFees: number,
  targetMarginPercent: number,
  settings: Pick<MergedCostingSettings, "roundingStyle" | "minimumSuggestedPrice">,
  /** Applied to sale price (e.g. platform % + card %). */
  effectiveFeeRateOnRevenue: number,
): number | null {
  const margin = Math.min(99.5, Math.max(0, targetMarginPercent)) / 100;
  const fee = Math.min(0.95, Math.max(0, effectiveFeeRateOnRevenue));
  const denom = 1 - fee - margin;
  if (denom <= 0.01) return null;
  const raw = totalCostBeforePriceScaledFees / denom;
  let out = raw;
  switch (settings.roundingStyle) {
    case "NEAREST_NICKEL":
      out = roundNearestNickel(raw);
      break;
    case "PSYCHOLOGICAL_99":
      out = roundPsychological99(raw);
      break;
    default:
      out = Math.ceil(raw * 100) / 100;
  }
  if (settings.minimumSuggestedPrice > 0) {
    out = Math.max(out, settings.minimumSuggestedPrice);
  }
  return out;
}
