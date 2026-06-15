import { describe, expect, it } from "vitest";

import {
  BRIEFING_MANAGER_PACKING_QC_TILE_ID,
  buildBriefingManagerPackingQcTile,
  buildOwnerDailyBriefingManagerPackingQcActions,
  enrichBriefingManagerPackingQcPackTiles,
  mergeBriefingManagerPackingQcActions,
  OWNER_DAILY_BRIEFING_MANAGER_PACKING_QC_ERA19_POLICY_ID,
  briefingManagerPackingQcPolicySnapshot,
} from "@/lib/briefing/owner-daily-briefing-manager-packing-qc-era19";
import { BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID } from "@/lib/briefing/owner-daily-briefing-kitchen-era19";
import {
  buildOwnerDailyBriefingManagerKdsActions,
  enrichBriefingManagerPackTiles,
} from "@/lib/briefing/owner-daily-briefing-manager-kds-era19";
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
    ordersToday: 8,
    ordersDueToday: 3,
    activeOrders: 5,
    blockedOrdersApprox: 0,
    posKitchenQueueToday: 2,
    posTransactionsToday: 12,
    productionWorkOpen: 1,
    packingQueueOpen: 3,
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

const alignedManagerInput = {
  kdsOrders: [allergenPrep, freshPrep],
  productionCalendarOverdue: 0,
  productionCalendarDueToday: 2,
  packingQueueOpen: 3,
  productionWorkOpen: 1,
};

describe("owner-daily-briefing-manager-packing-qc-era19 policy", () => {
  it("registers era19 manager packing QC cross-link proof", () => {
    expect(OWNER_DAILY_BRIEFING_MANAGER_PACKING_QC_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-manager-packing-qc-v1",
    );
    expect(briefingManagerPackingQcPolicySnapshot().qcAnchor).toBe(PACKING_QC_CLARITY_ANCHOR);
    expect(briefingManagerPackingQcPolicySnapshot().qcHref).toContain(
      `#${PACKING_QC_CLARITY_ANCHOR}`,
    );
  });
});

describe("buildBriefingManagerPackingQcTile", () => {
  it("builds supervisor handoff tile when KDS priority and packing queue align", () => {
    const tile = buildBriefingManagerPackingQcTile(alignedManagerInput);
    expect(tile?.id).toBe(BRIEFING_MANAGER_PACKING_QC_TILE_ID);
    expect(tile?.href).toContain(`#${PACKING_QC_CLARITY_ANCHOR}`);
    expect(tile?.detail).toContain("supervise");
    expect(tile?.detail).toContain("allergy alert");
  });

  it("returns null when only packing queue is open without KDS priority", () => {
    const tile = buildBriefingManagerPackingQcTile({
      ...alignedManagerInput,
      kdsOrders: [freshPrep],
    });
    expect(tile).toBeNull();
  });
});

describe("enrichBriefingManagerPackingQcPackTiles", () => {
  it("inserts QC supervision tile after KDS priority lane for manager pack", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const withManager = enrichBriefingManagerPackTiles(baseTiles, alignedManagerInput);
    const enriched = enrichBriefingManagerPackingQcPackTiles(withManager, alignedManagerInput);
    const managerTiles = filterBriefingTilesForRolePack(enriched, "manager");

    const priorityIndex = managerTiles.findIndex(
      (tile) => tile.id === BRIEFING_KITCHEN_KDS_PRIORITY_TILE_ID,
    );
    const handoffIndex = managerTiles.findIndex(
      (tile) => tile.id === BRIEFING_MANAGER_PACKING_QC_TILE_ID,
    );

    expect(priorityIndex).toBeGreaterThanOrEqual(0);
    expect(handoffIndex).toBe(priorityIndex + 1);
    expect(auditBriefingTileLinks(managerTiles).issues).toEqual([]);
  });

  it("rewires packing-status href to QC checklist when aligned", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const withManager = enrichBriefingManagerPackTiles(baseTiles, alignedManagerInput);
    const enriched = enrichBriefingManagerPackingQcPackTiles(withManager, alignedManagerInput);
    const packing = enriched.find((tile) => tile.id === "packing-status");

    expect(packing?.href).toContain(`#${PACKING_QC_CLARITY_ANCHOR}`);
    expect(packing?.detail).toContain("QC checklist");
  });
});

describe("buildOwnerDailyBriefingManagerPackingQcActions", () => {
  it("builds critical supervisor QC action when allergen KDS and packing align", () => {
    const actions = buildOwnerDailyBriefingManagerPackingQcActions(alignedManagerInput);
    expect(actions[0]?.id).toBe("manager-packing-kds-handoff");
    expect(actions[0]?.href).toContain(`#${PACKING_QC_CLARITY_ANCHOR}`);
    expect(actions[0]?.severity).toBe("critical");
    expect(actions[0]?.ctaLabel).toBe("Open QC checklist");
  });
});

describe("mergeBriefingManagerPackingQcActions", () => {
  it("supplies QC deep link for manager packing handoff in role pack", () => {
    const managerActions = buildOwnerDailyBriefingManagerKdsActions(alignedManagerInput);
    const qcActions = buildOwnerDailyBriefingManagerPackingQcActions(alignedManagerInput);
    const merged = mergeBriefingManagerPackingQcActions(managerActions, qcActions);
    const filtered = filterBriefingActionsForRolePack(merged, "manager");

    const handoff = filtered.find((action) => action.id === "manager-packing-kds-handoff");
    expect(handoff?.href).toContain(`#${PACKING_QC_CLARITY_ANCHOR}`);
    expect(filtered.filter((action) => action.id === "manager-packing-kds-handoff")).toHaveLength(
      1,
    );
  });
});
