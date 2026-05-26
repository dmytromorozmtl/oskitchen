import type { ForecastSourceType } from "@prisma/client";

/**
 * Per-source contribution to a forecast line. Stored on
 * `ForecastLine.sourceSummaryJson` so the UI can show *why* a number
 * was suggested.
 */
export type ForecastSourceContribution = {
  source: ForecastSourceType;
  quantity: number;
  note?: string;
};

export function mergeContributions(
  contributions: ForecastSourceContribution[],
): ForecastSourceContribution[] {
  const map = new Map<ForecastSourceType, ForecastSourceContribution>();
  for (const c of contributions) {
    const prev = map.get(c.source);
    if (prev) {
      prev.quantity += c.quantity;
      if (c.note && !prev.note) prev.note = c.note;
    } else {
      map.set(c.source, { ...c });
    }
  }
  return [...map.values()];
}
