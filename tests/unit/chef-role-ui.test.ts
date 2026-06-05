import { describe, expect, it } from "vitest";

import { canAccessChefRoleUi } from "@/lib/roles/chef-ui-access";
import {
  buildChefRoleKpi,
  buildChefRoleKpisFromProduction,
  buildChefRoleUiSnapshot,
  CHEF_ROLE_SHORTCUTS,
} from "@/lib/roles/chef-ui-builders";
import {
  CHEF_ROLE_UI_LABEL,
  CHEF_ROLE_UI_PACK,
  CHEF_ROLE_UI_PATH,
  CHEF_ROLE_UI_POLICY_ID,
  CHEF_ROLE_UI_SERVICE,
} from "@/lib/roles/chef-ui-policy";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";

describe("Chef Role UI", () => {
  it("locks policy constants", () => {
    expect(CHEF_ROLE_UI_POLICY_ID).toBe("role-ui-chef-v1");
    expect(CHEF_ROLE_UI_SERVICE).toBe("services/roles/chef-ui-service.ts");
    expect(CHEF_ROLE_UI_PATH).toBe("/dashboard/roles/chef");
    expect(CHEF_ROLE_UI_PACK).toBe("kitchen");
    expect(CHEF_ROLE_UI_LABEL).toBe("Chef command center");
  });

  it("defines chef kitchen shortcuts", () => {
    expect(CHEF_ROLE_SHORTCUTS.length).toBeGreaterThanOrEqual(6);
    expect(CHEF_ROLE_SHORTCUTS.some((s) => s.href === "/dashboard/kitchen")).toBe(true);
    expect(CHEF_ROLE_SHORTCUTS.some((s) => s.href === "/dashboard/kitchen/production")).toBe(true);
  });

  it("gates chef role UI access", () => {
    expect(
      canAccessChefRoleUi({
        workspaceRole: "OWNER",
        granted: defaultPermissionsForWorkspaceRole("OWNER"),
      }),
    ).toBe(true);
    expect(
      canAccessChefRoleUi({
        workspaceRole: "STAFF",
        granted: new Set(["kitchen.view"]),
      }),
    ).toBe(true);
    expect(
      canAccessChefRoleUi({
        workspaceRole: "STAFF",
        granted: new Set(),
      }),
    ).toBe(false);
  });

  it("builds KPIs and chef role snapshot", () => {
    const kpis = buildChefRoleKpisFromProduction({
      completionRate: 0.91,
      delayedBatches: 2,
      completedItems: 140,
      totalItems: 154,
      packingCompletionRate: 0.87,
    });
    expect(kpis).toHaveLength(4);
    expect(kpis[1].value).toBe("2");
    expect(kpis[2].value).toBe("140 / 154");

    const snapshot = buildChefRoleUiSnapshot({
      workspaceLabel: "Line Kitchen",
      kpis,
      heroTiles: [],
      topActions: [],
      nextAction: {
        id: "next-1",
        title: "Bump overdue tickets",
        detail: "3 tickets past SLA",
        href: "/dashboard/kitchen",
        ctaLabel: "Open KDS",
        tone: "urgent",
      },
      summary: {
        attentionTileCount: 1,
        alertCount: 0,
        readinessOverall: 88,
      },
      analyzedAt: new Date("2026-06-05T12:00:00Z"),
    });

    expect(snapshot.policyId).toBe(CHEF_ROLE_UI_POLICY_ID);
    expect(snapshot.basePath).toBe(CHEF_ROLE_UI_PATH);
    expect(snapshot.rolePackLabel).toBe("Chef command center");
    expect(snapshot.summary.shortcutCount).toBe(CHEF_ROLE_SHORTCUTS.length);
    expect(snapshot.generatedAtIso).toBe("2026-06-05T12:00:00.000Z");
    expect(buildChefRoleKpi({ id: "x", label: "Test", value: "1" }).id).toBe("x");
  });
});
