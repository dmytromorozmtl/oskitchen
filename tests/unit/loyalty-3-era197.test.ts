import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LOYALTY_3_ERA122_POLICY_ID,
} from "@/lib/loyalty/loyalty-3-era122-policy";
import {
  LOYALTY_3_ERA197_CANONICAL_POLICY_ID,
  LOYALTY_3_ERA197_PILLARS,
  LOYALTY_3_ERA197_POLICY_ID,
  LOYALTY_3_ERA197_ROUTE,
  LOYALTY_3_ERA197_SERVICE,
  LOYALTY_3_ERA197_SUMMARY_ARTIFACT,
  LOYALTY_3_ERA197_WIRING_PATHS,
} from "@/lib/loyalty/loyalty-3-era197-policy";
import {
  auditLoyalty3SmokeEra197Wiring,
  buildLoyalty3SmokeEra197Summary,
  resolveLoyalty3SmokeEra197ProofStatus,
} from "@/lib/loyalty/loyalty-3-era197-smoke-summary";
import {
  LOYALTY_3_POLICY_ID,
  LOYALTY_3_SERVICE,
} from "@/lib/loyalty/loyalty-3-policy";

const ROOT = process.cwd();

describe("loyalty 3.0 era197", () => {
  it("locks era197 policy and artifact path", () => {
    expect(LOYALTY_3_ERA197_POLICY_ID).toBe("era197-loyalty-3-v1");
    expect(LOYALTY_3_ERA197_SUMMARY_ARTIFACT).toBe(
      "artifacts/loyalty-3-era197-smoke-summary.json",
    );
    expect(LOYALTY_3_ERA197_ROUTE).toBe("/dashboard/loyalty/loyalty-3");
    expect(LOYALTY_3_ERA197_WIRING_PATHS).toHaveLength(6);
    expect(LOYALTY_3_ERA197_PILLARS).toHaveLength(4);
  });

  it("aligns era197 with canonical Loyalty 3.0 policy", () => {
    expect(LOYALTY_3_ERA197_CANONICAL_POLICY_ID).toBe(LOYALTY_3_ERA122_POLICY_ID);
    expect(LOYALTY_3_ERA197_SERVICE).toBe(LOYALTY_3_SERVICE);
    expect(LOYALTY_3_POLICY_ID).toBe("loyalty-3-v1");
  });

  it("audits in-repo Loyalty 3.0 Round 2 wiring", () => {
    const audit = auditLoyalty3SmokeEra197Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of LOYALTY_3_ERA197_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes cross-brand VIP events referrals wiring", () => {
    const service = readFileSync(join(ROOT, LOYALTY_3_ERA197_SERVICE), "utf8");
    expect(service).toContain("loadLoyalty3DashboardSnapshot");
    expect(service).toContain("loadCrossBrandLanes");
    expect(service).toContain("loadReferralStats");

    const builders = readFileSync(join(ROOT, "lib/loyalty/loyalty-3-builders.ts"), "utf8");
    expect(builders).toContain("buildLoyalty3VipMember");
    expect(builders).toContain("buildLoyalty3CrossBrandLane");

    const panel = readFileSync(
      join(ROOT, "components/loyalty/loyalty-3-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("loyalty-3-panel");
    expect(panel).toContain("VIP members");
    expect(panel).toContain("Referrals");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveLoyalty3SmokeEra197ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveLoyalty3SmokeEra197ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildLoyalty3SmokeEra197Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.pillars).toContain("cross-brand");
    expect(summary.pillars).toContain("vip");
  });
});
