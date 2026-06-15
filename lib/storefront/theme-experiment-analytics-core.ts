import type { ThemeExperimentArm } from "@/lib/storefront/theme-experiment";

export const EXPERIMENT_FUNNEL_EVENT_NAMES = [
  "experiment.exposure",
  "checkout_start",
  "checkout_submit",
] as const;

export type ExperimentFunnelEventName = (typeof EXPERIMENT_FUNNEL_EVENT_NAMES)[number];

export type ExperimentArmCounts = {
  exposures: number;
  checkouts: number;
  conversions: number;
};

export type ExperimentDailyChartRow = {
  date: string;
  label: string;
  published: ExperimentArmCounts & { conversionRatePercent: number };
  draft: ExperimentArmCounts & { conversionRatePercent: number };
};

export function parseExperimentArmFromMetadata(meta: unknown): ThemeExperimentArm | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const arm = (meta as { experimentArm?: unknown }).experimentArm;
  if (arm === "draft" || arm === "published") return arm;
  return null;
}

export function parseExperimentArmId(meta: unknown): string | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const arm = (meta as { experimentArm?: unknown }).experimentArm;
  return typeof arm === "string" && arm.length > 0 ? arm : null;
}

export function conversionRatePercent(checkouts: number, conversions: number): number {
  if (checkouts <= 0) return 0;
  return Math.round((conversions / checkouts) * 1000) / 10;
}

export function emptyArmCounts(): ExperimentArmCounts {
  return { exposures: 0, checkouts: 0, conversions: 0 };
}

/** UTC date keys for each day in the window (inclusive). */
export function buildExperimentDateKeys(since: Date, days: number): string[] {
  const keys: string[] = [];
  const cursor = new Date(since);
  cursor.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < days; i++) {
    const d = new Date(cursor);
    d.setUTCDate(cursor.getUTCDate() + i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

type DailyBucket = Record<ThemeExperimentArm, ExperimentArmCounts>;

export function initExperimentDailyBuckets(dateKeys: string[]): Map<string, DailyBucket> {
  const buckets = new Map<string, DailyBucket>();
  for (const date of dateKeys) {
    buckets.set(date, { published: emptyArmCounts(), draft: emptyArmCounts() });
  }
  return buckets;
}

export function accumulateExperimentFunnelEvent(
  buckets: Map<string, DailyBucket>,
  input: { dateKey: string; arm: ThemeExperimentArm; eventName: string },
): void {
  const bucket = buckets.get(input.dateKey);
  if (!bucket) return;
  const row = bucket[input.arm];
  if (input.eventName === "experiment.exposure") row.exposures++;
  else if (input.eventName === "checkout_start") row.checkouts++;
  else if (input.eventName === "checkout_submit") row.conversions++;
}

export function experimentDailyChartRowsFromBuckets(
  buckets: Map<string, DailyBucket>,
): ExperimentDailyChartRow[] {
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, arms]) => {
      const published = {
        ...arms.published,
        conversionRatePercent: conversionRatePercent(arms.published.checkouts, arms.published.conversions),
      };
      const draft = {
        ...arms.draft,
        conversionRatePercent: conversionRatePercent(arms.draft.checkouts, arms.draft.conversions),
      };
      return {
        date,
        label: date.slice(5),
        published,
        draft,
      };
    });
}

export function sumExperimentArmCounts(rows: ExperimentDailyChartRow[]): {
  published: ExperimentArmCounts & { conversionRatePercent: number };
  draft: ExperimentArmCounts & { conversionRatePercent: number };
} {
  const published = emptyArmCounts();
  const draft = emptyArmCounts();
  for (const row of rows) {
    published.exposures += row.published.exposures;
    published.checkouts += row.published.checkouts;
    published.conversions += row.published.conversions;
    draft.exposures += row.draft.exposures;
    draft.checkouts += row.draft.checkouts;
    draft.conversions += row.draft.conversions;
  }
  return {
    published: {
      ...published,
      conversionRatePercent: conversionRatePercent(published.checkouts, published.conversions),
    },
    draft: {
      ...draft,
      conversionRatePercent: conversionRatePercent(draft.checkouts, draft.conversions),
    },
  };
}
