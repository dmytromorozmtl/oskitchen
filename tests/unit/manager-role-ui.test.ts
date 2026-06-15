import { describe, expect, it } from "vitest";

import { canAccessManagerRoleUi } from "@/lib/roles/manager-ui-access";
import {
  buildManagerRoleKpi,
  buildManagerRoleKpisFromExecutive,
  buildManagerRoleUiSnapshot,
  MANAGER_ROLE_SHORTCUTS,
} from "@/lib/roles/manager-ui-builders";
import {
  MANAGER_ROLE_UI_PACK,
  MANAGER_ROLE_UI_PATH,
  MANAGER_ROLE_UI_POLICY_ID,
  MANAGER_ROLE_UI_SERVICE,
} from "@/lib/roles/manager-ui-policy";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";

describe("Manager Role UI", () => {
  it("locks policy constants", () => {
    expect(MANAGER_ROLE_UI_POLICY_ID).toBe("role-ui-manager-v1");
    expect(MANAGER_ROLE_UI_SERVICE).toBe("services/roles/manager-ui-service.ts");
    expect(MANAGER_ROLE_UI_PATH).toBe("/dashboard/roles/manager");
    expect(MANAGER_ROLE_UI_PACK).toBe("manager");
  });

  it("defines manager shift shortcuts", () => {
    expect(MANAGER_ROLE_SHORTCUTS.length).toBeGreaterThanOrEqual(6);
    expect(MANAGER_ROLE_SHORTCUTS.some((s) => s.href === "/dashboard/kitchen/manager")).toBe(true);
    expect(MANAGER_ROLE_SHORTCUTS.some((s) => s.href === "/dashboard/today")).toBe(true);
  });

  it("gates manager role UI access", () => {
    expect(
      canAccessManagerRoleUi({
        workspaceRole: "OWNER",
        granted: defaultPermissionsForWorkspaceRole("OWNER"),
      }),
    ).toBe(true);
    expect(
      canAccessManagerRoleUi({
        workspaceRole: "STAFF",
        granted: new Set(["kitchen.view"]),
      }),
    ).toBe(true);
    expect(
      canAccessManagerRoleUi({
        workspaceRole: "STAFF",
        granted: new Set(),
      }),
    ).toBe(false);
  });

  it("builds KPIs and manager role snapshot", () => {
    const kpis = buildManagerRoleKpisFromExecutive({
      orderCount: 180,
      lateOrderCount: 4,
      productionCompletionRate: 0.88,
      packingCompletionRate: 0.91,
      deliveryCompletionRate: 0.86,
    });
    expect(kpis).toHaveLength(4);
    expect(kpis[1].value).toBe("4");

    const snapshot = buildManagerRoleUiSnapshot({
      workspaceLabel: "Shift Kitchen",
      kpis,
      heroTiles: [],
      topActions: [],
      nextAction: {
        id: "next-1",
        title: "Clear packing backlog",
        detail: "12 items waiting",
        href: "/dashboard/packing",
        ctaLabel: "Open packing",
        tone: "urgent",
      },
      summary: {
        attentionTileCount: 2,
        alertCount: 1,
        readinessOverall: 82,
      },
      analyzedAt: new Date("2026-06-05T12:00:00Z"),
    });

    expect(snapshot.policyId).toBe(MANAGER_ROLE_UI_POLICY_ID);
    expect(snapshot.basePath).toBe(MANAGER_ROLE_UI_PATH);
    expect(snapshot.rolePackLabel).toBe("Manager command center");
    expect(snapshot.summary.shortcutCount).toBe(MANAGER_ROLE_SHORTCUTS.length);
    expect(snapshot.generatedAtIso).toBe("2026-06-05T12:00:00.000Z");
    expect(buildManagerRoleKpi({ id: "x", label: "Test", value: "1" }).id).toBe("x");
  });
});
