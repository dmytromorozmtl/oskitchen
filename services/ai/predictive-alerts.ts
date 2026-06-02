import { defaultFilters } from "@/lib/analytics/filters";
import {
  mergePredictiveAlerts,
  predictDemandSurges,
  predictInventoryShortages,
  predictLaborGaps,
  predictMarginDeclines,
} from "@/lib/ai/predictive-alerts-builders";
import type { PredictiveAlert } from "@/lib/ai/predictive-alerts-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { costingRunListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadCostingOverviewData } from "@/services/costing/costing-service";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";
import { loadDemandCommandCenterPayload } from "@/services/ingredient-demand/demand-service";
import { loadAiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-load";

export type { PredictiveAlert, PredictiveAlertType } from "@/lib/ai/predictive-alerts-types";

/**
 * Predictive alerts — proactively warn about inventory, labor, margin, and demand issues.
 * Deterministic AI-assisted predictions with dollar impact and confidence scores.
 */
export async function generatePredictiveAlerts(workspaceId: string): Promise<PredictiveAlert[]> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const filters = defaultFilters();
  const windowDays = Math.max(
    1,
    Math.ceil((filters.to.getTime() - filters.from.getTime()) / 86_400_000),
  );

  const [demand, schedulePlan, costing, executive, previousMargins, laborRealtime] =
    await Promise.all([
      loadDemandCommandCenterPayload(ownerUserId),
      loadAiSchedulePlan(ownerUserId).catch(() => null),
      loadCostingOverviewData(ownerUserId).catch(() => null),
      loadExecutiveOverview({ userId: ownerUserId }, filters),
      loadPreviousCostingMargins(ownerUserId),
      getLaborRealtimeData(ownerUserId).catch(() => null),
    ]);

  const avgHourlyRate = schedulePlan?.avgHourlyRate ?? laborRealtime?.hourlyRate ?? 18;

  const alerts: PredictiveAlert[] = [];
  alerts.push(...predictInventoryShortages(demand.rows, windowDays));
  alerts.push(...predictLaborGaps(schedulePlan, avgHourlyRate));
  alerts.push(
    ...predictMarginDeclines(
      (costing?.latestLines ?? []).map((l) => ({
        productId: l.productId,
        itemTitle: l.itemTitle,
        grossMarginPercent: l.grossMarginPercent,
        foodCostPercent: l.foodCostPercent,
        warningLevel: l.warningLevel,
        salePrice: l.salePrice,
        suggestedPrice: l.suggestedPrice,
      })),
      previousMargins,
      costing?.targetMarginPercent ?? 30,
    ),
  );
  alerts.push(
    ...predictDemandSurges(schedulePlan, executive.orderTrend, executive.netRevenue),
  );

  return mergePredictiveAlerts(alerts);
}

/** Convenience entry when callers already have the owner user id. */
export async function generatePredictiveAlertsForUser(userId: string): Promise<PredictiveAlert[]> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }
  return generatePredictiveAlerts(workspaceId);
}

async function loadPreviousCostingMargins(userId: string): Promise<Map<string, number>> {
  const scope = await costingRunListWhereForOwner(userId);
  const runs = await prisma.costingRun.findMany({
    where: { AND: [scope, { status: "COMPLETED" }] },
    orderBy: { createdAt: "desc" },
    take: 2,
    select: { id: true },
  });
  const previousRunId = runs[1]?.id;
  if (!previousRunId) return new Map();

  const lines = await prisma.profitabilityLine.findMany({
    where: { runId: previousRunId },
    select: { productId: true, grossMarginPercent: true },
    take: 800,
  });

  return new Map(lines.map((l) => [l.productId, Number(l.grossMarginPercent)]));
}
