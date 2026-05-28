import { describe, expect, it } from "vitest";

import {
  BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
  buildBriefingKitchenKdsSummary,
  buildBriefingKitchenPriorityLaneTile,
  buildOwnerDailyBriefingKitchenActions,
  enrichBriefingKitchenPackTiles,
  mergeBriefingKitchenTopActions,
  OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID,
  resolveBriefingKitchenPriorityLaneHref,
  briefingKitchenPolicySnapshot,
} from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import { BRIEFING_KDS_PRIORITY_LANE_HREF } from "@/lib/kitchen/kds-priority-lane-era19-policy";
import { buildOwnerDailyBriefingTiles } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  filterBriefingActionsForRolePack,
  filterBriefingTilesForRolePack,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { auditBriefingTileLinks } from "@/lib/briefing/owner-daily-briefing-tile-links-era19";

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
    ordersToday: 4,
    ordersDueToday: 2,
    activeOrders: 3,
    blockedOrdersApprox: 0,
    posKitchenQueueToday: 2,
    posTransactionsToday: 0,
    productionWorkOpen: 1,
    packingQueueOpen: 0,
    revenueToday: 120,
    errorIntegrations: 0,
    webhooksNeedingAttention: 0,
    failedExternalOrders: 0,
    openSupportTickets: 0,
    overdueTasks: 0,
  },
  blockers: [],
  readinessOverall: 82,
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
    activeStaff: 2,
    scheduledShiftsToday: 3,
    laborPercent: 18,
    status: "ON_TRACK" as const,
  },
  posShift: { openCount: 0 },
  productionCalendar: {
    summary: { overdue: 0, dueToday: 1, blocked: 0 },
    hasPlanTasks: true,
    calendarHref: "/dashboard/production/calendar",
    primaryHref: "/dashboard/production/calendar",
  },
};

describe("owner-daily-briefing-kitchen-era19 policy", () => {
  it("registers era19 kitchen briefing proof", () => {
    expect(OWNER_DAILY_BRIEFING_KITCHEN_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-kitchen-v1",
    );
    expect(briefingKitchenPolicySnapshot().priorityLaneHref).toBe(
      BRIEFING_KDS_PRIORITY_LANE_HREF,
    );
  });
});

describe("buildBriefingKitchenKdsSummary", () => {
  it("detects priority lane candidates from real queue rows", () => {
    const summary = buildBriefingKitchenKdsSummary([allergenPrep, freshPrep]);
    expect(summary.showPriorityLane).toBe(true);
    expect(summary.allergenPrepCount).toBe(1);
    expect(summary.overdueCount).toBe(1);
    expect(summary.priorityCandidateCount).toBeGreaterThan(0);
  });

  it("reports steady queue when no urgent tickets exist", () => {
    const summary = buildBriefingKitchenKdsSummary([freshPrep]);
    expect(summary.showPriorityLane).toBe(false);
    expect(summary.queueCount).toBe(1);
  });
});

describe("buildBriefingKitchenPriorityLaneTile", () => {
  it("deep-links to kitchen priority lane anchor when urgent tickets exist", () => {
    const summary = buildBriefingKitchenKdsSummary([allergenPrep]);
    const tile = buildBriefingKitchenPriorityLaneTile(summary);

    expect(tile.id).toBe(BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID);
    expect(tile.href).toBe(BRIEFING_KDS_PRIORITY_LANE_HREF);
    expect(tile.value).toContain("urgent");
  });

  it("uses standard kitchen route when queue is empty", () => {
    const tile = buildBriefingKitchenPriorityLaneTile(buildBriefingKitchenKdsSummary([]));
    expect(tile.availability).toBe("empty");
    expect(tile.href).toBe("/dashboard/kitchen");
  });
});

describe("resolveBriefingKitchenPriorityLaneHref", () => {
  it("routes to priority anchor only when lane is active", () => {
    const urgent = buildBriefingKitchenKdsSummary([allergenPrep]);
    const steady = buildBriefingKitchenKdsSummary([freshPrep]);

    expect(resolveBriefingKitchenPriorityLaneHref(urgent)).toBe(BRIEFING_KDS_PRIORITY_LANE_HREF);
    expect(resolveBriefingKitchenPriorityLaneHref(steady)).toBe("/dashboard/kitchen");
  });
});

describe("buildOwnerDailyBriefingKitchenActions", () => {
  it("builds critical priority lane action for allergen queue", () => {
    const actions = buildOwnerDailyBriefingKitchenActions({
      kdsOrders: [allergenPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 0,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
    });

    expect(actions[0]?.id).toBe("kitchen-priority-lane");
    expect(actions[0]?.href).toBe(BRIEFING_KDS_PRIORITY_LANE_HREF);
    expect(actions[0]?.severity).toBe("critical");
  });
});

describe("enrichBriefingKitchenPackTiles", () => {
  it("inserts priority lane tile ahead of kds pressure for kitchen pack", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const enriched = enrichBriefingKitchenPackTiles(baseTiles, {
      kdsOrders: [allergenPrep, freshPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 1,
      packingQueueOpen: 0,
      productionWorkOpen: 1,
    });
    const kitchenTiles = filterBriefingTilesForRolePack(enriched, "kitchen");

    expect(kitchenTiles[0]?.id).toBe(BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID);
    expect(kitchenTiles.some((tile) => tile.id === "kds-pressure")).toBe(true);
    expect(auditBriefingTileLinks(kitchenTiles).issues).toEqual([]);
  });

  it("rewires kds-pressure href when priority lane is active", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const enriched = enrichBriefingKitchenPackTiles(baseTiles, {
      kdsOrders: [allergenPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 0,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
    });
    const pressure = enriched.find((tile) => tile.id === "kds-pressure");
    expect(pressure?.href).toBe(BRIEFING_KDS_PRIORITY_LANE_HREF);
  });
});

describe("mergeBriefingKitchenTopActions", () => {
  it("prioritizes kitchen lane action in role pack filter", () => {
    const kitchenActions = buildOwnerDailyBriefingKitchenActions({
      kdsOrders: [allergenPrep],
      productionCalendarOverdue: 0,
      productionCalendarDueToday: 0,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
    });
    const merged = mergeBriefingKitchenTopActions(kitchenActions, []);
    const filtered = filterBriefingActionsForRolePack(merged, "kitchen");

    expect(filtered[0]?.id).toBe("kitchen-priority-lane");
  });
});
