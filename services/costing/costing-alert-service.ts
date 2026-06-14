import { subDays } from "date-fns";

import { mergeCostingSettings } from "@/lib/costing/costing-settings";
import { prisma } from "@/lib/prisma";
import {
  costSnapshotListWhereForOwner,
  costingRunListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { loadAvtReport } from "@/services/costing/avt-report-service";

export type CostingVarianceAlert = {
  productId: string;
  productName: string;
  theoreticalCost: number;
  actualCost: number;
  variancePercent: number;
  thresholdPercent: number;
  period: string;
  source: "cost_snapshot" | "profitability_run" | "food_cost_target";
  /** Elevated when variance exceeds theft detection threshold (default 20%). */
  theftScore?: number;
};

const DEFAULT_THRESHOLD_PERCENT = 10;
const THEFT_VARIANCE_THRESHOLD_PERCENT = 20;

function withTheftScore(alert: CostingVarianceAlert): CostingVarianceAlert {
  const theftScore =
    alert.variancePercent >= THEFT_VARIANCE_THRESHOLD_PERCENT
      ? Math.min(100, Math.round(alert.variancePercent * 2))
      : 0;
  return theftScore > 0 ? { ...alert, theftScore } : alert;
}

function pctVariance(actual: number, baseline: number): number {
  if (baseline === 0) return 0;
  return Math.abs(((actual - baseline) / baseline) * 100);
}

/**
 * Checks actual vs theoretical cost drift over the last 30 days.
 * Returns products where snapshot, profitability, or AVT signals exceed the threshold.
 *
 * @param userId - Tenant owner user id (data scope)
 * @param thresholdPercent - Alert threshold in percent (default 10)
 */
export async function checkCostingVariances(
  userId: string,
  thresholdPercent: number = DEFAULT_THRESHOLD_PERCENT,
): Promise<CostingVarianceAlert[]> {
  const alerts: CostingVarianceAlert[] = [];
  const seen = new Set<string>();

  const push = (alert: CostingVarianceAlert) => {
    const key = `${alert.source}:${alert.productId}`;
    if (seen.has(key)) return;
    seen.add(key);
    alerts.push(withTheftScore(alert));
  };

  const since = subDays(new Date(), 30);

  const snapshotScope = await costSnapshotListWhereForOwner(userId);
  const snapshots = await prisma.costSnapshot.findMany({
    where: { AND: [snapshotScope, { createdAt: { gte: since } }] },
    include: { product: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const byProduct = new Map<string, typeof snapshots>();
  for (const s of snapshots) {
    const list = byProduct.get(s.productId) ?? [];
    list.push(s);
    byProduct.set(s.productId, list);
  }

  for (const [productId, snaps] of byProduct) {
    if (snaps.length < 2) continue;
    const latest = snaps[0]!;
    const previous = snaps[1]!;
    const latestCost = Number(latest.totalCost);
    const previousCost = Number(previous.totalCost);
    const variancePercent = pctVariance(latestCost, previousCost);
    if (variancePercent < thresholdPercent) continue;
    push({
      productId,
      productName: latest.product.title,
      theoreticalCost: previousCost,
      actualCost: latestCost,
      variancePercent: Math.round(variancePercent * 100) / 100,
      thresholdPercent,
      period: `${previous.createdAt.toISOString().slice(0, 10)} → ${latest.createdAt.toISOString().slice(0, 10)}`,
      source: "cost_snapshot",
    });
  }

  const costingScope = await costingRunListWhereForOwner(userId);
  const latestRun = await prisma.costingRun.findFirst({
    where: { AND: [costingScope, { status: "COMPLETED" }] },
    orderBy: { createdAt: "desc" },
  });

  if (latestRun) {
    const lines = await prisma.profitabilityLine.findMany({
      where: { runId: latestRun.id, warningLevel: { not: "NONE" } },
      orderBy: { grossMarginPercent: "asc" },
      take: 50,
    });
    for (const line of lines) {
      if (!line.productId) continue;
      const theoreticalCost = Number(line.totalCost);
      const actualCost = Number(line.salePrice);
      const variancePercent = pctVariance(theoreticalCost, actualCost || 1);
      push({
        productId: line.productId,
        productName: line.itemTitle,
        theoreticalCost,
        actualCost,
        variancePercent: Math.round(variancePercent * 100) / 100,
        thresholdPercent,
        period: `Costing run ${latestRun.createdAt.toISOString().slice(0, 10)}`,
        source: "profitability_run",
      });
    }
  }

  const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId } });
  const settings = mergeCostingSettings(kitchen?.costingSettingsJson ?? null);
  const foodTarget = settings.foodCostTargetPercent;

  if (foodTarget != null && foodTarget > 0) {
    const avt = await loadAvtReport(userId, { from: since, to: new Date() });
    for (const row of avt.rows) {
      if (!row.theoreticalIngredientCostPerUnit || row.soldQuantity <= 0) continue;
      const foodCostPct =
        (row.theoreticalIngredientCostPerUnit / Math.max(row.theoreticalIngredientCostPerUnit * 2.5, 0.01)) * 100;
      if (foodCostPct < foodTarget + thresholdPercent) continue;
      push({
        productId: row.productId,
        productName: row.title,
        theoreticalCost: row.theoreticalIngredientCostPerUnit,
        actualCost: row.estimatedTheoreticalUsage ?? row.theoreticalIngredientCostPerUnit * row.soldQuantity,
        variancePercent: Math.round((foodCostPct - foodTarget) * 100) / 100,
        thresholdPercent: foodTarget,
        period: avt.workspaceSummary.confidence,
        source: "food_cost_target",
      });
    }
  }

  return alerts.sort((a, b) => b.variancePercent - a.variancePercent);
}

export type CostingAlertsSummary = {
  count: number;
  hasAlerts: boolean;
  topAlerts: CostingVarianceAlert[];
  theftAlerts: CostingVarianceAlert[];
};

export type TheftDetectionRow = CostingVarianceAlert & { theftScore: number };

/** Resolve workspace → owner userId, then run variance check (for workspace-scoped callers). */
export async function checkCostingVariancesForWorkspace(
  workspaceId: string,
  thresholdPercent?: number,
): Promise<CostingVarianceAlert[]> {
  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  if (!ws?.ownerUserId) return [];
  return checkCostingVariances(ws.ownerUserId, thresholdPercent);
}

export async function summarizeCostingVarianceAlerts(
  userId: string,
  thresholdPercent?: number,
): Promise<CostingAlertsSummary> {
  const all = await checkCostingVariances(userId, thresholdPercent);
  const theftAlerts = all.filter((a) => (a.theftScore ?? 0) > 0);
  return {
    count: all.length,
    hasAlerts: all.length > 0,
    topAlerts: all.slice(0, 5),
    theftAlerts: theftAlerts.slice(0, 10),
  };
}

/** Dashboard theft detection — variance ≥ 20% with computed theftScore. */
export async function listTheftDetectionAlerts(
  userId: string,
): Promise<TheftDetectionRow[]> {
  const all = await checkCostingVariances(userId, THEFT_VARIANCE_THRESHOLD_PERCENT);
  return all
    .filter((a): a is TheftDetectionRow => (a.theftScore ?? 0) > 0)
    .sort((a, b) => (b.theftScore ?? 0) - (a.theftScore ?? 0));
}

const REALTIME_VARIANCE_THRESHOLD = 5;

/** Alerts exceeding the daily real-time threshold (default 5%). */
export async function getRealtimeVarianceAlerts(userId: string): Promise<CostingVarianceAlert[]> {
  const all = await checkCostingVariances(userId, REALTIME_VARIANCE_THRESHOLD);
  return all.filter((a) => a.variancePercent >= REALTIME_VARIANCE_THRESHOLD);
}
