import { describe, expect, it } from "vitest";

import { buildOwnerDailyBriefingTiles } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  enrichBriefingManagerPackTiles,
  buildOwnerDailyBriefingManagerKdsActions,
  mergeBriefingManagerKdsTopActions,
} from "@/lib/briefing/owner-daily-briefing-manager-kds-era19";
import {
  BRIEFING_MANAGER_MANAGER_OVERRIDE_HREF,
  BRIEFING_MANAGER_MANAGER_OVERRIDE_TILE_ID,
  buildBriefingManagerOverrideTile,
  buildOwnerDailyBriefingManagerOverrideActions,
  enrichBriefingManagerOverridePackTiles,
  mergeBriefingManagerOverrideActions,
  OWNER_DAILY_BRIEFING_MANAGER_OVERRIDE_ERA19_POLICY_ID,
  resolveBriefingManagerOverrideHref,
} from "@/lib/briefing/owner-daily-briefing-manager-override-era19";
import { BRIEFING_CASHIER_POS_SHIFTS_HREF } from "@/lib/briefing/owner-daily-briefing-cashier-era19";
import { OWNER_DAILY_BRIEFING_MANAGER_OVERRIDE_ERA19_BACKLOG_ID } from "@/lib/briefing/owner-daily-briefing-manager-override-era19-policy";
import {
  filterBriefingActionsForRolePack,
  filterBriefingTilesForRolePack,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { auditBriefingTileLinks } from "@/lib/briefing/owner-daily-briefing-tile-links-era19";

const kdsInput = {
  kdsOrders: [],
  productionCalendarOverdue: 0,
  productionCalendarDueToday: 0,
  packingQueueOpen: 0,
  productionWorkOpen: 0,
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
  posShift: { openCount: 1 },
};

describe("owner-daily-briefing-manager-override-era19 policy", () => {
  it("locks era19 manager override cross-link policy", () => {
    expect(OWNER_DAILY_BRIEFING_MANAGER_OVERRIDE_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-manager-override-v1",
    );
    expect(OWNER_DAILY_BRIEFING_MANAGER_OVERRIDE_ERA19_BACKLOG_ID).toBe("KOS-E19-031");
    expect(BRIEFING_MANAGER_MANAGER_OVERRIDE_TILE_ID).toBe("pos-manager-override-supervisor");
    expect(BRIEFING_MANAGER_MANAGER_OVERRIDE_HREF).toContain("pos-manager-override");
  });
});

describe("buildBriefingManagerOverrideTile", () => {
  it("shows supervise comps when manager has pos.discount.apply and shift is open", () => {
    const tile = buildBriefingManagerOverrideTile({
      openShiftCount: 1,
      canApplyPosDiscount: true,
      posTransactionsToday: 5,
    });

    expect(tile.id).toBe("pos-manager-override-supervisor");
    expect(tile.value).toBe("Supervise comps");
    expect(tile.href).toBe(BRIEFING_MANAGER_MANAGER_OVERRIDE_HREF);
    expect(tile.whyItMatters).toContain("override checklist");
  });

  it("routes to shifts when no drawer is open", () => {
    const tile = buildBriefingManagerOverrideTile({
      openShiftCount: 0,
      canApplyPosDiscount: true,
      posTransactionsToday: 0,
    });

    expect(tile.value).toBe("Shift required");
    expect(resolveBriefingManagerOverrideHref(0)).toBe(BRIEFING_CASHIER_POS_SHIFTS_HREF);
  });

  it("shows permission needed when manager lacks pos.discount.apply", () => {
    const tile = buildBriefingManagerOverrideTile({
      openShiftCount: 1,
      canApplyPosDiscount: false,
      posTransactionsToday: 2,
    });

    expect(tile.value).toBe("Permission needed");
    expect(tile.detail).toContain("pos.discount.apply");
  });
});

describe("enrichBriefingManagerOverridePackTiles", () => {
  it("inserts override tile after KDS priority lane for manager pack", () => {
    const urgentKdsInput = {
      ...kdsInput,
      kdsOrders: [
        {
          id: "aaaaaaaa-bbbb-cccc-dddd-111111111111",
          status: "PREPARING",
          elapsedSeconds: 960,
          createdAt: "2026-05-28T10:00:00.000Z",
          customerName: "Alex",
          hasAllergenConflict: true,
        },
      ],
    };
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const enriched = enrichBriefingManagerOverridePackTiles(
      enrichBriefingManagerPackTiles(baseTiles, urgentKdsInput),
      {
        openShiftCount: 1,
        canApplyPosDiscount: true,
        posTransactionsToday: 3,
      },
    );
    const managerTiles = filterBriefingTilesForRolePack(enriched, "manager");

    expect(managerTiles[0]?.id).toBe("kds-priority-lane");
    expect(managerTiles[1]?.id).toBe("pos-manager-override-supervisor");
    expect(auditBriefingTileLinks(managerTiles).valid).toBe(true);
  });
});

describe("buildOwnerDailyBriefingManagerOverrideActions", () => {
  it("surfaces override supervision when shift is open and permission granted", () => {
    const actions = buildOwnerDailyBriefingManagerOverrideActions({
      openShiftCount: 1,
      canApplyPosDiscount: true,
      posTransactionsToday: 8,
    });

    expect(actions[0]?.id).toBe("manager-pos-override-supervise");
    expect(actions[0]?.href).toBe(BRIEFING_MANAGER_MANAGER_OVERRIDE_HREF);
    expect(actions[0]?.ownerRole).toBe("manager");
  });

  it("nudges open shift when drawer is closed", () => {
    const actions = buildOwnerDailyBriefingManagerOverrideActions({
      openShiftCount: 0,
      canApplyPosDiscount: true,
      posTransactionsToday: 0,
    });

    expect(actions[0]?.id).toBe("manager-pos-override-shift");
    expect(actions[0]?.href).toBe(BRIEFING_CASHIER_POS_SHIFTS_HREF);
  });

  it("merges override actions with KDS manager actions without duplicate ids", () => {
    const kdsActions = buildOwnerDailyBriefingManagerKdsActions({
      ...kdsInput,
      kdsOrders: [
        {
          id: "aaaaaaaa-bbbb-cccc-dddd-111111111111",
          status: "PREPARING",
          elapsedSeconds: 960,
          createdAt: "2026-05-28T10:00:00.000Z",
          customerName: "Alex",
          hasAllergenConflict: true,
        },
      ],
    });
    const overrideActions = buildOwnerDailyBriefingManagerOverrideActions({
      openShiftCount: 1,
      canApplyPosDiscount: true,
      posTransactionsToday: 4,
    });

    const merged = mergeBriefingManagerOverrideActions(kdsActions, overrideActions);
    const managerTop = filterBriefingActionsForRolePack(
      mergeBriefingManagerKdsTopActions(merged, []),
      "manager",
    ).slice(0, 4);

    expect(managerTop[0]?.id).toBe("manager-kds-priority-lane");
    expect(managerTop.some((action) => action.id === "manager-pos-override-supervise")).toBe(true);
    expect(managerTop.some((action) => action.href.includes("pos-manager-override"))).toBe(true);
  });
});
