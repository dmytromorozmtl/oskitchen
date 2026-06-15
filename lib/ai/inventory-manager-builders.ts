import {
  AI_INVENTORY_MANAGER_POLICY_ID,
  AI_INVENTORY_MANAGER_WINDOW_DAYS,
  AI_INVENTORY_SHRINKAGE_CRITICAL_COST,
  AI_INVENTORY_SHRINKAGE_HIGH_COST,
  AI_INVENTORY_THEFT_CRITICAL_SCORE,
  AI_INVENTORY_THEFT_HIGH_SCORE,
  AI_INVENTORY_WASTE_CRITICAL_COST,
  AI_INVENTORY_WASTE_HIGH_COST,
} from "@/lib/ai/inventory-manager-policy";
import type {
  InventoryManagerDailyBrief,
  InventoryManagerSnapshot,
  InventorySignalSeverity,
  ShrinkageSignal,
  TheftSignal,
  WasteSignal,
} from "@/lib/ai/inventory-manager-types";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function wasteSeverity(totalCost: number, reason: string): InventorySignalSeverity {
  if (reason === "THEFT" || totalCost >= AI_INVENTORY_WASTE_CRITICAL_COST) return "critical";
  if (totalCost >= AI_INVENTORY_WASTE_HIGH_COST) return "high";
  if (totalCost >= 50) return "normal";
  return "low";
}

function theftSeverity(theftScore: number): InventorySignalSeverity {
  if (theftScore >= AI_INVENTORY_THEFT_CRITICAL_SCORE) return "critical";
  if (theftScore >= AI_INVENTORY_THEFT_HIGH_SCORE) return "high";
  if (theftScore >= 20) return "normal";
  return "low";
}

function shrinkageSeverity(shrinkCost: number): InventorySignalSeverity {
  const magnitude = Math.abs(shrinkCost);
  if (magnitude >= AI_INVENTORY_SHRINKAGE_CRITICAL_COST) return "critical";
  if (magnitude >= AI_INVENTORY_SHRINKAGE_HIGH_COST) return "high";
  if (magnitude >= 50) return "normal";
  return "low";
}

export function buildWasteSignals(
  byReason: Record<string, { count: number; totalCost: number }>,
): WasteSignal[] {
  return Object.entries(byReason)
    .map(([reason, row]) => {
      const totalCost = round2(row.totalCost);
      const severity = wasteSeverity(totalCost, reason);
      return {
        reason,
        eventCount: row.count,
        totalCost,
        severity,
        recommendation:
          reason === "THEFT"
            ? "Investigate unrecorded depletion — reconcile POS impacts and count variances."
            : severity === "critical" || severity === "high"
              ? "Tighten prep pars and add station-level waste logging."
              : "Monitor weekly — track reason codes by shift.",
      };
    })
    .sort((left, right) => right.totalCost - left.totalCost);
}

export function buildTheftSignals(
  alerts: Array<{
    productId: string;
    productName: string;
    theftScore: number;
    variancePercent: number;
    theoreticalCost: number;
    actualCost: number;
    period: string;
  }>,
): TheftSignal[] {
  return alerts
    .map((alert) => {
      const estimatedExposure = round2(Math.abs(alert.actualCost - alert.theoreticalCost));
      const severity = theftSeverity(alert.theftScore);
      return {
        productId: alert.productId,
        productName: alert.productName,
        theftScore: alert.theftScore,
        variancePercent: alert.variancePercent,
        estimatedExposure,
        period: alert.period,
        severity,
        recommendation:
          severity === "critical"
            ? "Audit recipe yields, portion sizes, and unlogged waste for this SKU immediately."
            : "Compare theoretical depletion vs receiving — check for portion drift or unrecorded waste.",
      };
    })
    .sort((left, right) => right.theftScore - left.theftScore);
}

export function buildShrinkageSignals(
  counts: Array<{
    id: string;
    createdAt: Date;
    varianceSummary: { shrinkCost: number; linesWithVariance: number };
  }>,
): ShrinkageSignal[] {
  return counts
    .filter((count) => count.varianceSummary.shrinkCost < 0)
    .map((count) => {
      const shrinkCost = round2(count.varianceSummary.shrinkCost);
      const severity = shrinkageSeverity(shrinkCost);
      return {
        countId: count.id,
        countDateIso: count.createdAt.toISOString(),
        shrinkCost,
        linesWithVariance: count.varianceSummary.linesWithVariance,
        severity,
        recommendation:
          severity === "critical"
            ? "Recount high-variance lines and review receiving vs POS depletion."
            : "Spot-check top variance SKUs and tighten receiving reconciliation.",
      };
    })
    .sort((left, right) => left.shrinkCost - right.shrinkCost);
}

export function buildInventoryManagerDailyBrief(input: {
  wasteSignals: WasteSignal[];
  theftSignals: TheftSignal[];
  shrinkageSignals: ShrinkageSignal[];
  totalWasteCost: number;
  totalTheftExposure: number;
  totalShrinkageCost: number;
  analyzedAt: Date;
}): InventoryManagerDailyBrief {
  const theftAlertCount = input.theftSignals.length;
  const shrinkageCost30d = round2(Math.abs(input.totalShrinkageCost));
  const criticalCount =
    input.wasteSignals.filter((row) => row.severity === "critical").length +
    input.theftSignals.filter((row) => row.severity === "critical").length +
    input.shrinkageSignals.filter((row) => row.severity === "critical").length;

  const headline =
    criticalCount > 0
      ? `${criticalCount} critical inventory signal${criticalCount === 1 ? "" : "s"} — $${input.totalWasteCost.toFixed(0)} waste, $${shrinkageCost30d.toFixed(0)} shrinkage`
      : input.wasteSignals.length + theftAlertCount + input.shrinkageSignals.length > 0
        ? `Inventory watch — $${input.totalWasteCost.toFixed(0)} waste logged in 30 days`
        : "Inventory clear — no waste, theft, or shrinkage alerts in the last 30 days";

  const executiveSummary =
    criticalCount > 0
      ? `Waste, theft, and count shrinkage scans flagged ${criticalCount} critical item${criticalCount === 1 ? "" : "s"} requiring manager review.`
      : `30-day waste $${input.totalWasteCost.toFixed(0)}, ${theftAlertCount} theft signal${theftAlertCount === 1 ? "" : "s"}, shrinkage $${shrinkageCost30d.toFixed(0)} from completed counts.`;

  const bullets = [
    input.totalWasteCost > 0
      ? `Waste: $${input.totalWasteCost.toFixed(0)} across ${input.wasteSignals.reduce((sum, row) => sum + row.eventCount, 0)} events`
      : null,
    theftAlertCount > 0
      ? `Theft: ${theftAlertCount} product${theftAlertCount === 1 ? "" : "s"} with elevated variance scores`
      : null,
    shrinkageCost30d > 0
      ? `Shrinkage: $${shrinkageCost30d.toFixed(0)} from ${input.shrinkageSignals.length} count${input.shrinkageSignals.length === 1 ? "" : "s"}`
      : null,
    input.theftSignals[0]
      ? `Top theft risk: ${input.theftSignals[0].productName} (score ${input.theftSignals[0].theftScore})`
      : null,
    input.wasteSignals[0]
      ? `Top waste driver: ${input.wasteSignals[0].reason} ($${input.wasteSignals[0].totalCost.toFixed(0)})`
      : null,
  ].filter((line): line is string => line != null);

  return {
    generatedAtIso: input.analyzedAt.toISOString(),
    headline,
    executiveSummary,
    bullets,
    wasteCost30d: input.totalWasteCost,
    theftAlertCount,
    shrinkageCost30d,
  };
}

export function buildInventoryManagerSnapshot(input: {
  workspaceId: string;
  wasteSignals: WasteSignal[];
  theftSignals: TheftSignal[];
  shrinkageSignals: ShrinkageSignal[];
  analyzedAt?: Date;
}): InventoryManagerSnapshot {
  const analyzedAt = input.analyzedAt ?? new Date();
  const totalWasteCost = round2(input.wasteSignals.reduce((sum, row) => sum + row.totalCost, 0));
  const totalTheftExposure = round2(
    input.theftSignals.reduce((sum, row) => sum + row.estimatedExposure, 0),
  );
  const totalShrinkageCost = round2(
    input.shrinkageSignals.reduce((sum, row) => sum + row.shrinkCost, 0),
  );
  const alertCount =
    input.wasteSignals.filter((row) => row.severity !== "low").length +
    input.theftSignals.length +
    input.shrinkageSignals.filter((row) => row.severity !== "low").length;

  const hasData =
    totalWasteCost > 0 || input.theftSignals.length > 0 || input.shrinkageSignals.length > 0;
  const confidence = hasData ? round2(Math.min(0.9, 0.55 + alertCount * 0.04)) : 0.45;

  const dailyBrief = buildInventoryManagerDailyBrief({
    wasteSignals: input.wasteSignals,
    theftSignals: input.theftSignals,
    shrinkageSignals: input.shrinkageSignals,
    totalWasteCost,
    totalTheftExposure,
    totalShrinkageCost,
    analyzedAt,
  });

  return {
    policyId: AI_INVENTORY_MANAGER_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: analyzedAt.toISOString(),
    windowDays: AI_INVENTORY_MANAGER_WINDOW_DAYS,
    wasteSignals: input.wasteSignals,
    theftSignals: input.theftSignals,
    shrinkageSignals: input.shrinkageSignals,
    dailyBrief,
    summary: {
      totalWasteCost,
      totalTheftExposure,
      totalShrinkageCost,
      alertCount,
      confidence,
    },
    aiAssisted: true,
  };
}
