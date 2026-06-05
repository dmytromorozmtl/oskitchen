import { describe, expect, it } from "vitest";

import {
  buildFranchiseComplianceChecks,
  buildFranchiseRoyaltyInsights,
  buildFranchiseSuiteDashboardV2,
  buildFranchiseUnitRollout,
  resolveFranchiseRolloutPhase,
} from "@/lib/enterprise/franchise-suite-2-builders";
import { FRANCHISE_SUITE_2_POLICY_ID } from "@/lib/enterprise/franchise-suite-2-policy";
import type { FranchiseUnitRow } from "@/lib/enterprise/franchise-types";

function unit(partial: Partial<FranchiseUnitRow> & Pick<FranchiseUnitRow, "franchiseId" | "franchiseName">): FranchiseUnitRow {
  return {
    franchiseeId: "u1",
    status: "ACTIVE",
    royaltyRate: 5,
    totalRevenue: 10000,
    royaltyAmount: 500,
    menuCompliancePercent: 90,
    missingMenuItems: ["Cola"],
    brandStatus: "review",
    ...partial,
  };
}

describe("franchise suite 2.0 (ENT-64)", () => {
  it("locks ENT-64 policy id", () => {
    expect(FRANCHISE_SUITE_2_POLICY_ID).toBe("franchise-suite-2-ent64-v1");
  });

  it("builds four-point compliance checklist", () => {
    const checks = buildFranchiseComplianceChecks({
      unit: unit({ franchiseId: "f1", franchiseName: "A", menuCompliancePercent: 85 }),
      hasBrandKit: true,
    });
    expect(checks).toHaveLength(4);
    expect(checks.find((c) => c.id === "menu_standards")?.passed).toBe(true);
    expect(checks.find((c) => c.id === "royalty_reporting")?.passed).toBe(true);
  });

  it("resolves rollout phases from compliance and revenue", () => {
    const certifiedChecks = buildFranchiseComplianceChecks({
      unit: unit({
        franchiseId: "f1",
        franchiseName: "Cert",
        menuCompliancePercent: 98,
        brandStatus: "compliant",
      }),
      hasBrandKit: true,
    });
    expect(resolveFranchiseRolloutPhase({ unit: unit({ franchiseId: "f1", franchiseName: "Cert", menuCompliancePercent: 98, brandStatus: "compliant" }), checks: certifiedChecks })).toBe("certified");

    const discoveryChecks = buildFranchiseComplianceChecks({
      unit: unit({
        franchiseId: "f2",
        franchiseName: "New",
        menuCompliancePercent: 0,
        totalRevenue: 0,
        royaltyAmount: 0,
        brandStatus: "non_compliant",
      }),
      hasBrandKit: false,
    });
    expect(
      resolveFranchiseRolloutPhase({
        unit: unit({
          franchiseId: "f2",
          franchiseName: "New",
          menuCompliancePercent: 0,
          totalRevenue: 0,
          royaltyAmount: 0,
        }),
        checks: discoveryChecks,
      }),
    ).toBe("discovery");
  });

  it("computes royalty insights across units", () => {
    const insights = buildFranchiseRoyaltyInsights({
      units: [
        unit({ franchiseId: "a", franchiseName: "A", royaltyAmount: 300, totalRevenue: 6000 }),
        unit({ franchiseId: "b", franchiseName: "B", royaltyAmount: 700, totalRevenue: 14000 }),
      ],
      totalRoyalties: 1000,
    });
    expect(insights.totalRevenue).toBe(20000);
    expect(insights.effectiveRoyaltyRatePct).toBe(5);
    expect(insights.topRoyaltyUnitName).toBe("B");
    expect(insights.unitsWithRevenue).toBe(2);
  });

  it("builds v2 dashboard slice with rollout pipeline counts", () => {
    const rollout = buildFranchiseUnitRollout({
      unit: unit({ franchiseId: "f1", franchiseName: "Downtown", menuCompliancePercent: 70, totalRevenue: 5000 }),
      hasBrandKit: true,
    });
    expect(rollout.phase).toBe("go_live");
    expect(rollout.progressPercent).toBe(75);

    const v2 = buildFranchiseSuiteDashboardV2({
      units: [unit({ franchiseId: "f1", franchiseName: "Downtown" })],
      totalRoyalties: 500,
      hasBrandKit: true,
    });
    expect(v2.policyId).toBe("franchise-suite-2-ent64-v1");
    expect(v2.unitRollouts).toHaveLength(1);
    expect(v2.compliancePassRate).toBeGreaterThan(0);
  });
});
