import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingTiles } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildOwnerDailyBriefingOwnerKdsActions,
  enrichBriefingOwnerPackTiles,
  mergeBriefingOwnerKdsTopActions,
  OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_POLICY_ID,
  briefingOwnerKdsPolicySnapshot,
} from "@/lib/briefing/owner-daily-briefing-owner-kds-era19";
import { BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID } from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import { BRIEFING_KDS_PRIORITY_LANE_HREF } from "@/lib/kitchen/kds-priority-lane-era19-policy";
import {
  filterBriefingActionsForRolePack,
  filterBriefingTilesForRolePack,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";

const allergenPrep = {
  id: "aaaaaaaa-bbbb-cccc-dddd-111111111111",
  status: "PREPARING",
  elapsedSeconds: 960,
  createdAt: "2026-05-28T10:00:00.000Z",
  customerName: "Alex",
  hasAllergenConflict: true,
};

const baseInput = {
  kpis: {
    ordersToday: 12,
    ordersDueToday: 4,
    activeOrders: 6,
    blockedOrdersApprox: 0,
    posKitchenQueueToday: 3,
    posTransactionsToday: 18,
    productionWorkOpen: 2,
    packingQueueOpen: 1,
    revenueToday: 890,
    errorIntegrations: 0,
    webhooksNeedingAttention: 0,
    failedExternalOrders: 0,
    openSupportTickets: 0,
    overdueTasks: 0,
  },
  blockers: [],
  readinessOverall: 85,
  integrationOverall: "healthy" as const,
  integrationHeadline: "Integrations healthy",
  pilotAttentionCount: 0,
  pilotHasUrgent: false,
  ssoEntitlementEnabled: false,
  ssoActive: false,
  ssoConfigured: false,
  lowStockCount: 0,
  ingredientParConfigured: true,
  labor: {
    available: true,
    activeStaff: 5,
    scheduledShiftsToday: 6,
    laborPercent: 20,
    status: "ON_TRACK" as const,
  },
  posShift: { openCount: 2 },
  productionCalendar: {
    summary: { overdue: 0, dueToday: 1, blocked: 0 },
    hasPlanTasks: true,
    calendarHref: "/dashboard/production/calendar",
    primaryHref: "/dashboard/production/calendar",
  },
};

describe("owner-daily-briefing-owner-kds-era19 policy", () => {
  it("registers era19 owner kds briefing proof", () => {
    expect(OWNER_DAILY_BRIEFING_OWNER_KDS_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-owner-kds-v1",
    );
    expect(briefingOwnerKdsPolicySnapshot().priorityLaneHref).toBe(
      BRIEFING_KDS_PRIORITY_LANE_HREF,
    );
  });
});

describe("buildOwnerDailyBriefingOwnerKdsActions", () => {
  it("builds owner oversight action when priority lane is active", () => {
    const actions = buildOwnerDailyBriefingOwnerKdsActions({
      kdsOrders: [allergenPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 0,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
    });

    expect(actions).toHaveLength(1);
    expect(actions[0]?.ownerRole).toBe("owner");
    expect(actions[0]?.href).toBe(BRIEFING_KDS_PRIORITY_LANE_HREF);
    expect(actions[0]?.reason).toContain("owner review");
  });

  it("returns empty when queue is steady", () => {
    expect(
      buildOwnerDailyBriefingOwnerKdsActions({
        kdsOrders: [],
        productionCalendarOverdue: 0,
        productionCalendarDueToday: 0,
        packingQueueOpen: 0,
        productionWorkOpen: 0,
      }),
    ).toEqual([]);
  });
});

describe("enrichBriefingOwnerPackTiles", () => {
  it("inserts priority lane tile before stuck orders for owner pack", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const enriched = enrichBriefingOwnerPackTiles(baseTiles, {
      kdsOrders: [allergenPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 0,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
    });
    const ownerTiles = filterBriefingTilesForRolePack(enriched, "owner");

    const priorityIndex = ownerTiles.findIndex(
      (tile) => tile.id === BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
    );
    const stuckIndex = ownerTiles.findIndex((tile) => tile.id === "stuck-orders");
    expect(priorityIndex).toBeGreaterThanOrEqual(0);
    expect(stuckIndex).toBeGreaterThan(priorityIndex);
    expect(ownerTiles[priorityIndex]?.detail).toContain("owner review");
  });
});

describe("mergeBriefingOwnerKdsTopActions", () => {
  it("keeps commercial-priority actions ahead of owner kds action", () => {
    const ownerKds = buildOwnerDailyBriefingOwnerKdsActions({
      kdsOrders: [allergenPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 0,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
    });
    const commercial = [
      {
        id: "launch-wizard-p0-staging-blocked",
        title: "Unblock P0 staging proof",
        reason: "Ops credentials missing",
        severity: "critical" as const,
        ownerRole: "owner" as const,
        href: "/dashboard/launch-wizard",
        status: "open" as const,
        unblockCondition: "Supply env vars",
        priority: 2,
        ctaLabel: "Unblock pilot",
        tone: "urgent" as const,
      },
    ];

    const merged = mergeBriefingOwnerKdsTopActions(ownerKds, commercial);
    const filtered = filterBriefingActionsForRolePack(merged, "owner");

    expect(filtered[0]?.id).toBe("launch-wizard-p0-staging-blocked");
    expect(filtered.some((action) => action.id === "owner-kds-priority-lane")).toBe(true);
  });
});
