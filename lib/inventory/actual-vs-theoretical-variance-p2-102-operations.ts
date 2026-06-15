/**
 * Pure helpers for actual vs theoretical variance dashboard tile (Blueprint P2-102).
 */

import type { AvtConfidence } from "@/services/costing/actual-vs-theoretical-service";

export type AvtVarianceTile = {
  driftPercent: number;
  alertCount: number;
  theftAlertCount: number;
  confidence: AvtConfidence;
  status: "healthy" | "watch" | "critical";
  headline: string;
  subline: string;
};

export type TheoreticalBaselineRow = {
  productId: string;
  productName: string;
  theoreticalCostPerUnit: number;
  soldQuantity: number;
  theoreticalUsage: number;
  confidence: AvtConfidence;
  recipeCoverage: boolean;
};

export type ActualDepletionRow = {
  productId: string;
  productName: string;
  theoreticalCost: number;
  actualCost: number;
  variancePercent: number;
  varianceCost: number;
  source: string;
  severity: "critical" | "high" | "normal" | "low";
  recommendation: string;
};

export type ActualVsTheoreticalVarianceReport = {
  varianceTile: AvtVarianceTile;
  theoreticalBaselineCount: number;
  actualDepletionCount: number;
  totalVarianceCost: number;
  theoreticalBaseline: TheoreticalBaselineRow[];
  actualDepletion: ActualDepletionRow[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function severityFromVariance(variancePercent: number): ActualDepletionRow["severity"] {
  if (variancePercent >= 25) return "critical";
  if (variancePercent >= 15) return "high";
  if (variancePercent >= 8) return "normal";
  return "low";
}

export function buildAvtVarianceTile(input: {
  driftPercent: number;
  alertCount: number;
  theftAlertCount: number;
  confidence: AvtConfidence;
}): AvtVarianceTile {
  const status: AvtVarianceTile["status"] =
    input.driftPercent >= 15 || input.theftAlertCount > 0
      ? "critical"
      : input.driftPercent >= 8 || input.alertCount > 3
        ? "watch"
        : "healthy";

  const headline =
    status === "critical"
      ? `${round1(input.driftPercent)}% drift — review before margin erodes`
      : status === "watch"
        ? `${round1(input.driftPercent)}% drift — monitor top items`
        : `${round1(input.driftPercent)}% drift — within typical range`;

  const subline =
    input.confidence === "HIGH"
      ? `${input.alertCount} alert(s) · ${input.theftAlertCount} theft signal(s) · HIGH confidence`
      : input.confidence === "MEDIUM"
        ? `${input.alertCount} alert(s) · receiving history thin — directional only`
        : `${input.alertCount} alert(s) · add recipes and receiving for precision`;

  return {
    driftPercent: round1(input.driftPercent),
    alertCount: input.alertCount,
    theftAlertCount: input.theftAlertCount,
    confidence: input.confidence,
    status,
    headline,
    subline,
  };
}

export function buildTheoreticalBaselineRows(
  rows: Array<{
    productId: string;
    productName: string;
    theoreticalCostPerUnit: number;
    soldQuantity: number;
    confidence: AvtConfidence;
    recipeCoverage: boolean;
  }>,
): TheoreticalBaselineRow[] {
  return rows
    .map((row) => ({
      productId: row.productId,
      productName: row.productName,
      theoreticalCostPerUnit: round2(row.theoreticalCostPerUnit),
      soldQuantity: row.soldQuantity,
      theoreticalUsage: round2(row.theoreticalCostPerUnit * row.soldQuantity),
      confidence: row.confidence,
      recipeCoverage: row.recipeCoverage,
    }))
    .sort((a, b) => b.theoreticalUsage - a.theoreticalUsage);
}

export function buildActualDepletionRows(
  alerts: Array<{
    productId: string;
    productName: string;
    theoreticalCost: number;
    actualCost: number;
    variancePercent: number;
    source: string;
    theftScore?: number;
  }>,
): ActualDepletionRow[] {
  return alerts
    .map((alert) => {
      const varianceCost = round2(Math.abs(alert.actualCost - alert.theoreticalCost));
      const severity = severityFromVariance(alert.variancePercent);
      const recommendation =
        (alert.theftScore ?? 0) > 0
          ? "Compare theoretical depletion vs receiving — check portion drift or unrecorded waste."
          : alert.variancePercent >= 15
            ? "Review recipe yield and portion sizes — variance exceeds typical threshold."
            : "Monitor weekly — verify count discipline and receiving alignment.";

      return {
        productId: alert.productId,
        productName: alert.productName,
        theoreticalCost: round2(alert.theoreticalCost),
        actualCost: round2(alert.actualCost),
        variancePercent: round1(alert.variancePercent),
        varianceCost,
        source: alert.source,
        severity,
        recommendation,
      };
    })
    .sort((a, b) => b.variancePercent - a.variancePercent);
}

export function buildActualVsTheoreticalVarianceReport(input: {
  varianceTile: AvtVarianceTile;
  theoreticalBaseline: TheoreticalBaselineRow[];
  actualDepletion: ActualDepletionRow[];
}): ActualVsTheoreticalVarianceReport {
  const totalVarianceCost = round2(
    input.actualDepletion.reduce((sum, row) => sum + row.varianceCost, 0),
  );

  return {
    varianceTile: input.varianceTile,
    theoreticalBaselineCount: input.theoreticalBaseline.length,
    actualDepletionCount: input.actualDepletion.length,
    totalVarianceCost,
    theoreticalBaseline: input.theoreticalBaseline,
    actualDepletion: input.actualDepletion,
  };
}

/** Demo fixture — deterministic AVT variance tile without DB. */
export const ACTUAL_VS_THEORETICAL_VARIANCE_DEMO_THEORETICAL = [
  {
    productId: "prod-burger",
    productName: "Signature burger",
    theoreticalCostPerUnit: 4.85,
    soldQuantity: 142,
    confidence: "MEDIUM" as const,
    recipeCoverage: true,
  },
  {
    productId: "prod-pasta",
    productName: "Garlic shrimp pasta",
    theoreticalCostPerUnit: 6.2,
    soldQuantity: 89,
    confidence: "MEDIUM" as const,
    recipeCoverage: true,
  },
  {
    productId: "prod-salad",
    productName: "House salad",
    theoreticalCostPerUnit: 2.1,
    soldQuantity: 56,
    confidence: "LOW" as const,
    recipeCoverage: false,
  },
] as const;

export const ACTUAL_VS_THEORETICAL_VARIANCE_DEMO_DEPLETION = [
  {
    productId: "prod-burger",
    productName: "Signature burger",
    theoreticalCost: 4.85,
    actualCost: 5.92,
    variancePercent: 26.1,
    source: "cost_snapshot",
    theftScore: 44,
  },
  {
    productId: "prod-pasta",
    productName: "Garlic shrimp pasta",
    theoreticalCost: 6.2,
    actualCost: 7.05,
    variancePercent: 13.7,
    source: "food_cost_target",
  },
  {
    productId: "prod-salad",
    productName: "House salad",
    theoreticalCost: 2.1,
    actualCost: 2.45,
    variancePercent: 16.7,
    source: "profitability_run",
  },
] as const;

export function buildActualVsTheoreticalVarianceDemoReport(): ActualVsTheoreticalVarianceReport {
  const theoreticalBaseline = buildTheoreticalBaselineRows([
    ...ACTUAL_VS_THEORETICAL_VARIANCE_DEMO_THEORETICAL,
  ]);
  const actualDepletion = buildActualDepletionRows([
    ...ACTUAL_VS_THEORETICAL_VARIANCE_DEMO_DEPLETION,
  ]);
  const varianceTile = buildAvtVarianceTile({
    driftPercent: 12.4,
    alertCount: actualDepletion.length,
    theftAlertCount: 1,
    confidence: "MEDIUM",
  });

  return buildActualVsTheoreticalVarianceReport({
    varianceTile,
    theoreticalBaseline,
    actualDepletion,
  });
}
