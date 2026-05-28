import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingTiles } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  buildOwnerDailyBriefingManagerKdsActions,
  enrichBriefingManagerPackTiles,
  mergeBriefingManagerKdsTopActions,
  OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_POLICY_ID,
  briefingManagerKdsPolicySnapshot,
} from "@/lib/briefing/owner-daily-briefing-manager-kds-era19";
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

const freshPrep = {
  id: "aaaaaaaa-bbbb-cccc-dddd-222222222222",
  status: "PREPARING",
  elapsedSeconds: 120,
  createdAt: "2026-05-28T10:14:00.000Z",
  customerName: "Sam",
};

const baseInput = {
  kpis: {
    ordersToday: 8,
    ordersDueToday: 3,
    activeOrders: 5,
    blockedOrdersApprox: 0,
    posKitchenQueueToday: 2,
    posTransactionsToday: 12,
    productionWorkOpen: 1,
    packingQueueOpen: 2,
    revenueToday: 420,
    errorIntegrations: 0,
    webhooksNeedingAttention: 0,
    failedExternalOrders: 0,
    openSupportTickets: 1,
    overdueTasks: 0,
  },
  blockers: [],
  readinessOverall: 78,
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
    activeStaff: 4,
    scheduledShiftsToday: 5,
    laborPercent: 22,
    status: "ON_TRACK" as const,
  },
  posShift: { openCount: 2 },
  productionCalendar: {
    summary: { overdue: 0, dueToday: 2, blocked: 0 },
    hasPlanTasks: true,
    calendarHref: "/dashboard/production/calendar",
    primaryHref: "/dashboard/production/calendar",
  },
};

describe("owner-daily-briefing-manager-kds-era19 policy", () => {
  it("registers era19 manager kds briefing proof", () => {
    expect(OWNER_DAILY_BRIEFING_MANAGER_KDS_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-manager-kds-v1",
    );
    expect(briefingManagerKdsPolicySnapshot().priorityLaneHref).toBe(
      BRIEFING_KDS_PRIORITY_LANE_HREF,
    );
  });
});

describe("buildOwnerDailyBriefingManagerKdsActions", () => {
  it("builds supervisor priority lane action from real queue rows", () => {
    const actions = buildOwnerDailyBriefingManagerKdsActions({
      kdsOrders: [allergenPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 2,
      packingQueueOpen: 2,
      productionWorkOpen: 0,
    });

    expect(actions[0]?.id).toBe("manager-kds-priority-lane");
    expect(actions[0]?.ownerRole).toBe("manager");
    expect(actions[0]?.href).toBe(BRIEFING_KDS_PRIORITY_LANE_HREF);
    expect(actions.some((action) => action.id === "manager-packing-kds-handoff")).toBe(true);
  });

  it("returns no priority action when queue is steady", () => {
    const actions = buildOwnerDailyBriefingManagerKdsActions({
      kdsOrders: [freshPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 0,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
    });

    expect(actions.some((action) => action.id === "manager-kds-priority-lane")).toBe(false);
  });
});

describe("enrichBriefingManagerPackTiles", () => {
  it("inserts priority lane tile and rewires kds-pressure for manager pack", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const enriched = enrichBriefingManagerPackTiles(baseTiles, {
      kdsOrders: [allergenPrep, freshPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 2,
      packingQueueOpen: 2,
      productionWorkOpen: 1,
    });
    const managerTiles = filterBriefingTilesForRolePack(enriched, "manager");

    expect(managerTiles.some((tile) => tile.id === BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID)).toBe(
      true,
    );
    const priorityTile = managerTiles.find(
      (tile) => tile.id === BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
    );
    expect(priorityTile?.detail).toContain("supervisor review");
    const pressure = managerTiles.find((tile) => tile.id === "kds-pressure");
    expect(pressure?.href).toBe(BRIEFING_KDS_PRIORITY_LANE_HREF);
    expect(pressure?.detail).toContain("Priority lane active");
  });
});

describe("mergeBriefingManagerKdsTopActions", () => {
  it("surfaces manager priority action in role pack filter", () => {
    const managerActions = buildOwnerDailyBriefingManagerKdsActions({
      kdsOrders: [allergenPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 0,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
    });
    const merged = mergeBriefingManagerKdsTopActions(managerActions, []);
    const filtered = filterBriefingActionsForRolePack(merged, "manager");

    expect(filtered[0]?.id).toBe("manager-kds-priority-lane");
  });
});
