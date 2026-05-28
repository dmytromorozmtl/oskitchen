import { describe, expect, it } from "vitest";

import {
  BRIEFING_CASHIER_POS_SHIFT_CLOSE_HREF,
  BRIEFING_CASHIER_POS_SHIFTS_HREF,
  BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF,
  buildBriefingCashierPosTerminalTile,
  buildOwnerDailyBriefingCashierActions,
  enrichBriefingCashierPackTiles,
  mergeBriefingCashierTopActions,
  OWNER_DAILY_BRIEFING_CASHIER_ERA19_POLICY_ID,
  resolveBriefingCashierPosTerminalHref,
  resolveBriefingCashierPosTerminalLinkState,
} from "@/lib/briefing/owner-daily-briefing-cashier-era19";
import { buildOwnerDailyBriefingTiles } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  filterBriefingActionsForRolePack,
  filterBriefingTilesForRolePack,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { auditBriefingTileLinks } from "@/lib/briefing/owner-daily-briefing-tile-links-era19";

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

describe("owner-daily-briefing-cashier-era19 policy", () => {
  it("registers era19 cashier briefing proof", () => {
    expect(OWNER_DAILY_BRIEFING_CASHIER_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-cashier-v1",
    );
  });
});

describe("resolveBriefingCashierPosTerminalHref", () => {
  it("routes to speed terminal when a shift is open", () => {
    expect(resolveBriefingCashierPosTerminalHref(1)).toBe(
      BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF,
    );
    expect(resolveBriefingCashierPosTerminalHref(2)).toBe(
      BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF,
    );
  });

  it("routes to shifts page when no shift is open", () => {
    expect(resolveBriefingCashierPosTerminalHref(0)).toBe(BRIEFING_CASHIER_POS_SHIFTS_HREF);
  });
});

describe("buildBriefingCashierPosTerminalTile", () => {
  it("shows speed mode CTA when shift is open", () => {
    const tile = buildBriefingCashierPosTerminalTile({
      openShiftCount: 1,
      posTransactionsToday: 2,
      blockedOrdersApprox: 0,
    });

    expect(tile.id).toBe("pos-terminal-register");
    expect(tile.href).toBe(BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF);
    expect(tile.value).toBe("Speed mode");
    expect(tile.linkState).toBe("operational");
    expect(tile.whyItMatters).toContain("speed layout");
  });

  it("shows blocked shift state when drawer is closed", () => {
    const tile = buildBriefingCashierPosTerminalTile({
      openShiftCount: 0,
      posTransactionsToday: 0,
      blockedOrdersApprox: 0,
    });

    expect(tile.href).toBe(BRIEFING_CASHIER_POS_SHIFTS_HREF);
    expect(tile.value).toBe("Shift required");
    expect(resolveBriefingCashierPosTerminalLinkState({ openShiftCount: 0 })).toBe("blocked");
  });
});

describe("enrichBriefingCashierPackTiles", () => {
  it("inserts POS terminal tile ahead of open shifts for cashier pack", () => {
    const baseTiles = buildOwnerDailyBriefingTiles(baseInput);
    const enriched = enrichBriefingCashierPackTiles(baseTiles, {
      openShiftCount: 1,
      posTransactionsToday: 0,
      blockedOrdersApprox: 0,
    });
    const cashierTiles = filterBriefingTilesForRolePack(enriched, "cashier");

    expect(cashierTiles[0]?.id).toBe("pos-terminal-register");
    expect(cashierTiles.some((tile) => tile.id === "pos-open-shifts")).toBe(true);
    expect(auditBriefingTileLinks(cashierTiles).valid).toBe(true);
  });
});

describe("buildOwnerDailyBriefingCashierActions", () => {
  it("prioritizes open shift when drawer is closed", () => {
    const actions = buildOwnerDailyBriefingCashierActions({
      openShiftCount: 0,
      posTransactionsToday: 0,
      blockedOrdersApprox: 0,
    });

    expect(actions[0]?.id).toBe("cashier-open-shift");
    expect(actions[0]?.ownerRole).toBe("cashier");
    expect(actions[0]?.href).toBe(BRIEFING_CASHIER_POS_SHIFTS_HREF);
  });

  it("surfaces speed mode register and closeout when shift is open", () => {
    const actions = buildOwnerDailyBriefingCashierActions({
      openShiftCount: 1,
      posTransactionsToday: 5,
      blockedOrdersApprox: 0,
    });

    expect(actions[0]?.id).toBe("cashier-open-register");
    expect(actions[0]?.href).toBe(BRIEFING_CASHIER_POS_SPEED_TERMINAL_HREF);
    expect(actions.some((action) => action.id === "cashier-close-shift")).toBe(true);
    expect(
      actions.find((action) => action.id === "cashier-close-shift")?.href,
    ).toBe(BRIEFING_CASHIER_POS_SHIFT_CLOSE_HREF);
  });

  it("adds stuck-order triage for cashiers", () => {
    const actions = buildOwnerDailyBriefingCashierActions({
      openShiftCount: 1,
      posTransactionsToday: 1,
      blockedOrdersApprox: 2,
    });

    expect(actions.some((action) => action.id === "cashier-stuck-orders")).toBe(true);
  });

  it("nudges first sale when shift is open with zero transactions", () => {
    const actions = buildOwnerDailyBriefingCashierActions({
      openShiftCount: 1,
      posTransactionsToday: 0,
      blockedOrdersApprox: 0,
    });

    expect(actions.some((action) => action.id === "cashier-first-sale")).toBe(true);
  });
});

describe("mergeBriefingCashierTopActions", () => {
  it("keeps cashier actions ahead of general manager actions for cashier pack", () => {
    const cashierActions = buildOwnerDailyBriefingCashierActions({
      openShiftCount: 1,
      posTransactionsToday: 0,
      blockedOrdersApprox: 0,
    });
    const generalActions = [
      {
        id: "monitor-order-hub",
        title: "Monitor active pipeline",
        reason: "3 active orders",
        severity: "low" as const,
        ownerRole: "manager" as const,
        href: "/dashboard/order-hub",
        status: "monitor" as const,
        unblockCondition: "Clear queue",
        priority: 20,
        ctaLabel: "Open",
        tone: "normal" as const,
      },
    ];

    const merged = mergeBriefingCashierTopActions(cashierActions, generalActions);
    const cashierTop = filterBriefingActionsForRolePack(merged, "cashier").slice(0, 3);

    expect(cashierTop[0]?.ownerRole).toBe("cashier");
    expect(cashierTop.some((action) => action.href.includes("speed=1"))).toBe(true);
  });
});
