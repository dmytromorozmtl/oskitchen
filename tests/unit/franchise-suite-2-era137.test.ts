import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  FRANCHISE_SUITE_2_ERA137_CANONICAL_POLICY_ID,
  FRANCHISE_SUITE_2_ERA137_CAPABILITIES,
  FRANCHISE_SUITE_2_ERA137_COMPLIANCE_CHECKS,
  FRANCHISE_SUITE_2_ERA137_POLICY_ID,
  FRANCHISE_SUITE_2_ERA137_ROLLOUT_PHASES,
  FRANCHISE_SUITE_2_ERA137_ROUTE,
  FRANCHISE_SUITE_2_ERA137_SERVICE,
  FRANCHISE_SUITE_2_ERA137_SUMMARY_ARTIFACT,
  FRANCHISE_SUITE_2_ERA137_WIRING_PATHS,
} from "@/lib/enterprise/franchise-suite-2-era137-policy";
import {
  auditFranchiseSuite2SmokeWiring,
  buildFranchiseSuite2SmokeEra137Summary,
  resolveFranchiseSuite2SmokeEra137ProofStatus,
} from "@/lib/enterprise/franchise-suite-2-smoke-summary";
import {
  buildFranchiseComplianceChecks,
  buildFranchiseSuiteDashboardV2,
  resolveFranchiseRolloutPhase,
} from "@/lib/enterprise/franchise-suite-2-builders";
import { FRANCHISE_SUITE_2_POLICY_ID } from "@/lib/enterprise/franchise-suite-2-policy";

const ROOT = process.cwd();

const SAMPLE_UNIT = {
  franchiseId: "f1",
  franchiseName: "Downtown",
  franchiseeId: "u1",
  status: "ACTIVE" as const,
  royaltyRate: 5,
  totalRevenue: 10000,
  royaltyAmount: 500,
  menuCompliancePercent: 90,
  missingMenuItems: [] as string[],
  brandStatus: "compliant" as const,
};

describe("franchise suite 2 era137", () => {
  it("locks era137 policy and artifact path", () => {
    expect(FRANCHISE_SUITE_2_ERA137_POLICY_ID).toBe("era137-franchise-suite-2-v1");
    expect(FRANCHISE_SUITE_2_ERA137_SUMMARY_ARTIFACT).toBe(
      "artifacts/franchise-suite-2-smoke-summary.json",
    );
    expect(FRANCHISE_SUITE_2_ERA137_ROUTE).toBe("/dashboard/enterprise/franchise");
    expect(FRANCHISE_SUITE_2_ERA137_ROLLOUT_PHASES).toHaveLength(4);
    expect(FRANCHISE_SUITE_2_ERA137_COMPLIANCE_CHECKS).toHaveLength(4);
    expect(FRANCHISE_SUITE_2_ERA137_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era137 with canonical franchise suite 2 policy", () => {
    expect(FRANCHISE_SUITE_2_ERA137_CANONICAL_POLICY_ID).toBe(FRANCHISE_SUITE_2_POLICY_ID);
  });

  it("audits in-repo Franchise Management Suite wiring", () => {
    const audit = auditFranchiseSuite2SmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of FRANCHISE_SUITE_2_ERA137_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes royalty compliance rollout wiring", () => {
    const service = readFileSync(join(ROOT, FRANCHISE_SUITE_2_ERA137_SERVICE), "utf8");
    expect(service).toContain("loadFranchiseSuiteDashboard");
    expect(service).toContain("updateFranchiseBrandControl");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/franchise-suite-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("franchise-suite-panel");
    expect(panel).toContain("Franchise management suite");

    const checks = buildFranchiseComplianceChecks({ unit: SAMPLE_UNIT, hasBrandKit: true });
    expect(checks).toHaveLength(4);
    expect(
      resolveFranchiseRolloutPhase({ unit: SAMPLE_UNIT, checks }),
    ).toBe("go_live");

    const v2 = buildFranchiseSuiteDashboardV2({
      units: [SAMPLE_UNIT],
      totalRoyalties: 500,
      hasBrandKit: true,
    });
    expect(v2.unitRollouts).toHaveLength(1);
    expect(v2.royaltyInsights.totalRevenue).toBe(10000);
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveFranchiseSuite2SmokeEra137ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveFranchiseSuite2SmokeEra137ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildFranchiseSuite2SmokeEra137Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("rollout");
  });
});
