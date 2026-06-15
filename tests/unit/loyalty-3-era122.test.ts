import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LOYALTY_3_ERA122_CANONICAL_POLICY_ID,
  LOYALTY_3_ERA122_PILLARS,
  LOYALTY_3_ERA122_POLICY_ID,
  LOYALTY_3_ERA122_ROUTE,
  LOYALTY_3_ERA122_SERVICE,
  LOYALTY_3_ERA122_SUMMARY_ARTIFACT,
  LOYALTY_3_ERA122_WIRING_PATHS,
} from "@/lib/loyalty/loyalty-3-era122-policy";
import {
  auditLoyalty3SmokeWiring,
  buildLoyalty3SmokeEra122Summary,
  resolveLoyalty3SmokeEra122ProofStatus,
} from "@/lib/loyalty/loyalty-3-smoke-summary";
import { LOYALTY_3_POLICY_ID } from "@/lib/loyalty/loyalty-3-policy";

const ROOT = process.cwd();

describe("loyalty 3.0 era122", () => {
  it("locks era122 policy and artifact path", () => {
    expect(LOYALTY_3_ERA122_POLICY_ID).toBe("era122-loyalty-3-v1");
    expect(LOYALTY_3_ERA122_SUMMARY_ARTIFACT).toBe(
      "artifacts/loyalty-3-smoke-summary.json",
    );
    expect(LOYALTY_3_ERA122_ROUTE).toBe("/dashboard/loyalty/loyalty-3");
    expect(LOYALTY_3_ERA122_PILLARS).toHaveLength(4);
  });

  it("aligns era122 with canonical loyalty 3 policy", () => {
    expect(LOYALTY_3_ERA122_CANONICAL_POLICY_ID).toBe(LOYALTY_3_POLICY_ID);
  });

  it("audits in-repo Loyalty 3.0 wiring", () => {
    const audit = auditLoyalty3SmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of LOYALTY_3_ERA122_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes cross-brand VIP events referrals wiring", () => {
    const service = readFileSync(join(ROOT, LOYALTY_3_ERA122_SERVICE), "utf8");
    expect(service).toContain("loadLoyalty3DashboardSnapshot");
    expect(service).toContain("grantLoyalty3EventBonus");
    expect(service).toContain("grantLoyalty3ReferralBonus");

    const builders = readFileSync(join(ROOT, "lib/loyalty/loyalty-3-builders.ts"), "utf8");
    expect(builders).toContain("buildLoyalty3ReferralStats");
    expect(builders).toContain("buildLoyalty3EventOpportunity");

    const panel = readFileSync(
      join(ROOT, "components/loyalty/loyalty-3-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("loyalty-3-panel");
    expect(panel).toContain("Cross-brand lanes");
    expect(panel).toContain("Event opportunities");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveLoyalty3SmokeEra122ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveLoyalty3SmokeEra122ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildLoyalty3SmokeEra122Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.pillars).toContain("referrals");
  });
});
