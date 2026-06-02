import { defaultFilters } from "@/lib/analytics/filters";
import {
  buildInventoryAlerts,
  buildLaborInsights,
  buildMenuInsights,
  buildProfitInsights,
  buildStaffInsights,
  buildWeeklyForecast,
  computeOverallConfidence,
  type StaffPosMetric,
} from "@/lib/ai/restaurant-brain-builders";
import type { DailyBriefing } from "@/lib/ai/restaurant-brain-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { timeEntryListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";
import {
  costingRunListWhereForOwner,
  posTransactionListWhereForOwner,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { loadCostingOverviewData } from "@/services/costing/costing-service";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";
import { loadDemandCommandCenterPayload } from "@/services/ingredient-demand/demand-service";
import { loadAiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-load";
import { buildOvertimePredictions } from "@/services/labor/labor-realtime-service";
import { weekStartMonday } from "@/services/labor/schedule-service";

export type { DailyBriefing } from "@/lib/ai/restaurant-brain-types";

/**
 * AI Restaurant Brain — daily briefing engine.
 * Composes deterministic operational data into six insight categories.
 * All outputs are labeled AI-assisted with explicit confidence scores.
 * No PII in aggregates; uses existing KitchenOS inventory, labor, costing, and executive modules.
 */
export async function generateDailyBriefing(workspaceId: string): Promise<DailyBriefing> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const filters = defaultFilters();
  const windowDays = Math.max(
    1,
    Math.ceil((filters.to.getTime() - filters.from.getTime()) / 86_400_000),
  );

  const [
    demand,
    schedulePlan,
    costing,
    executive,
    previousMargins,
    posMetrics,
    laborContext,
  ] = await Promise.all([
    loadDemandCommandCenterPayload(ownerUserId),
    loadAiSchedulePlan(ownerUserId).catch(() => null),
    loadCostingOverviewData(ownerUserId).catch(() => null),
    loadExecutiveOverview({ userId: ownerUserId }, filters),
    loadPreviousCostingMargins(ownerUserId),
    loadStaffPosMetrics(ownerUserId, filters.from, filters.to),
    loadLaborContext(ownerUserId),
  ]);

  const avgHourlyRate = schedulePlan?.avgHourlyRate ?? laborContext.hourlyRate;

  const inventoryAlerts = buildInventoryAlerts(demand.rows, windowDays);
  const laborInsights = buildLaborInsights(
    schedulePlan,
    laborContext.overtimePredictions,
    avgHourlyRate,
  );
  const menuInsights = buildMenuInsights(
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
  );
  const staffInsights = buildStaffInsights(
    posMetrics,
    executive.packingAccuracy,
    executive.orderCount,
  );
  const profitInsights = buildProfitInsights({
    netRevenue: executive.netRevenue,
    previousNetRevenue: executive.previousNetRevenue,
    revenueTrend: executive.revenueTrend,
    marginMedian: executive.marginMedian,
    marginAtRiskItems: executive.marginAtRiskItems,
    packingAccuracy: executive.packingAccuracy,
    avgFoodCostPct: costing?.kpis.avgGrossMarginPct != null
      ? 100 - costing.kpis.avgGrossMarginPct
      : null,
    laborPercent: laborContext.laborPercent,
    targetLaborPercent: schedulePlan?.targetLaborPct ?? 28,
  });
  const weeklyForecast = buildWeeklyForecast({
    schedulePlan,
    recentDailyRevenue: executive.dailyRevenue,
    recentOrderCount: executive.orderCount,
    recentDayCount: windowDays,
  });

  const overallConfidence = computeOverallConfidence({
    inventory: inventoryAlerts,
    labor: laborInsights,
    menu: menuInsights,
    staff: staffInsights,
    profit: profitInsights,
    forecastConfidence: weeklyForecast.confidence,
  });

  return {
    timestamp: new Date(),
    workspaceId,
    aiAssisted: true,
    overallConfidence,
    inventoryAlerts,
    laborInsights,
    menuInsights,
    staffInsights,
    profitInsights,
    weeklyForecast,
  };
}

/** Convenience entry when callers already have the owner user id. */
export async function generateDailyBriefingForUser(userId: string): Promise<DailyBriefing> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) {
    throw new Error(`No workspace for user: ${userId}`);
  }
  return generateDailyBriefing(workspaceId);
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

async function loadStaffPosMetrics(
  userId: string,
  from: Date,
  to: Date,
): Promise<StaffPosMetric[]> {
  const scope = await posTransactionListWhereForOwner(userId);
  const rows = await prisma.pOSTransaction.groupBy({
    by: ["staffId"],
    where: {
      AND: [
        scope,
        { createdAt: { gte: from, lte: to } },
        { status: "COMPLETED" },
        { staffId: { not: null } },
      ],
    },
    _count: { _all: true },
    _avg: { total: true, tip: true, subtotal: true },
  });

  if (rows.length === 0) return [];

  const staffIds = rows.map((r) => r.staffId).filter((id): id is string => id != null);
  const staff = await prisma.staffMember.findMany({
    where: { id: { in: staffIds } },
    select: { id: true, name: true },
  });
  const nameById = new Map(staff.map((s) => [s.id, s.name]));

  return rows
    .filter((r) => r.staffId != null)
    .map((r) => {
      const subtotal = Number(r._avg.subtotal ?? 0);
      const tip = Number(r._avg.tip ?? 0);
      return {
        staffId: r.staffId!,
        staffName: nameById.get(r.staffId!) ?? "Staff",
        orderCount: r._count._all,
        avgTicket: Number(r._avg.total ?? 0),
        tipRate: subtotal > 0 ? tip / subtotal : 0,
      };
    })
    .sort((a, b) => b.orderCount - a.orderCount);
}

async function loadLaborContext(userId: string): Promise<{
  overtimePredictions: ReturnType<typeof buildOvertimePredictions>;
  laborPercent: number | null;
  hourlyRate: number;
}> {
  const snapshot = await getLaborRealtimeData(userId);
  const now = new Date();
  const weekStart = weekStartMonday(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [shiftScope, timeScope] = await Promise.all([
    staffShiftListWhereForOwner(userId),
    timeEntryListWhereForOwner(userId),
  ]);

  const [shifts, timeEntries] = await Promise.all([
    prisma.staffShift.findMany({
      where: { AND: [shiftScope, { shiftDate: { gte: weekStart, lt: weekEnd } }] },
      include: { staffMember: { select: { name: true } } },
      take: 500,
    }),
    prisma.timeEntry.findMany({
      where: {
        AND: [timeScope, { clockIn: { gte: weekStart, lt: weekEnd } }],
      },
      include: { staffMember: { select: { name: true } } },
      take: 500,
    }),
  ]);

  const overtimePredictions = buildOvertimePredictions({
    shifts: shifts.map((s) => ({
      staffMemberId: s.staffMemberId,
      staffName: s.staffMember.name,
      shiftDate: s.shiftDate,
      startTime: s.startTime,
      endTime: s.endTime,
      laborCost: Number(s.laborCost),
    })),
    timeEntries: timeEntries.map((e) => ({
      staffId: e.staffId,
      staffName: e.staffMember.name,
      clockIn: e.clockIn,
      clockOut: e.clockOut,
      totalHours: e.totalHours != null ? Number(e.totalHours) : null,
      status: e.status,
    })),
    now,
  });

  return {
    overtimePredictions,
    laborPercent: snapshot.laborPercent,
    hourlyRate: snapshot.hourlyRate,
  };
}
