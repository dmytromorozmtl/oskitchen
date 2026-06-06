import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  UNIFIED_PROFILE_ERA121_CANONICAL_POLICY_ID,
  UNIFIED_PROFILE_ERA121_POLICY_ID,
  UNIFIED_PROFILE_ERA121_PROFILE_SECTIONS,
  UNIFIED_PROFILE_ERA121_ROUTE,
  UNIFIED_PROFILE_ERA121_SERVICE,
  UNIFIED_PROFILE_ERA121_SUMMARY_ARTIFACT,
  UNIFIED_PROFILE_ERA121_WIRING_PATHS,
} from "@/lib/crm/unified-profile-era121-policy";
import {
  auditUnifiedProfileSmokeWiring,
  buildUnifiedProfileSmokeEra121Summary,
  resolveUnifiedProfileSmokeEra121ProofStatus,
} from "@/lib/crm/unified-profile-smoke-summary";
import { UNIFIED_PROFILE_POLICY_ID } from "@/lib/crm/unified-profile-policy";

const ROOT = process.cwd();

describe("unified customer profile era121", () => {
  it("locks era121 policy and artifact path", () => {
    expect(UNIFIED_PROFILE_ERA121_POLICY_ID).toBe("era121-unified-customer-profile-v1");
    expect(UNIFIED_PROFILE_ERA121_SUMMARY_ARTIFACT).toBe(
      "artifacts/unified-profile-smoke-summary.json",
    );
    expect(UNIFIED_PROFILE_ERA121_ROUTE).toBe("/dashboard/customers/unified-profile");
    expect(UNIFIED_PROFILE_ERA121_PROFILE_SECTIONS).toHaveLength(4);
  });

  it("aligns era121 with canonical unified profile policy", () => {
    expect(UNIFIED_PROFILE_ERA121_CANONICAL_POLICY_ID).toBe(UNIFIED_PROFILE_POLICY_ID);
  });

  it("audits in-repo Unified Customer Profile wiring", () => {
    const audit = auditUnifiedProfileSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of UNIFIED_PROFILE_ERA121_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes orders preferences history loyalty wiring", () => {
    const service = readFileSync(join(ROOT, UNIFIED_PROFILE_ERA121_SERVICE), "utf8");
    expect(service).toContain("loadUnifiedCustomerProfileSnapshot");
    expect(service).toContain("loadUnifiedProfileHubSnapshot");
    expect(service).toContain("buildUnifiedProfileLoyaltySnapshot");

    const builders = readFileSync(join(ROOT, "lib/crm/unified-profile-builders.ts"), "utf8");
    expect(builders).toContain("buildUnifiedProfileTimelineRow");
    expect(builders).toContain("buildUnifiedProfileHubRow");

    const panel = readFileSync(
      join(ROOT, "components/crm/unified-customer-profile-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("unified-customer-profile-panel");
    expect(panel).toContain("Order history");
    expect(panel).toContain("Activity history");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveUnifiedProfileSmokeEra121ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveUnifiedProfileSmokeEra121ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildUnifiedProfileSmokeEra121Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.sections).toContain("loyalty");
  });
});
