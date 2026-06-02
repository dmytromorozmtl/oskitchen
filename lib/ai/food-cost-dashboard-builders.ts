import type { FoodCostTrendPoint } from "@/lib/ai/food-cost-dashboard-types";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

type SnapshotRow = {
  createdAt: Date;
  ingredientCost: number;
  salePrice: number;
  marginPercent: number;
};

/** Aggregate cost snapshots into daily food cost % and margin trend. */
export function buildFoodCostTrend30d(snapshots: SnapshotRow[]): FoodCostTrendPoint[] {
  const byDay = new Map<string, { foodCost: number[]; margin: number[] }>();

  for (const row of snapshots) {
    if (row.salePrice <= 0) continue;
    const date = row.createdAt.toISOString().slice(0, 10);
    const bucket = byDay.get(date) ?? { foodCost: [], margin: [] };
    bucket.foodCost.push((row.ingredientCost / row.salePrice) * 100);
    bucket.margin.push(row.marginPercent);
    byDay.set(date, bucket);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => ({
      date,
      foodCostPercent: round1(bucket.foodCost.reduce((s, v) => s + v, 0) / bucket.foodCost.length),
      marginPercent: round1(bucket.margin.reduce((s, v) => s + v, 0) / bucket.margin.length),
      sampleSize: bucket.foodCost.length,
    }));
}

export function gaugeTone(
  value: number,
  target: number,
  mode: "lower-is-better" | "higher-is-better",
): "green" | "yellow" | "red" {
  if (mode === "lower-is-better") {
    if (value <= target) return "green";
    if (value <= target + 5) return "yellow";
    return "red";
  }
  if (value >= target) return "green";
  if (value >= target - 8) return "yellow";
  return "red";
}

export const GAUGE_TONE_CLASS = {
  green: "text-emerald-600 dark:text-emerald-400",
  yellow: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400",
} as const;

export const GAUGE_TONE_BG = {
  green: "stroke-emerald-500",
  yellow: "stroke-amber-500",
  red: "stroke-red-500",
} as const;
