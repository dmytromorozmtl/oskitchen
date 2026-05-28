import { describe, expect, it } from "vitest";

import {
  BRIEFING_ROLE_PACK_LABEL,
  filterBriefingActionsForRolePack,
  filterBriefingAlertsForRolePack,
  filterBriefingTilesForRolePack,
  OWNER_DAILY_BRIEFING_ROLE_PACKS_ERA19_POLICY_ID,
  resolveBriefingRolePack,
  shouldShowBriefingForPersona,
  shouldShowBriefingIntegrationHealthLane,
  shouldShowBriefingPilotReadinessLane,
  shouldShowBriefingProductionCalendarLane,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { buildOwnerDailyBriefingTiles } from "@/lib/briefing/owner-daily-briefing-era19";
import type {
  OwnerDailyBriefingAlert,
  OwnerDailyBriefingRankedAction,
} from "@/lib/briefing/owner-daily-briefing-era19";

const baseInput = {
  kpis: {
    ordersToday: 8,
    ordersDueToday: 2,
    activeOrders: 5,
    blockedOrdersApprox: 1,
    posKitchenQueueToday: 2,
    posTransactionsToday: 4,
    productionWorkOpen: 3,
    packingQueueOpen: 1,
    revenueToday: 900,
    errorIntegrations: 0,
    webhooksNeedingAttention: 0,
    failedExternalOrders: 0,
    openSupportTickets: 0,
    overdueTasks: 0,
  },
  blockers: [],
  readinessOverall: 75,
  integrationOverall: "healthy" as const,
  integrationHeadline: "OK",
  pilotAttentionCount: 1,
  pilotHasUrgent: false,
  ssoEntitlementEnabled: true,
  ssoActive: false,
  ssoConfigured: false,
  lowStockCount: 0,
  ingredientParConfigured: true,
  labor: {
    available: true,
    activeStaff: 2,
    scheduledShiftsToday: 3,
    laborPercent: 30,
    status: "ON_TRACK" as const,
  },
  posShift: { openCount: 0 },
};

describe("owner daily briefing role packs era19", () => {
  it("locks era19 role packs policy id", () => {
    expect(OWNER_DAILY_BRIEFING_ROLE_PACKS_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-role-packs-v1",
    );
  });

  it("resolves owner workspace to owner pack", () => {
    expect(
      resolveBriefingRolePack({ workspaceRole: "OWNER", persona: "manager" }),
    ).toBe("owner");
  });

  it("resolves kitchen staff to kitchen pack", () => {
    expect(
      resolveBriefingRolePack({ workspaceRole: "STAFF", persona: "kitchen" }),
    ).toBe("kitchen");
  });

  it("filters owner pack to leadership tiles only", () => {
    const tiles = buildOwnerDailyBriefingTiles(baseInput);
    const ownerTiles = filterBriefingTilesForRolePack(tiles, "owner");
    expect(ownerTiles.some((tile) => tile.id === "revenue-snapshot")).toBe(true);
    expect(ownerTiles.some((tile) => tile.id === "pilot-status")).toBe(true);
    expect(ownerTiles.some((tile) => tile.id === "kds-pressure")).toBe(false);
  });

  it("filters kitchen pack to line operations tiles", () => {
    const tiles = buildOwnerDailyBriefingTiles(baseInput);
    const kitchenTiles = filterBriefingTilesForRolePack(tiles, "kitchen");
    expect(kitchenTiles.every((tile) =>
      ["kds-pressure", "production-priorities", "production-calendar-today", "packing-status"].includes(
        tile.id,
      ),
    )).toBe(true);
  });

  it("filters cashier pack to POS-focused tiles", () => {
    const tiles = buildOwnerDailyBriefingTiles(baseInput);
    const cashierTiles = filterBriefingTilesForRolePack(tiles, "cashier");
    expect(cashierTiles.some((tile) => tile.id === "pos-open-shifts")).toBe(true);
    expect(cashierTiles.some((tile) => tile.id === "pos-transactions-today")).toBe(true);
    expect(cashierTiles.some((tile) => tile.id === "revenue-snapshot")).toBe(false);
  });

  it("excludes pilot alerts from manager pack", () => {
    const alerts: OwnerDailyBriefingAlert[] = [
      {
        id: "pilot-channel-woo",
        title: "Woo pilot setup",
        detail: "Incomplete",
        href: "/dashboard/implementation",
        priority: 3,
        tone: "normal",
      },
      {
        id: "overdue-tasks",
        title: "Overdue tasks",
        detail: "2 overdue",
        href: "/dashboard/tasks",
        priority: 7,
        tone: "urgent",
      },
    ];
    const filtered = filterBriefingAlertsForRolePack(alerts, "manager");
    expect(filtered.some((alert) => alert.id.includes("pilot"))).toBe(false);
    expect(filtered.some((alert) => alert.id === "overdue-tasks")).toBe(true);
  });

  it("filters ranked actions by role for kitchen pack", () => {
    const actions: OwnerDailyBriefingRankedAction[] = [
      {
        id: "kitchen-1",
        title: "KDS",
        reason: "Queue",
        severity: "normal",
        ownerRole: "kitchen",
        href: "/dashboard/kitchen",
        status: "open",
        unblockCondition: "Bump tickets",
        priority: 1,
        ctaLabel: "Open KDS",
        tone: "normal",
      },
      {
        id: "owner-1",
        title: "Pilot",
        reason: "Gap",
        severity: "high",
        ownerRole: "owner",
        href: "/dashboard/implementation",
        status: "open",
        unblockCondition: "Fix pilot",
        priority: 2,
        ctaLabel: "Open",
        tone: "normal",
      },
    ];
    const filtered = filterBriefingActionsForRolePack(actions, "kitchen");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.ownerRole).toBe("kitchen");
  });

  it("shows briefing for kitchen and cashier personas", () => {
    expect(
      shouldShowBriefingForPersona({ workspaceRole: "STAFF", persona: "kitchen" }),
    ).toBe(true);
    expect(
      shouldShowBriefingForPersona({ workspaceRole: "STAFF", persona: "cashier" }),
    ).toBe(true);
  });

  it("hides production calendar lane for cashier pack", () => {
    expect(shouldShowBriefingProductionCalendarLane("cashier")).toBe(false);
    expect(shouldShowBriefingProductionCalendarLane("kitchen")).toBe(true);
  });

  it("shows pilot readiness lane for owner only", () => {
    expect(shouldShowBriefingPilotReadinessLane("owner")).toBe(true);
    expect(shouldShowBriefingPilotReadinessLane("manager")).toBe(false);
  });

  it("shows integration health lane for owner and manager", () => {
    expect(shouldShowBriefingIntegrationHealthLane("owner")).toBe(true);
    expect(shouldShowBriefingIntegrationHealthLane("manager")).toBe(true);
    expect(shouldShowBriefingIntegrationHealthLane("kitchen")).toBe(false);
  });

  it("labels each role pack for UI headline", () => {
    expect(BRIEFING_ROLE_PACK_LABEL.owner).toContain("Owner");
    expect(BRIEFING_ROLE_PACK_LABEL.kitchen).toContain("Kitchen");
  });
});
