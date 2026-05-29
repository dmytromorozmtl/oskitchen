import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingProductionCalendarSlice,
  buildProductionCalendarBriefingHref,
  buildProductionCalendarBriefingTile,
  enrichBriefingProductionCalendarPackTiles,
  OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_POLICY_ID,
  productionCalendarActionsForBriefing,
  productionCalendarAlertsForBriefing,
  resolveBriefingOverdueProductionHref,
} from "@/lib/briefing/owner-daily-briefing-production-calendar-era19";
import {
  OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_EXTENDS_POLICIES,
} from "@/lib/briefing/owner-daily-briefing-production-calendar-era19-policy";
import { PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID } from "@/lib/production/production-calendar-drill-clarity-era19-policy";
import { PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID } from "@/lib/production/production-calendar-today-focus-era18-policy";
import { buildOwnerDailyBriefingTiles } from "@/lib/briefing/owner-daily-briefing-era19";

function task(
  over: Partial<{
    id: string;
    title: string;
    planDate: string;
    status: string;
    batchSize: number | null;
  }> = {},
) {
  return {
    id: over.id ?? "task-1",
    title: over.title ?? "Sourdough batch",
    planDate: new Date(`${over.planDate ?? "2026-05-28"}T12:00:00`),
    status: over.status ?? "SCHEDULED",
    batchSize: over.batchSize ?? 12,
  };
}

describe("owner daily briefing production calendar era19", () => {
  it("locks era19 production calendar briefing policy id", () => {
    expect(OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-production-calendar-v1",
    );
    expect(OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_EXTENDS_POLICIES).toEqual([
      PRODUCTION_CALENDAR_TODAY_FOCUS_ERA18_POLICY_ID,
      PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID,
    ]);
  });

  it("summarizes overdue and due-today batches for briefing slice", () => {
    const slice = buildOwnerDailyBriefingProductionCalendarSlice({
      tasks: [
        task({ planDate: "2026-05-26", title: "Late prep" }),
        task({ id: "t2", planDate: "2026-05-28", title: "Today batch", status: "IN_PROGRESS" }),
      ],
      today: new Date("2026-05-28T12:00:00"),
    });
    expect(slice.summary.overdue).toBe(1);
    expect(slice.summary.dueToday).toBe(1);
    expect(slice.hasPlanTasks).toBe(true);
    expect(slice.attentionItems[0]?.id).toBe("overdue-batches");
  });

  it("builds attention tile with drill deep link when batches are overdue", () => {
    const slice = buildOwnerDailyBriefingProductionCalendarSlice({
      tasks: [task({ planDate: "2026-05-26", title: "Late prep" })],
      today: new Date("2026-05-28T12:00:00"),
    });
    const tile = buildProductionCalendarBriefingTile(slice);
    expect(tile.id).toBe("production-calendar-today");
    expect(tile.tone).toBe("attention");
    expect(tile.href).toContain("/dashboard/production/calendar");
    expect(tile.href).toContain("#production-calendar-drill");
  });

  it("feeds production calendar into briefing tiles and risk radar", () => {
    const slice = buildOwnerDailyBriefingProductionCalendarSlice({
      tasks: [task({ planDate: "2026-05-26" })],
      today: new Date("2026-05-28T12:00:00"),
    });
    const tiles = enrichBriefingProductionCalendarPackTiles(
      buildOwnerDailyBriefingTiles({
      kpis: {
        ordersToday: 0,
        ordersDueToday: 0,
        activeOrders: 0,
        blockedOrdersApprox: 0,
        posKitchenQueueToday: 0,
        posTransactionsToday: 0,
        productionWorkOpen: 0,
        packingQueueOpen: 0,
        revenueToday: 0,
        errorIntegrations: 0,
        webhooksNeedingAttention: 0,
        failedExternalOrders: 0,
        openSupportTickets: 0,
        overdueTasks: 0,
      },
      blockers: [],
      readinessOverall: 80,
      integrationOverall: "healthy",
      integrationHeadline: "OK",
      pilotAttentionCount: 0,
      pilotHasUrgent: false,
      ssoEntitlementEnabled: false,
      ssoActive: false,
      ssoConfigured: false,
      lowStockCount: 0,
      ingredientParConfigured: false,
      labor: {
        available: false,
        activeStaff: 0,
        scheduledShiftsToday: 0,
        laborPercent: 0,
        status: null,
      },
      productionCalendar: {
        summary: slice.summary,
        hasPlanTasks: slice.hasPlanTasks,
        calendarHref: slice.calendarHref,
        primaryHref: slice.attentionItems[0]?.href ?? slice.calendarHref,
      },
      }),
      slice,
    );
    const calendarTile = tiles.find((row) => row.id === "production-calendar-today");
    expect(calendarTile).toBeTruthy();
    expect(calendarTile?.href).toContain("#production-calendar-drill");

    const alerts = productionCalendarAlertsForBriefing(slice);
    expect(alerts.some((row) => row.id === "production-calendar-overdue-batches")).toBe(true);

    const actions = productionCalendarActionsForBriefing(slice);
    expect(actions[0]?.id).toBe("production-calendar-overdue");
    expect(actions[0]?.ownerRole).toBe("kitchen");
  });

  it("builds today-week calendar href", () => {
    const href = buildProductionCalendarBriefingHref(new Date("2026-05-28T12:00:00"));
    expect(href).toContain("week=2026-05-25");
    expect(href).toContain("#day-2026-05-28");
  });

  it("resolves overdue production href to operator drill anchor", () => {
    expect(
      resolveBriefingOverdueProductionHref({ overdue: 2 }).includes("#production-calendar-drill"),
    ).toBe(true);
    expect(
      resolveBriefingOverdueProductionHref({
        overdue: 0,
        calendarHref: "/dashboard/production/calendar?week=2026-05-25",
      }),
    ).toBe("/dashboard/production/calendar?week=2026-05-25");
  });
});
