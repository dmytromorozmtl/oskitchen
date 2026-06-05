import { describe, expect, it } from "vitest";

import {
  buildOwnerRoleKpi,
  buildOwnerRoleKpisFromExecutive,
  buildOwnerRoleUiSnapshot,
  OWNER_ROLE_SHORTCUTS,
} from "@/lib/roles/owner-ui-builders";
import {
  OWNER_ROLE_UI_PACK,
  OWNER_ROLE_UI_PATH,
  OWNER_ROLE_UI_POLICY_ID,
  OWNER_ROLE_UI_SERVICE,
} from "@/lib/roles/owner-ui-policy";

describe("Owner Role UI", () => {
  it("locks policy constants", () => {
    expect(OWNER_ROLE_UI_POLICY_ID).toBe("role-ui-owner-v1");
    expect(OWNER_ROLE_UI_SERVICE).toBe("services/roles/owner-ui-service.ts");
    expect(OWNER_ROLE_UI_PATH).toBe("/dashboard/roles/owner");
    expect(OWNER_ROLE_UI_PACK).toBe("owner");
  });

  it("defines owner leadership shortcuts", () => {
    expect(OWNER_ROLE_SHORTCUTS.length).toBeGreaterThanOrEqual(6);
    expect(OWNER_ROLE_SHORTCUTS.some((s) => s.href === "/dashboard/executive")).toBe(true);
    expect(OWNER_ROLE_SHORTCUTS.some((s) => s.href === "/dashboard/analytics/suite")).toBe(true);
  });

  it("builds KPIs and owner role snapshot", () => {
    const kpis = buildOwnerRoleKpisFromExecutive({
      grossRevenue: 42000,
      orderCount: 312,
      activeCustomerCount: 89,
      productionCompletionRate: 0.92,
    });
    expect(kpis).toHaveLength(4);
    expect(kpis[0].value).toContain("$");

    const snapshot = buildOwnerRoleUiSnapshot({
      workspaceLabel: "Demo Kitchen",
      kpis,
      heroTiles: [
        {
          id: "revenue-snapshot",
          category: "revenue",
          label: "Revenue today",
          value: "$1,240",
          detail: "Net after cancellations",
          whyItMatters: "Cash flow signal",
          href: "/dashboard/analytics/revenue",
          availability: "available",
          linkState: "operational",
          tone: "neutral",
          priority: 1,
        },
      ],
      topActions: [],
      nextAction: {
        id: "next-1",
        title: "Review integration health",
        detail: "One channel needs attention",
        href: "/dashboard/integration-health/live",
        ctaLabel: "Open health",
        tone: "normal",
      },
      summary: {
        attentionTileCount: 1,
        alertCount: 0,
        readinessOverall: 78,
      },
      analyzedAt: new Date("2026-06-05T12:00:00Z"),
    });

    expect(snapshot.policyId).toBe(OWNER_ROLE_UI_POLICY_ID);
    expect(snapshot.basePath).toBe(OWNER_ROLE_UI_PATH);
    expect(snapshot.rolePackLabel).toBe("Owner command center");
    expect(snapshot.summary.shortcutCount).toBe(OWNER_ROLE_SHORTCUTS.length);
    expect(snapshot.generatedAtIso).toBe("2026-06-05T12:00:00.000Z");
    expect(buildOwnerRoleKpi({ id: "x", label: "Test", value: "1" }).id).toBe("x");
  });
});
