import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingAlerts,
  buildOwnerDailyBriefingTiles,
  pickOwnerDailyBriefingHeroTiles,
  pickOwnerDailyBriefingNextAction,
  pickOwnerDailyBriefingTopActions,
} from "@/lib/briefing/owner-daily-briefing-era19";
import { OWNER_DAILY_BRIEFING_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-era19-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

const baseInput = {
  kpis: {
    ordersToday: 12,
    ordersDueToday: 4,
    activeOrders: 8,
    blockedOrdersApprox: 0,
    posKitchenQueueToday: 2,
    posTransactionsToday: 0,
    productionWorkOpen: 3,
    packingQueueOpen: 1,
    revenueToday: 1250,
    errorIntegrations: 0,
    webhooksNeedingAttention: 0,
    failedExternalOrders: 0,
    openSupportTickets: 0,
    overdueTasks: 0,
  },
  blockers: [] as const,
  readinessOverall: 72,
  integrationOverall: "healthy" as const,
  integrationHeadline: "Channels look healthy.",
  pilotAttentionCount: 0,
  pilotHasUrgent: false,
  ssoEntitlementEnabled: false,
  ssoActive: false,
  ssoConfigured: false,
  lowStockCount: 0,
  ingredientParConfigured: true,
  labor: {
    available: true,
    activeStaff: 3,
    scheduledShiftsToday: 2,
    laborPercent: 28,
    status: "ON_TRACK" as const,
  },
};

describe("owner daily briefing era19", () => {
  it("locks era19 briefing policy id", () => {
    expect(OWNER_DAILY_BRIEFING_ERA19_POLICY_ID).toBe("era19-owner-daily-briefing-v1");
  });

  it("builds operational tiles from real signal input", () => {
    const tiles = buildOwnerDailyBriefingTiles(baseInput);
    expect(tiles.some((tile) => tile.id === "orders-today" && tile.value === "12")).toBe(true);
    expect(tiles.some((tile) => tile.id === "kds-pressure" && tile.value === "5")).toBe(true);
    expect(tiles.some((tile) => tile.id === "revenue-snapshot" && tile.value === "$1,250")).toBe(
      true,
    );
  });

  it("marks stuck orders and integration down as attention tiles", () => {
    const tiles = buildOwnerDailyBriefingTiles({
      ...baseInput,
      kpis: { ...baseInput.kpis, blockedOrdersApprox: 3 },
      integrationOverall: "down",
      integrationHeadline: "Integration errors detected.",
    });
    const stuck = tiles.find((tile) => tile.id === "stuck-orders");
    const integrations = tiles.find((tile) => tile.id === "integration-health");
    expect(stuck?.tone).toBe("attention");
    expect(integrations?.tone).toBe("attention");
  });

  it("shows SSO as not configured when entitlement is off", () => {
    const tiles = buildOwnerDailyBriefingTiles(baseInput);
    const sso = tiles.find((tile) => tile.id === "sso-proof");
    expect(sso?.availability).toBe("not_configured");
    expect(sso?.value).toBe("Not entitled");
  });

  it("prioritizes blockers for next best action", () => {
    const blockers = [
      {
        id: "integrations",
        title: "Integration errors",
        detail: "1 connection in error state.",
        href: "/dashboard/sales-channels/health",
        priority: 12,
      },
    ];
    const kpis = {
      ...baseInput.kpis,
      packingQueueOpen: 0,
      productionWorkOpen: 0,
      posKitchenQueueToday: 0,
    };
    const alerts = buildOwnerDailyBriefingAlerts({
      blockers,
      pilotAlerts: [],
      kpis,
    });
    const next = pickOwnerDailyBriefingNextAction({
      blockers,
      alerts,
      readinessOverall: 72,
      kpis,
      pilotAttentionCount: 0,
      integrationOverall: "healthy",
      lowStockCount: 0,
    });
    expect(next.title).toBe("Integration errors");
    expect(next.tone).toBe("urgent");
    expect(next.href).toBe("/dashboard/sales-channels/health");
  });

  it("falls back to go-live when setup is incomplete and shift is calm", () => {
    const next = pickOwnerDailyBriefingNextAction({
      blockers: [],
      alerts: [],
      readinessOverall: 55,
      kpis: {
        ...baseInput.kpis,
        ordersToday: 0,
        activeOrders: 0,
        blockedOrdersApprox: 0,
        packingQueueOpen: 0,
        productionWorkOpen: 0,
        posKitchenQueueToday: 0,
      },
    });
    expect(next.href).toBe(LAUNCH_WIZARD_ROUTE);
    expect(next.title).toContain("workspace setup");
  });

  it("limits hero tiles to attention plus core operational categories", () => {
    const tiles = buildOwnerDailyBriefingTiles({
      ...baseInput,
      kpis: { ...baseInput.kpis, blockedOrdersApprox: 2 },
    });
    const hero = pickOwnerDailyBriefingHeroTiles(tiles);
    expect(hero.length).toBeLessThanOrEqual(8);
    expect(hero.some((tile) => tile.id === "stuck-orders")).toBe(true);
  });

  it("returns up to three ranked actions with severity and unblock condition", () => {
    const blockers = [
      {
        id: "integrations",
        title: "Integration errors",
        detail: "1 connection in error state.",
        href: "/dashboard/integration-health",
        priority: 12,
      },
    ];
    const alerts = buildOwnerDailyBriefingAlerts({
      blockers,
      pilotAlerts: [],
      kpis: baseInput.kpis,
    });
    const top = pickOwnerDailyBriefingTopActions({
      blockers,
      alerts,
      readinessOverall: 72,
      kpis: baseInput.kpis,
      pilotAttentionCount: 0,
      integrationOverall: "down",
      lowStockCount: 0,
    });
    expect(top.length).toBeLessThanOrEqual(3);
    expect(top.some((action) => action.severity === "critical")).toBe(true);
    expect(top[0]?.unblockCondition.length).toBeGreaterThan(0);
    expect(top[0]?.ownerRole).toBeTruthy();
  });

  it("integration health tile links to integration health center", () => {
    const tiles = buildOwnerDailyBriefingTiles(baseInput);
    const integration = tiles.find((tile) => tile.id === "integration-health");
    expect(integration?.href).toBe("/dashboard/integration-health");
  });
});
