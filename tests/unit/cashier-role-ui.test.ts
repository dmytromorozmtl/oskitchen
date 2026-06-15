import { describe, expect, it } from "vitest";

import { canAccessCashierRoleUi } from "@/lib/roles/cashier-ui-access";
import {
  buildCashierRoleKpi,
  buildCashierRoleKpisFromToday,
  buildCashierRoleUiSnapshot,
  CASHIER_ROLE_SHORTCUTS,
} from "@/lib/roles/cashier-ui-builders";
import {
  CASHIER_ROLE_UI_PACK,
  CASHIER_ROLE_UI_PATH,
  CASHIER_ROLE_UI_POLICY_ID,
  CASHIER_ROLE_UI_SERVICE,
} from "@/lib/roles/cashier-ui-policy";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";

describe("Cashier Role UI", () => {
  it("locks policy constants", () => {
    expect(CASHIER_ROLE_UI_POLICY_ID).toBe("role-ui-cashier-v1");
    expect(CASHIER_ROLE_UI_SERVICE).toBe("services/roles/cashier-ui-service.ts");
    expect(CASHIER_ROLE_UI_PATH).toBe("/dashboard/roles/cashier");
    expect(CASHIER_ROLE_UI_PACK).toBe("cashier");
  });

  it("defines cashier register shortcuts", () => {
    expect(CASHIER_ROLE_SHORTCUTS.length).toBeGreaterThanOrEqual(6);
    expect(CASHIER_ROLE_SHORTCUTS.some((s) => s.href === "/dashboard/pos/terminal")).toBe(true);
    expect(CASHIER_ROLE_SHORTCUTS.some((s) => s.href === "/dashboard/pos/cash")).toBe(true);
  });

  it("gates cashier role UI access", () => {
    expect(
      canAccessCashierRoleUi({
        workspaceRole: "OWNER",
        granted: defaultPermissionsForWorkspaceRole("OWNER"),
      }),
    ).toBe(true);
    expect(
      canAccessCashierRoleUi({
        workspaceRole: "STAFF",
        granted: new Set(["pos.access"]),
      }),
    ).toBe(true);
    expect(
      canAccessCashierRoleUi({
        workspaceRole: "STAFF",
        granted: new Set(),
      }),
    ).toBe(false);
  });

  it("builds KPIs and cashier role snapshot", () => {
    const kpis = buildCashierRoleKpisFromToday({
      posTransactionsToday: 42,
      ordersToday: 38,
      openPosShifts: 2,
      revenueToday: 1260.5,
    });
    expect(kpis).toHaveLength(4);
    expect(kpis[0].value).toBe("42");
    expect(kpis[2].value).toBe("2");
    expect(kpis[3].value).toContain("$");

    const snapshot = buildCashierRoleUiSnapshot({
      workspaceLabel: "Front Counter",
      kpis,
      heroTiles: [],
      topActions: [],
      nextAction: {
        id: "next-1",
        title: "Open POS shift",
        detail: "No active register",
        href: "/dashboard/pos",
        ctaLabel: "Open shift",
        tone: "normal",
      },
      summary: {
        attentionTileCount: 0,
        alertCount: 0,
        readinessOverall: 95,
      },
      analyzedAt: new Date("2026-06-05T12:00:00Z"),
    });

    expect(snapshot.policyId).toBe(CASHIER_ROLE_UI_POLICY_ID);
    expect(snapshot.basePath).toBe(CASHIER_ROLE_UI_PATH);
    expect(snapshot.rolePackLabel).toBe("Cashier command center");
    expect(snapshot.summary.shortcutCount).toBe(CASHIER_ROLE_SHORTCUTS.length);
    expect(snapshot.generatedAtIso).toBe("2026-06-05T12:00:00.000Z");
    expect(buildCashierRoleKpi({ id: "x", label: "Test", value: "1" }).id).toBe("x");
  });
});
