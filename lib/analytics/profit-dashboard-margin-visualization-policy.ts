import { marginZone } from "@/services/analytics/profit-alerts";
import type { ProfitItemRow, RealTimeProfitSnapshot } from "@/services/analytics/real-time-profit-service";

/**
 * DES-19 — profit dashboard margin visualization policy.
 *
 * @see components/analytics/profit-margin-breakdown-bar.tsx
 * @see components/analytics/profit-item-margin-bars.tsx
 */

export const PROFIT_DASHBOARD_MARGIN_VIZ_POLICY_ID = "profit-dashboard-margin-viz-des19-v1" as const;

export const PROFIT_MARGIN_STACK_TEST_ID = "profit-margin-stack-bar" as const;
export const PROFIT_ITEM_MARGIN_BARS_TEST_ID = "profit-item-margin-bars" as const;

export const MARGIN_VIZ_GREEN_MIN = 55 as const;
export const MARGIN_VIZ_YELLOW_MIN = 40 as const;

export type MarginStackSegmentId = "food" | "labor" | "delivery" | "profit";

export type MarginStackSegment = {
  id: MarginStackSegmentId;
  label: string;
  percent: number;
  amount: number;
  barClass: string;
};

export type ItemMarginBarRow = {
  productId: string;
  title: string;
  marginPercent: number;
  zone: ReturnType<typeof marginZone>;
  barWidthPercent: number;
  revenue: number;
};

export function marginBarClassForZone(zone: ReturnType<typeof marginZone>): string {
  switch (zone) {
    case "green":
      return "bg-emerald-500 dark:bg-emerald-400";
    case "yellow":
      return "bg-amber-500 dark:bg-amber-400";
    default:
      return "bg-rose-500 dark:bg-rose-400";
  }
}

export function marginStackBarClassForSegment(id: MarginStackSegmentId): string {
  switch (id) {
    case "food":
      return "bg-rose-500/80";
    case "labor":
      return "bg-violet-500/80";
    case "delivery":
      return "bg-sky-500/80";
    case "profit":
      return "bg-emerald-500/90";
  }
}

function percentOfRevenue(amount: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return Math.round((amount / revenue) * 1000) / 10;
}

export function buildProfitMarginStackSegments(
  snapshot: Pick<
    RealTimeProfitSnapshot,
    "revenue" | "foodCost" | "laborCost" | "deliveryCost" | "profit"
  >,
): MarginStackSegment[] {
  const { revenue, foodCost, laborCost, deliveryCost, profit } = snapshot;
  if (revenue <= 0) {
    return [];
  }

  return [
    {
      id: "food",
      label: "Food",
      amount: foodCost,
      percent: percentOfRevenue(foodCost, revenue),
      barClass: marginStackBarClassForSegment("food"),
    },
    {
      id: "labor",
      label: "Labor",
      amount: laborCost,
      percent: percentOfRevenue(laborCost, revenue),
      barClass: marginStackBarClassForSegment("labor"),
    },
    {
      id: "delivery",
      label: "Delivery",
      amount: deliveryCost,
      percent: percentOfRevenue(deliveryCost, revenue),
      barClass: marginStackBarClassForSegment("delivery"),
    },
    {
      id: "profit",
      label: profit >= 0 ? "Profit" : "Loss",
      amount: profit,
      percent: percentOfRevenue(profit, revenue),
      barClass:
        profit >= 0
          ? marginStackBarClassForSegment("profit")
          : "bg-rose-600/90",
    },
  ].filter((segment) => segment.percent !== 0 || segment.id === "profit") as MarginStackSegment[];
}

export function buildItemMarginBarRows(
  items: readonly ProfitItemRow[],
  options: { maxRows?: number } = {},
): ItemMarginBarRow[] {
  const maxRows = options.maxRows ?? 5;
  return items.slice(0, maxRows).map((item) => {
    const zone = marginZone(item.marginPercent);
    return {
      productId: item.productId,
      title: item.title,
      marginPercent: item.marginPercent,
      zone,
      barWidthPercent: Math.max(0, Math.min(100, item.marginPercent)),
      revenue: item.revenue,
    };
  });
}

export function summarizeMarginStackSegments(segments: readonly MarginStackSegment[]): {
  totalPercent: number;
  segmentCount: number;
} {
  const totalPercent = Math.round(segments.reduce((sum, s) => sum + s.percent, 0) * 10) / 10;
  return { totalPercent, segmentCount: segments.length };
}
