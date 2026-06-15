/**
 * Pure helpers for inventory variance report (Blueprint P2-99).
 */

import type {
  ShrinkageSignal,
  TheftSignal,
  WasteSignal,
} from "@/lib/ai/inventory-manager-types";
import type { InventoryCountVarianceSummary } from "@/services/inventory/count-service";

export type ExpectedVsActualRow = {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  expectedQty: number;
  actualQty: number;
  varianceQty: number;
  varianceCost: number;
  variancePercent: number;
};

export type TheftSpoilageRow = {
  id: string;
  label: string;
  type: "theft" | "spoilage";
  severity: "critical" | "high" | "normal" | "low";
  exposureCost: number;
  detail: string;
  recommendation: string;
};

export type WasteTrackingRow = {
  reason: string;
  eventCount: number;
  totalCost: number;
  severity: "critical" | "high" | "normal" | "low";
  recommendation: string;
};

export type InventoryVarianceReport = {
  expectedVsActualCount: number;
  theftSpoilageCount: number;
  wasteTrackingCount: number;
  totalVarianceCost: number;
  totalWasteCost: number;
  totalTheftExposure: number;
  expectedVsActual: ExpectedVsActualRow[];
  theftSpoilage: TheftSpoilageRow[];
  wasteTracking: WasteTrackingRow[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computeExpectedVsActualRow(
  ingredientId: string,
  ingredientName: string,
  unit: string,
  expectedQty: number,
  actualQty: number,
  unitCost: number,
): ExpectedVsActualRow {
  const varianceQty = round2(actualQty - expectedQty);
  const varianceCost = round2(varianceQty * unitCost);
  const variancePercent =
    expectedQty > 0 ? round1((varianceQty / expectedQty) * 100) : actualQty > 0 ? 100 : 0;

  return {
    ingredientId,
    ingredientName,
    unit,
    expectedQty,
    actualQty,
    varianceQty,
    varianceCost,
    variancePercent,
  };
}

export function buildExpectedVsActualFromCountSummary(
  lines: Array<{
    ingredientId: string;
    ingredientName: string;
    unit: string;
    expectedQty: number;
    countedQty: number;
    unitCost: number;
  }>,
): ExpectedVsActualRow[] {
  return lines
    .map((line) =>
      computeExpectedVsActualRow(
        line.ingredientId,
        line.ingredientName,
        line.unit,
        line.expectedQty,
        line.countedQty,
        line.unitCost,
      ),
    )
    .filter((row) => row.varianceQty !== 0)
    .sort((a, b) => Math.abs(b.varianceCost) - Math.abs(a.varianceCost));
}

export function buildTheftSpoilageRows(
  theftSignals: readonly TheftSignal[],
  wasteSignals: readonly WasteSignal[],
): TheftSpoilageRow[] {
  const theftRows: TheftSpoilageRow[] = theftSignals.map((signal) => ({
    id: signal.productId,
    label: signal.productName,
    type: "theft" as const,
    severity: signal.severity,
    exposureCost: signal.estimatedExposure,
    detail: `Theft score ${signal.theftScore} · ${signal.variancePercent.toFixed(1)}% variance · ${signal.period}`,
    recommendation: signal.recommendation,
  }));

  const spoilageRows: TheftSpoilageRow[] = wasteSignals
    .filter((signal) => signal.reason === "SPOILAGE" || signal.reason === "THEFT")
    .map((signal) => ({
      id: `waste-${signal.reason}`,
      label: signal.reason === "THEFT" ? "Unrecorded theft (waste)" : "Spoilage",
      type: signal.reason === "THEFT" ? ("theft" as const) : ("spoilage" as const),
      severity: signal.severity,
      exposureCost: signal.totalCost,
      detail: `${signal.eventCount} event(s) · $${signal.totalCost.toFixed(2)}`,
      recommendation: signal.recommendation,
    }));

  return [...theftRows, ...spoilageRows].sort(
    (a, b) => b.exposureCost - a.exposureCost,
  );
}

export function buildWasteTrackingRows(wasteSignals: readonly WasteSignal[]): WasteTrackingRow[] {
  return wasteSignals
    .map((signal) => ({
      reason: signal.reason,
      eventCount: signal.eventCount,
      totalCost: signal.totalCost,
      severity: signal.severity,
      recommendation: signal.recommendation,
    }))
    .sort((a, b) => b.totalCost - a.totalCost);
}

export function aggregateCountVarianceSummary(
  summaries: readonly InventoryCountVarianceSummary[],
): Pick<InventoryVarianceReport, "totalVarianceCost" | "expectedVsActualCount"> {
  const totalVarianceCost = round2(
    summaries.reduce((sum, s) => sum + s.totalVarianceCost, 0),
  );
  const expectedVsActualCount = summaries.reduce((sum, s) => sum + s.linesWithVariance, 0);

  return { totalVarianceCost, expectedVsActualCount };
}

export function buildInventoryVarianceReport(input: {
  expectedVsActual: ExpectedVsActualRow[];
  theftSpoilage: TheftSpoilageRow[];
  wasteTracking: WasteTrackingRow[];
}): InventoryVarianceReport {
  const totalVarianceCost = round2(
    input.expectedVsActual.reduce((sum, row) => sum + row.varianceCost, 0),
  );
  const totalWasteCost = round2(
    input.wasteTracking.reduce((sum, row) => sum + row.totalCost, 0),
  );
  const totalTheftExposure = round2(
    input.theftSpoilage.reduce((sum, row) => sum + row.exposureCost, 0),
  );

  return {
    expectedVsActualCount: input.expectedVsActual.length,
    theftSpoilageCount: input.theftSpoilage.length,
    wasteTrackingCount: input.wasteTracking.length,
    totalVarianceCost,
    totalWasteCost,
    totalTheftExposure,
    expectedVsActual: input.expectedVsActual,
    theftSpoilage: input.theftSpoilage,
    wasteTracking: input.wasteTracking,
  };
}

/** Demo fixture — deterministic variance report without DB. */
export const INVENTORY_VARIANCE_REPORT_DEMO_FIXTURE = {
  expectedVsActual: [
    computeExpectedVsActualRow("ing-chicken", "Chicken breast", "lb", 40, 34, 3.45),
    computeExpectedVsActualRow("ing-tomatoes", "Roma tomatoes", "case", 12, 14, 22),
    computeExpectedVsActualRow("ing-oil", "Olive oil", "gal", 6, 5.2, 18.5),
  ],
  theftSpoilage: [
    {
      id: "prod-burger",
      label: "Signature burger",
      type: "theft" as const,
      severity: "high" as const,
      exposureCost: 142,
      detail: "Theft score 68 · 12.4% variance · Last 30 days",
      recommendation: "Compare theoretical depletion vs receiving — check portion drift.",
    },
    {
      id: "waste-SPOILAGE",
      label: "Spoilage",
      type: "spoilage" as const,
      severity: "normal" as const,
      exposureCost: 86,
      detail: "5 event(s) · $86.00",
      recommendation: "Monitor weekly — track reason codes by shift.",
    },
  ],
  wasteTracking: [
    {
      reason: "PREP_WASTE",
      eventCount: 12,
      totalCost: 124,
      severity: "high" as const,
      recommendation: "Tighten prep pars and add station-level waste logging.",
    },
    {
      reason: "SPOILAGE",
      eventCount: 5,
      totalCost: 86,
      severity: "normal" as const,
      recommendation: "Monitor weekly — track reason codes by shift.",
    },
    {
      reason: "OVERPRODUCTION",
      eventCount: 3,
      totalCost: 45,
      severity: "low" as const,
      recommendation: "Monitor weekly — track reason codes by shift.",
    },
  ],
} as const;
