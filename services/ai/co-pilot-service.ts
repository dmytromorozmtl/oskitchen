import { createHash } from "crypto";
import { addDays, format, startOfDay } from "date-fns";

import type { CopilotActionType } from "@/lib/ai/copilot-types";
import type {
  CoPilotCategory,
  CoPilotDashboard,
  CoPilotDraftView,
  CoPilotRecommendation,
} from "@/lib/ai/co-pilot-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { generateFoodCostAlertsForUser } from "@/services/ai/food-cost-alerts";
import {
  createCopilotActionDraft,
  executeApprovedAction,
  listActionDrafts,
  recordCopilotAudit,
  setActionDraftStatus,
} from "@/services/ai/copilot-service";
import { loadDemandCommandCenterPayload } from "@/services/ingredient-demand/demand-service";

const CO_PILOT_SOURCE = "restaurant-co-pilot";

type Scope = { userId: string; email: string | null; workspaceId?: string | null };

function recommendationId(category: CoPilotCategory, key: string): string {
  return createHash("sha256").update(`${category}:${key}`).digest("hex").slice(0, 16);
}

function withSourcePayload(
  category: CoPilotCategory,
  recommendationId: string,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...payload,
    coPilotSource: CO_PILOT_SOURCE,
    coPilotCategory: category,
    coPilotRecommendationId: recommendationId,
  };
}

async function scanProcurementRecommendations(userId: string): Promise<CoPilotRecommendation[]> {
  const items: CoPilotRecommendation[] = [];
  try {
    const demand = await loadDemandCommandCenterPayload(userId);
    const shortages = demand.rows
      .filter((r) => r.shortage > 0 && !r.conversionRequired)
      .sort((a, b) => b.shortage - a.shortage)
      .slice(0, 5);

    for (const row of shortages) {
      const key = `ingredient-${row.ingredientId}`;
      items.push({
        id: recommendationId("procurement", key),
        category: "procurement",
        severity: row.shortage > row.stock ? "critical" : "warning",
        title: `Reorder ${row.name}`,
        summary: `Projected shortage of ${row.shortage.toFixed(1)} ${row.unit} (on hand ${row.stock.toFixed(1)}).`,
        impactLabel: row.estimatedCost != null ? `~$${row.estimatedCost.toFixed(0)} purchase` : "Stockout risk",
        suggestedAction: "Create a purchasing reminder and issue a PO before the next service.",
        actionType: "create_purchasing_reminder",
        payload: {
          ingredientName: row.name,
          quantity: `${Math.ceil(row.shortage)} ${row.unit}`,
          note: `Co-Pilot: shortage detected in demand run (${demand.ordersConsidered} orders).`,
        },
        actionRoute: "/dashboard/inventory/purchasing-ai",
      });
    }

    if (demand.totals.purchaseNeededLines > shortages.length && shortages.length === 0) {
      items.push({
        id: recommendationId("procurement", "demand-run"),
        category: "procurement",
        severity: "info",
        title: "Run ingredient demand review",
        summary: `${demand.totals.purchaseNeededLines} line(s) flagged for purchase in the latest demand window.`,
        impactLabel: "Purchasing efficiency",
        suggestedAction: "Re-run demand and confirm vendor lead times.",
        actionType: "suggest_ingredient_demand_run",
        payload: { reason: "Co-Pilot detected purchase-needed lines without active shortages in top rows." },
        actionRoute: "/dashboard/inventory/purchasing-ai",
      });
    }
  } catch {
    /* demand module optional */
  }
  return items;
}

async function scanSchedulingRecommendations(userId: string): Promise<CoPilotRecommendation[]> {
  const items: CoPilotRecommendation[] = [];
  const today = startOfDay(new Date());
  const horizon = addDays(today, 7);

  let shifts: { shiftDate: Date; role: string }[] = [];
  try {
    shifts = await prisma.staffShift.findMany({
    where: {
      userId,
      shiftDate: { gte: today, lte: horizon },
      status: { in: ["SCHEDULED", "CHECKED_IN"] },
    },
      select: { shiftDate: true, role: true },
    });
  } catch {
    return items;
  }

  const byDay = new Map<string, number>();
  for (const s of shifts) {
    const key = format(s.shiftDate, "yyyy-MM-dd");
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  for (let i = 0; i < 7; i += 1) {
    const day = addDays(today, i);
    const key = format(day, "yyyy-MM-dd");
    const count = byDay.get(key) ?? 0;
    const dow = day.getDay();
    const isWeekend = dow === 0 || dow === 6;
    if (count === 0 && (isWeekend || i < 3)) {
      items.push({
        id: recommendationId("scheduling", `gap-${key}`),
        category: "scheduling",
        severity: isWeekend ? "warning" : "info",
        title: `No shifts on ${format(day, "EEE MMM d")}`,
        summary: isWeekend
          ? "Weekend service typically needs kitchen + FOH coverage — schedule is empty."
          : "Upcoming day has zero scheduled shifts.",
        impactLabel: "Labor coverage",
        suggestedAction: "Add shifts in AI Scheduling or approve a draft task for the manager.",
        actionType: "create_task",
        payload: {
          title: `Staff schedule: ${format(day, "MMM d")}`,
          description: "Co-Pilot flagged a coverage gap. Review roles and publish shifts.",
          dueAt: addDays(day, -1).toISOString(),
        },
        actionRoute: "/dashboard/staff/ai-scheduling",
      });
    }
  }

  const kitchenShifts = shifts.filter((s) =>
    ["LINE_COOK", "PREP_COOK", "KITCHEN_LEAD"].includes(s.role),
  );
  if (shifts.length > 0 && kitchenShifts.length < Math.ceil(shifts.length * 0.3)) {
    items.push({
      id: recommendationId("scheduling", "kitchen-ratio"),
      category: "scheduling",
      severity: "warning",
      title: "Kitchen labor ratio low",
      summary: `Only ${kitchenShifts.length} of ${shifts.length} shifts this week are kitchen roles.`,
      impactLabel: "Throughput risk",
      suggestedAction: "Rebalance next week's schedule toward line/prep coverage.",
      actionType: "create_task",
      payload: {
        title: "Rebalance kitchen labor",
        description: "Co-Pilot: kitchen role share below 30% for the next 7 days.",
        dueAt: addDays(today, 2).toISOString(),
      },
      actionRoute: "/dashboard/staff/ai-scheduling",
    });
  }

  return items.slice(0, 6);
}

async function scanPricingRecommendations(userId: string): Promise<CoPilotRecommendation[]> {
  const items: CoPilotRecommendation[] = [];
  try {
    const alerts = await generateFoodCostAlertsForUser(userId);
    for (const alert of alerts.slice(0, 5)) {
      const category: CoPilotCategory = "pricing";
      const key = alert.productId ?? alert.ingredientId ?? alert.id;
      items.push({
        id: recommendationId(category, key),
        category,
        severity: alert.severity === "critical" ? "critical" : alert.severity === "warning" ? "warning" : "info",
        title: alert.title,
        summary: alert.description,
        impactLabel: alert.impact > 0 ? `~$${Math.round(alert.impact)}/wk` : "Margin",
        suggestedAction: alert.suggestedAction,
        actionType: "suggest_menu_adjustment",
        payload: {
          productId: alert.productId,
          suggestion: alert.suggestedAction,
          alertType: alert.type,
        },
        actionRoute: "/dashboard/analytics/food-cost",
      });
    }
  } catch {
    /* food cost optional */
  }

  if (items.length === 0) {
    items.push({
      id: recommendationId("pricing", "review-menu"),
      category: "pricing",
      severity: "info",
      title: "Review menu margins weekly",
      summary: "No critical margin alerts right now — confirm top sellers still meet your food-cost target.",
      impactLabel: "Preventive",
      suggestedAction: "Export the food cost report and spot-check hero items.",
      actionType: "suggest_report_export",
      payload: {
        reportKey: "food_cost_summary",
        reason: "Co-Pilot weekly pricing hygiene check.",
      },
      actionRoute: "/dashboard/analytics/food-cost",
    });
  }

  return items;
}

export async function scanRestaurantCoPilotRecommendations(userId: string): Promise<CoPilotRecommendation[]> {
  const [procurement, scheduling, pricing] = await Promise.all([
    scanProcurementRecommendations(userId),
    scanSchedulingRecommendations(userId),
    scanPricingRecommendations(userId),
  ]);
  return [...procurement, ...scheduling, ...pricing];
}

function parseDraftCategory(payload: unknown): CoPilotCategory | null {
  if (!payload || typeof payload !== "object") return null;
  const cat = (payload as Record<string, unknown>).coPilotCategory;
  if (cat === "procurement" || cat === "scheduling" || cat === "pricing") return cat;
  return null;
}

function isCoPilotDraft(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  return (payload as Record<string, unknown>).coPilotSource === CO_PILOT_SOURCE;
}

function mapDraftRow(d: {
  id: string;
  title: string;
  description: string;
  status: string;
  actionType: string;
  payloadJson: unknown;
  createdAt: Date;
}): CoPilotDraftView {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    status: d.status,
    actionType: d.actionType,
    category: parseDraftCategory(d.payloadJson),
    createdAt: d.createdAt.toISOString(),
  };
}

export async function getRestaurantCoPilotDashboard(userId: string): Promise<CoPilotDashboard> {
  const recommendations = await scanRestaurantCoPilotRecommendations(userId);
  const drafts = await listActionDrafts({ userId, email: null });
  const coPilotDrafts = drafts.filter((d) => isCoPilotDraft(d.payloadJson));

  const pendingDrafts = coPilotDrafts
    .filter((d) => d.status === "NEEDS_APPROVAL" || d.status === "DRAFT")
    .map(mapDraftRow);
  const approvedDrafts = coPilotDrafts.filter((d) => d.status === "APPROVED").map(mapDraftRow);

  return {
    recommendations,
    pendingDrafts,
    approvedDrafts,
    counts: {
      procurement: recommendations.filter((r) => r.category === "procurement").length,
      scheduling: recommendations.filter((r) => r.category === "scheduling").length,
      pricing: recommendations.filter((r) => r.category === "pricing").length,
      needsApproval: pendingDrafts.length,
    },
    scannedAt: new Date().toISOString(),
  };
}

export async function promoteCoPilotRecommendation(
  scope: Scope,
  recommendation: CoPilotRecommendation,
): Promise<{ draftId: string }> {
  const workspaceId =
    scope.workspaceId?.trim() || (await resolveOwnerWorkspaceId(scope.userId).catch(() => null));

  const created = await createCopilotActionDraft(
    { ...scope, workspaceId },
    {
      actionType: recommendation.actionType as CopilotActionType,
      title: recommendation.title,
      description: `${recommendation.summary}\n\nSuggested: ${recommendation.suggestedAction}`,
      payload: withSourcePayload(recommendation.category, recommendation.id, recommendation.payload),
    },
    null,
  );

  await recordCopilotAudit(scope, "co_pilot_promoted", {
    recommendationId: recommendation.id,
    category: recommendation.category,
    draftId: created.id,
  });

  return { draftId: created.id };
}

export async function approveCoPilotDraft(scope: Scope, draftId: string): Promise<void> {
  await setActionDraftStatus(scope, draftId, "APPROVED");
  await recordCopilotAudit(scope, "co_pilot_approved", { draftId });
}

export async function rejectCoPilotDraft(
  scope: Scope,
  draftId: string,
  reason?: string,
): Promise<void> {
  await setActionDraftStatus(scope, draftId, "REJECTED", reason);
  await recordCopilotAudit(scope, "co_pilot_rejected", { draftId, reason });
}

export async function executeCoPilotDraft(
  scope: Scope,
  draftId: string,
): Promise<{ ok: boolean; summary?: string; reason?: string }> {
  const result = await executeApprovedAction(scope, draftId);
  if (result.ok) {
    await recordCopilotAudit(scope, "co_pilot_executed", { draftId, summary: result.summary });
  }
  return result;
}
