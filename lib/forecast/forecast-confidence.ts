import type { ForecastConfidence } from "@prisma/client";

/**
 * Determine the confidence label given the number of historical
 * observations, whether downstream sources (meal plans / catering) are
 * available, and whether a manual override was applied.
 */
export type ConfidenceInputs = {
  historyDataPoints: number;
  hasMealPlanContribution?: boolean;
  hasCateringContribution?: boolean;
  hasManualOverride?: boolean;
};

export function deriveConfidence(inputs: ConfidenceInputs): ForecastConfidence {
  if (inputs.hasManualOverride) return "MANUAL";
  const supports = (inputs.hasMealPlanContribution ? 1 : 0) + (inputs.hasCateringContribution ? 1 : 0);
  if (inputs.historyDataPoints >= 21 && supports >= 1) return "HIGH";
  if (inputs.historyDataPoints >= 14) return "MEDIUM";
  if (inputs.historyDataPoints >= 7 || supports >= 1) return "LOW";
  return "LOW";
}

export function deriveRunConfidence(lines: { confidence: ForecastConfidence }[]): ForecastConfidence {
  if (lines.length === 0) return "LOW";
  const order: ForecastConfidence[] = ["LOW", "MEDIUM", "HIGH", "MANUAL"];
  const counts = new Map<ForecastConfidence, number>(order.map((o) => [o, 0]));
  for (const l of lines) counts.set(l.confidence, (counts.get(l.confidence) ?? 0) + 1);
  let bestKey: ForecastConfidence = "LOW";
  let bestCount = -1;
  counts.forEach((count, key) => {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  });
  return bestKey;
}
