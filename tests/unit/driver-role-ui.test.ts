import { describe, expect, it } from "vitest";

import { canAccessDriverRoleUi } from "@/lib/roles/driver-ui-access";
import {
  buildDriverRoleKpi,
  buildDriverRoleKpis,
  buildDriverRoleUiSnapshot,
  DRIVER_ROLE_SHORTCUTS,
} from "@/lib/roles/driver-ui-builders";
import {
  DRIVER_ROLE_UI_HEADLINE,
  DRIVER_ROLE_UI_LABEL,
  DRIVER_ROLE_UI_PACK,
  DRIVER_ROLE_UI_PATH,
  DRIVER_ROLE_UI_POLICY_ID,
  DRIVER_ROLE_UI_SERVICE,
} from "@/lib/roles/driver-ui-policy";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";

const ROUTE_KPIS = {
  deliveryOrdersToday: 18,
  routesPlanned: 3,
  stopsReady: 12,
  stopsNotPacked: 2,
  outForDelivery: 5,
  completedStops: 8,
  failedStops: 1,
  routesNeedingAttention: 1,
};

describe("Driver Role UI", () => {
  it("locks policy constants", () => {
    expect(DRIVER_ROLE_UI_POLICY_ID).toBe("role-ui-driver-v1");
    expect(DRIVER_ROLE_UI_SERVICE).toBe("services/roles/driver-ui-service.ts");
    expect(DRIVER_ROLE_UI_PATH).toBe("/dashboard/roles/driver");
    expect(DRIVER_ROLE_UI_PACK).toBe("driver");
    expect(DRIVER_ROLE_UI_LABEL).toBe("Driver command center");
    expect(DRIVER_ROLE_UI_HEADLINE).toContain("Route focus");
  });

  it("defines driver delivery shortcuts", () => {
    expect(DRIVER_ROLE_SHORTCUTS.length).toBeGreaterThanOrEqual(6);
    expect(DRIVER_ROLE_SHORTCUTS.some((s) => s.href === "/dashboard/routes/driver")).toBe(true);
    expect(DRIVER_ROLE_SHORTCUTS.some((s) => s.href === "/driver")).toBe(true);
  });

  it("gates driver role UI access", () => {
    expect(
      canAccessDriverRoleUi({
        workspaceRole: "OWNER",
        granted: defaultPermissionsForWorkspaceRole("OWNER"),
      }),
    ).toBe(true);
    expect(
      canAccessDriverRoleUi({
        workspaceRole: "STAFF",
        granted: new Set(["routes.manage"]),
      }),
    ).toBe(true);
    expect(
      canAccessDriverRoleUi({
        workspaceRole: "STAFF",
        granted: new Set(),
      }),
    ).toBe(false);
  });

  it("builds KPIs and driver role snapshot with route priorities", () => {
    const kpis = buildDriverRoleKpis({
      routeKpis: ROUTE_KPIS,
      onTimeRate: 0.91,
    });
    expect(kpis).toHaveLength(4);
    expect(kpis[0].value).toBe("3");

    const snapshot = buildDriverRoleUiSnapshot({
      workspaceLabel: "Dispatch Hub",
      routeKpis: ROUTE_KPIS,
      onTimeRate: 0.91,
      analyzedAt: new Date("2026-06-05T12:00:00Z"),
    });

    expect(snapshot.policyId).toBe(DRIVER_ROLE_UI_POLICY_ID);
    expect(snapshot.basePath).toBe(DRIVER_ROLE_UI_PATH);
    expect(snapshot.rolePackLabel).toBe("Driver command center");
    expect(snapshot.nextAction.title).toBe("Complete packing handoff");
    expect(snapshot.topActions.length).toBeGreaterThan(0);
    expect(snapshot.heroTiles).toHaveLength(4);
    expect(snapshot.summary.shortcutCount).toBe(DRIVER_ROLE_SHORTCUTS.length);
    expect(snapshot.generatedAtIso).toBe("2026-06-05T12:00:00.000Z");
    expect(buildDriverRoleKpi({ id: "x", label: "Test", value: "1" }).id).toBe("x");
  });
});
