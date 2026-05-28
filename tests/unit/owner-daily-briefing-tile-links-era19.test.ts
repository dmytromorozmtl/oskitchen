import { describe, expect, it } from "vitest";

import {
  buildOwnerDailyBriefingTiles,
} from "@/lib/briefing/owner-daily-briefing-era19";
import {
  auditBriefingTileLinks,
  BRIEFING_TILE_LINK_DEFINITIONS,
  enrichBriefingTilesLinks,
  isBriefingTileAllowedForRolePack,
  normalizeBriefingOperationalHref,
  resolveBriefingTileCanonicalHref,
  resolveBriefingTileLinkState,
} from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import { filterBriefingTilesForRolePack } from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

const baseInput = {
  kpis: {
    ordersToday: 12,
    ordersDueToday: 4,
    activeOrders: 8,
    blockedOrdersApprox: 2,
    posKitchenQueueToday: 2,
    posTransactionsToday: 5,
    productionWorkOpen: 3,
    packingQueueOpen: 1,
    revenueToday: 1250,
    errorIntegrations: 1,
    webhooksNeedingAttention: 0,
    failedExternalOrders: 0,
    openSupportTickets: 0,
    overdueTasks: 0,
  },
  blockers: [] as const,
  readinessOverall: 72,
  integrationOverall: "degraded" as const,
  integrationHeadline: "Integrations need attention.",
  pilotAttentionCount: 2,
  pilotHasUrgent: true,
  ssoEntitlementEnabled: true,
  ssoActive: false,
  ssoConfigured: false,
  lowStockCount: 1,
  ingredientParConfigured: true,
  labor: {
    available: true,
    activeStaff: 3,
    scheduledShiftsToday: 2,
    laborPercent: 28,
    status: "ON_TRACK" as const,
  },
  posShift: { openCount: 1 },
};

describe("owner-daily-briefing-tile-links-era19", () => {
  it("defines canonical hrefs for every briefing tile id", () => {
    const tiles = buildOwnerDailyBriefingTiles(baseInput);
    for (const tile of tiles) {
      expect(tile.href.startsWith("/dashboard")).toBe(true);
      expect(tile.whyItMatters.length).toBeGreaterThan(10);
      expect(tile.linkState).toBeTruthy();
    }
    const audit = auditBriefingTileLinks(tiles);
    expect(audit.valid).toBe(true);
    expect(audit.issues).toEqual([]);
  });

  it("routes pilot and go-live tiles to launch wizard", () => {
    const tiles = buildOwnerDailyBriefingTiles(baseInput);
    expect(tiles.find((tile) => tile.id === "pilot-status")?.href).toBe(LAUNCH_WIZARD_ROUTE);
    expect(tiles.find((tile) => tile.id === "go-live-readiness")?.href).toBe(LAUNCH_WIZARD_ROUTE);
  });

  it("routes low-stock setup to inventory when par levels are missing", () => {
    const tiles = buildOwnerDailyBriefingTiles({
      ...baseInput,
      ingredientParConfigured: false,
      lowStockCount: 0,
    });
    const lowStock = tiles.find((tile) => tile.id === "low-stock");
    expect(lowStock?.availability).toBe("not_configured");
    expect(lowStock?.href).toBe("/dashboard/inventory");
    expect(lowStock?.linkState).toBe("setup_needed");
  });

  it("marks attention tiles as blocked link state", () => {
    const tiles = buildOwnerDailyBriefingTiles(baseInput);
    const stuck = tiles.find((tile) => tile.id === "stuck-orders");
    expect(stuck?.linkState).toBe("blocked");
    expect(stuck?.href).toBe("/dashboard/order-hub");
  });

  it("normalizes legacy implementation and go-live action hrefs", () => {
    expect(normalizeBriefingOperationalHref("/dashboard/implementation")).toBe(LAUNCH_WIZARD_ROUTE);
    expect(normalizeBriefingOperationalHref("/dashboard/go-live")).toBe(LAUNCH_WIZARD_ROUTE);
    expect(normalizeBriefingOperationalHref("/dashboard/order-hub")).toBe("/dashboard/order-hub");
  });

  it("keeps role packs aligned with tile link definitions", () => {
    for (const pack of ["owner", "manager", "kitchen", "cashier"] as const) {
      const tiles = filterBriefingTilesForRolePack(buildOwnerDailyBriefingTiles(baseInput), pack);
      for (const tile of tiles) {
        expect(isBriefingTileAllowedForRolePack(tile.id, pack)).toBe(true);
      }
    }
    expect(isBriefingTileAllowedForRolePack("pilot-status", "cashier")).toBe(false);
    expect(isBriefingTileAllowedForRolePack("pos-open-shifts", "owner")).toBe(false);
  });

  it("preserves dynamic production calendar href while enriching metadata", () => {
    const dynamicHref = "/dashboard/production/calendar?week=2026-05-26#day-2026-05-28";
    const [tile] = enrichBriefingTilesLinks([
      {
        id: "production-calendar-today",
        category: "production",
        label: "Production calendar",
        value: "2",
        detail: "1 overdue · 1 due today",
        href: dynamicHref,
        availability: "available",
        tone: "attention",
        priority: 4,
      },
    ]);
    expect(tile.href).toBe(dynamicHref);
    expect(tile.whyItMatters).toBe(BRIEFING_TILE_LINK_DEFINITIONS["production-calendar-today"].whyItMatters);
  });

  it("resolves canonical href from registry with fallback", () => {
    expect(
      resolveBriefingTileCanonicalHref("integration-health", "/legacy", "available"),
    ).toBe("/dashboard/integration-health");
    expect(resolveBriefingTileLinkState({ availability: "unavailable", tone: "neutral", value: "—" })).toBe(
      "blocked",
    );
  });
});
