import { describe, expect, it } from "vitest";

import {
  BRIEFING_CASHIER_MANAGER_OVERRIDE_HREF,
  BRIEFING_CASHIER_MANAGER_OVERRIDE_TILE_ID,
  buildBriefingCashierManagerOverrideTile,
  buildOwnerDailyBriefingCashierManagerOverrideActions,
  enrichBriefingCashierManagerOverridePackTiles,
  mergeBriefingCashierManagerOverrideActions,
  OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_ERA19_POLICY_ID,
  resolveBriefingCashierManagerOverrideHref,
  resolveBriefingCashierManagerOverrideLinkState,
} from "@/lib/briefing/owner-daily-briefing-cashier-manager-override-era19";
import {
  BRIEFING_CASHIER_POS_SHIFTS_HREF,
  buildOwnerDailyBriefingCashierActions,
  enrichBriefingCashierPackTiles,
} from "@/lib/briefing/owner-daily-briefing-cashier-era19";
import { buildOwnerDailyBriefingTiles } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  filterBriefingActionsForRolePack,
  filterBriefingTilesForRolePack,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { auditBriefingTileLinks } from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import { OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_ERA19_BACKLOG_ID } from "@/lib/briefing/owner-daily-briefing-cashier-manager-override-era19-policy";

const baseInput = {
  kpis: {
    ordersToday: 4,
    ordersDueToday: 2,
    activeOrders: 3,
    blockedOrdersApprox: 0,
    posKitchenQueueToday: 0,
    posTransactionsToday: 0,
    productionWorkOpen: 0,
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
};

describe("owner-daily-briefing-cashier-manager-override-era19 policy", () => {
  it("locks era19 cashier manager override cross-link policy", () => {
    expect(OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-cashier-manager-override-v1",
    );
    expect(OWNER_DAILY_BRIEFING_CASHIER_MANAGER_OVERRIDE_ERA19_BACKLOG_ID).toBe("KOS-E19-029");
    expect(BRIEFING_CASHIER_MANAGER_OVERRIDE_TILE_ID).toBe("pos-manager-override-handoff");
    expect(BRIEFING_CASHIER_MANAGER_OVERRIDE_HREF).toContain("pos-manager-override");
    expect(BRIEFING_CASHIER_MANAGER_OVERRIDE_HREF).toContain("speed=1");
  });
});

describe("resolveBriefingCashierManagerOverrideHref", () => {
  it("routes to speed terminal override anchor when shift is open", () => {
    expect(resolveBriefingCashierManagerOverrideHref(1)).toBe(
      BRIEFING_CASHIER_MANAGER_OVERRIDE_HREF,
    );
  });

  it("routes to shifts when drawer is closed", () => {
    expect(resolveBriefingCashierManagerOverrideHref(0)).toBe(BRIEFING_CASHIER_POS_SHIFTS_HREF);
  });
});

describe("buildBriefingCashierManagerOverrideTile", () => {
  it("shows manager handoff when cashier lacks pos.discount.apply", () => {
    const tile = buildBriefingCashierManagerOverrideTile({
      openShiftCount: 1,
      posTransactionsToday: 2,
      blockedOrdersApprox: 0,
      canApplyPosDiscount: false,
    });

    expect(tile.id).toBe("pos-manager-override-handoff");
    expect(tile.value).toBe("Ask manager");
    expect(tile.href).toBe(BRIEFING_CASHIER_MANAGER_OVERRIDE_HREF);
    expect(tile.linkState).toBe("blocked");
    expect(tile.whyItMatters).toContain("pos.discount.apply");
  });

  it("shows checklist ready when manager discount permission is granted", () => {
    const tile = buildBriefingCashierManagerOverrideTile({
      openShiftCount: 1,
      posTransactionsToday: 0,
      blockedOrdersApprox: 0,
      canApplyPosDiscount: true,
    });

    expect(tile.value).toBe("Checklist ready");
    expect(resolveBriefingCashierManagerOverrideLinkState({
      openShiftCount: 1,
      canApplyPosDiscount: true,
    })).toBe("operational");
    expect(resolveBriefingCashierManagerOverrideLinkState({
      openShiftCount: 1,
      canApplyPosDiscount: false,
    })).toBe("setup_needed");
  });

  it("blocks override tile when shift is closed", () => {
    const tile = buildBriefingCashierManagerOverrideTile({
      openShiftCount: 0,
      posTransactionsToday: 0,
      blockedOrdersApprox: 0,
      canApplyPosDiscount: false,
    });

    expect(tile.value).toBe("Shift required");
    expect(tile.href).toBe(BRIEFING_CASHIER_POS_SHIFTS_HREF);
  });
});

describe("enrichBriefingCashierManagerOverridePackTiles", () => {
  it("inserts override tile after POS register for cashier pack", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const enriched = enrichBriefingCashierManagerOverridePackTiles(
      enrichBriefingCashierPackTiles(baseTiles, {
        openShiftCount: 1,
        posTransactionsToday: 0,
        blockedOrdersApprox: 0,
      }),
      {
        openShiftCount: 1,
        posTransactionsToday: 0,
        blockedOrdersApprox: 0,
        canApplyPosDiscount: false,
      },
    );
    const cashierTiles = filterBriefingTilesForRolePack(enriched, "cashier");

    expect(cashierTiles[0]?.id).toBe("pos-terminal-register");
    expect(cashierTiles[1]?.id).toBe("pos-manager-override-handoff");
    expect(auditBriefingTileLinks(cashierTiles).valid).toBe(true);
  });
});

describe("buildOwnerDailyBriefingCashierManagerOverrideActions", () => {
  it("returns handoff action for cashiers without discount permission", () => {
    const actions = buildOwnerDailyBriefingCashierManagerOverrideActions({
      openShiftCount: 1,
      posTransactionsToday: 1,
      blockedOrdersApprox: 0,
      canApplyPosDiscount: false,
    });

    expect(actions[0]?.id).toBe("cashier-manager-override-handoff");
    expect(actions[0]?.href).toBe(BRIEFING_CASHIER_MANAGER_OVERRIDE_HREF);
    expect(actions[0]?.ownerRole).toBe("cashier");
  });

  it("returns override review action when pos.discount.apply is granted", () => {
    const actions = buildOwnerDailyBriefingCashierManagerOverrideActions({
      openShiftCount: 1,
      posTransactionsToday: 3,
      blockedOrdersApprox: 0,
      canApplyPosDiscount: true,
    });

    expect(actions[0]?.id).toBe("cashier-manager-override-review");
    expect(actions[0]?.ownerRole).toBe("manager");
  });

  it("skips override actions when shift is closed", () => {
    expect(
      buildOwnerDailyBriefingCashierManagerOverrideActions({
        openShiftCount: 0,
        posTransactionsToday: 0,
        blockedOrdersApprox: 0,
        canApplyPosDiscount: true,
      }),
    ).toEqual([]);
  });
});

describe("mergeBriefingCashierManagerOverrideActions", () => {
  it("merges override actions into cashier ranked actions", () => {
    const cashierActions = buildOwnerDailyBriefingCashierActions({
      openShiftCount: 1,
      posTransactionsToday: 5,
      blockedOrdersApprox: 0,
    });
    const overrideActions = buildOwnerDailyBriefingCashierManagerOverrideActions({
      openShiftCount: 1,
      posTransactionsToday: 5,
      blockedOrdersApprox: 0,
      canApplyPosDiscount: false,
    });

    const merged = mergeBriefingCashierManagerOverrideActions(cashierActions, overrideActions);
    const cashierTop = filterBriefingActionsForRolePack(merged, "cashier").slice(0, 4);

    expect(cashierTop.some((action) => action.id === "cashier-manager-override-handoff")).toBe(
      true,
    );
    expect(cashierTop.some((action) => action.href.includes("pos-manager-override"))).toBe(true);
  });
});
