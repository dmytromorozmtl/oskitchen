import {
  DATA_VIZ_WATERFALL_FILLS,
  WATERFALL_CHART_TEST_ID,
} from "@/lib/analytics/data-viz-standards-policy";
import type { RealTimeProfitSnapshot } from "@/services/analytics/real-time-profit-service";

export type WaterfallStepKind = "start" | "decrease" | "end";

export type WaterfallChartDatum = {
  id: string;
  label: string;
  base: number;
  value: number;
  delta: number;
  fill: string;
  kind: WaterfallStepKind;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Revenue → costs → net profit waterfall steps for Recharts stacked bars. */
export function buildProfitWaterfallData(
  snapshot: Pick<
    RealTimeProfitSnapshot,
    "revenue" | "foodCost" | "laborCost" | "deliveryCost" | "profit"
  >,
): WaterfallChartDatum[] {
  const { revenue, foodCost, laborCost, deliveryCost, profit } = snapshot;
  if (revenue <= 0) return [];

  const steps: Array<{
    id: string;
    label: string;
    delta: number;
    kind: WaterfallStepKind;
    fill: string;
  }> = [
    {
      id: "revenue",
      label: "Revenue",
      delta: round2(revenue),
      kind: "start",
      fill: DATA_VIZ_WATERFALL_FILLS.revenue,
    },
    {
      id: "food",
      label: "Food cost",
      delta: round2(-foodCost),
      kind: "decrease",
      fill: DATA_VIZ_WATERFALL_FILLS.cost,
    },
    {
      id: "labor",
      label: "Labor",
      delta: round2(-laborCost),
      kind: "decrease",
      fill: DATA_VIZ_WATERFALL_FILLS.labor,
    },
    {
      id: "delivery",
      label: "Delivery",
      delta: round2(-deliveryCost),
      kind: "decrease",
      fill: DATA_VIZ_WATERFALL_FILLS.delivery,
    },
    {
      id: "profit",
      label: profit >= 0 ? "Net profit" : "Net loss",
      delta: round2(profit),
      kind: "end",
      fill: profit >= 0 ? DATA_VIZ_WATERFALL_FILLS.profit : DATA_VIZ_WATERFALL_FILLS.loss,
    },
  ];

  let running = 0;
  const data: WaterfallChartDatum[] = [];

  for (const step of steps) {
    if (step.kind === "start") {
      running = step.delta;
      data.push({
        ...step,
        base: 0,
        value: Math.max(step.delta, 0),
      });
      continue;
    }

    if (step.kind === "decrease") {
      const value = Math.abs(step.delta);
      if (value <= 0) continue;
      const base = Math.max(running - value, 0);
      running = base;
      data.push({ ...step, base, value });
      continue;
    }

    const value = Math.abs(step.delta);
    if (value <= 0 && profit === 0) continue;
    data.push({ ...step, base: 0, value: Math.max(value, 0.01) });
  }

  return data;
}

export function waterfallChartAriaLabel(data: readonly WaterfallChartDatum[]): string {
  return data.map((row) => `${row.label} ${row.delta >= 0 ? "+" : ""}${row.delta}`).join(", ");
}

export { WATERFALL_CHART_TEST_ID };
