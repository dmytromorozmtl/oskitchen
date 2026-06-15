import { describe, expect, it } from "vitest";

import {
  BRIEFING_KITCHEN_PACKING_QC_TILE_ID,
  buildBriefingKitchenPackingQcTile,
  buildOwnerDailyBriefingKitchenPackingQcActions,
  enrichBriefingKitchenPackingQcPackTiles,
  mergeBriefingKitchenPackingQcActions,
  OWNER_DAILY_BRIEFING_KITCHEN_PACKING_QC_ERA19_POLICY_ID,
  resolveBriefingKitchenPackingQcHref,
  shouldBriefingKitchenPackingQcHandoff,
  briefingKitchenPackingQcPolicySnapshot,
} from "@/lib/briefing/owner-daily-briefing-kitchen-packing-qc-era19";
import {
  BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
  buildOwnerDailyBriefingKitchenActions,
  enrichBriefingKitchenPackTiles,
} from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import { buildOwnerDailyBriefingTiles } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  filterBriefingActionsForRolePack,
  filterBriefingTilesForRolePack,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { auditBriefingTileLinks } from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import { PACKING_QC_CLARITY_ANCHOR } from "@/lib/packing/packing-qc-clarity-era19-policy";

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
    packingQueueOpen: 3,
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

const alignedKitchenInput = {
  kdsOrders: [allergenPrep, freshPrep],
  productionCalendarOverdue: 0,
  productionCalendarDueToday: 1,
  packingQueueOpen: 3,
  productionWorkOpen: 1,
};

describe("owner-daily-briefing-kitchen-packing-qc-era19 policy", () => {
  it("registers era19 kitchen packing QC cross-link proof", () => {
    expect(OWNER_DAILY_BRIEFING_KITCHEN_PACKING_QC_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-kitchen-packing-qc-v1",
    );
    expect(briefingKitchenPackingQcPolicySnapshot().qcAnchor).toBe(PACKING_QC_CLARITY_ANCHOR);
    expect(briefingKitchenPackingQcPolicySnapshot().qcHref).toContain(
      `#${PACKING_QC_CLARITY_ANCHOR}`,
    );
  });
});

describe("shouldBriefingKitchenPackingQcHandoff", () => {
  it("requires both open pack queue and active KDS priority lane", () => {
    expect(
      shouldBriefingKitchenPackingQcHandoff({ packingQueueOpen: 2, showPriorityLane: true }),
    ).toBe(true);
    expect(
      shouldBriefingKitchenPackingQcHandoff({ packingQueueOpen: 0, showPriorityLane: true }),
    ).toBe(false);
    expect(
      shouldBriefingKitchenPackingQcHandoff({ packingQueueOpen: 2, showPriorityLane: false }),
    ).toBe(false);
  });
});

describe("resolveBriefingKitchenPackingQcHref", () => {
  it("deep-links to packing QC anchor when KDS and packing pressure align", () => {
    expect(
      resolveBriefingKitchenPackingQcHref({ packingQueueOpen: 2, showPriorityLane: true }),
    ).toContain(`#${PACKING_QC_CLARITY_ANCHOR}`);
    expect(
      resolveBriefingKitchenPackingQcHref({ packingQueueOpen: 0, showPriorityLane: true }),
    ).toBe("/dashboard/packing");
  });
});

describe("buildBriefingKitchenPackingQcTile", () => {
  it("builds handoff tile when KDS priority and packing queue align", () => {
    const tile = buildBriefingKitchenPackingQcTile(alignedKitchenInput);
    expect(tile?.id).toBe(BRIEFING_KITCHEN_PACKING_QC_TILE_ID);
    expect(tile?.href).toContain(`#${PACKING_QC_CLARITY_ANCHOR}`);
    expect(tile?.detail).toContain("allergy alert");
  });

  it("returns null when only packing queue is open without KDS priority", () => {
    const tile = buildBriefingKitchenPackingQcTile({
      ...alignedKitchenInput,
      kdsOrders: [freshPrep],
    });
    expect(tile).toBeNull();
  });
});

describe("enrichBriefingKitchenPackingQcPackTiles", () => {
  it("inserts QC handoff tile after KDS priority lane for kitchen pack", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const withKitchen = enrichBriefingKitchenPackTiles(baseTiles, alignedKitchenInput);
    const enriched = enrichBriefingKitchenPackingQcPackTiles(withKitchen, alignedKitchenInput);
    const kitchenTiles = filterBriefingTilesForRolePack(enriched, "kitchen");

    const priorityIndex = kitchenTiles.findIndex(
      (tile) => tile.id === BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
    );
    const handoffIndex = kitchenTiles.findIndex(
      (tile) => tile.id === BRIEFING_KITCHEN_PACKING_QC_TILE_ID,
    );

    expect(priorityIndex).toBeGreaterThanOrEqual(0);
    expect(handoffIndex).toBe(priorityIndex + 1);
    expect(auditBriefingTileLinks(kitchenTiles).issues).toEqual([]);
  });

  it("rewires packing-status href to QC checklist when aligned", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const withKitchen = enrichBriefingKitchenPackTiles(baseTiles, alignedKitchenInput);
    const enriched = enrichBriefingKitchenPackingQcPackTiles(withKitchen, alignedKitchenInput);
    const packing = enriched.find((tile) => tile.id === "packing-status");

    expect(packing?.href).toContain(`#${PACKING_QC_CLARITY_ANCHOR}`);
    expect(packing?.detail).toContain("QC checklist");
  });
});

describe("buildOwnerDailyBriefingKitchenPackingQcActions", () => {
  it("builds critical QC action when allergen KDS and packing align", () => {
    const actions = buildOwnerDailyBriefingKitchenPackingQcActions(alignedKitchenInput);
    expect(actions[0]?.id).toBe("kitchen-packing-handoff");
    expect(actions[0]?.href).toContain(`#${PACKING_QC_CLARITY_ANCHOR}`);
    expect(actions[0]?.severity).toBe("critical");
    expect(actions[0]?.ctaLabel).toBe("Open QC checklist");
  });
});

describe("mergeBriefingKitchenPackingQcActions", () => {
  it("replaces legacy kitchen packing handoff with QC deep link in role pack", () => {
    const kitchenActions = buildOwnerDailyBriefingKitchenActions(alignedKitchenInput);
    const qcActions = buildOwnerDailyBriefingKitchenPackingQcActions(alignedKitchenInput);
    const merged = mergeBriefingKitchenPackingQcActions(kitchenActions, qcActions);
    const filtered = filterBriefingActionsForRolePack(merged, "kitchen");

    const handoff = filtered.find((action) => action.id === "kitchen-packing-handoff");
    expect(handoff?.href).toContain(`#${PACKING_QC_CLARITY_ANCHOR}`);
    expect(filtered.filter((action) => action.id === "kitchen-packing-handoff")).toHaveLength(1);
  });
});
