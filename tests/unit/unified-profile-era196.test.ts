import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  UNIFIED_PROFILE_ERA121_POLICY_ID,
} from "@/lib/crm/unified-profile-era121-policy";
import {
  UNIFIED_PROFILE_ERA196_CANONICAL_POLICY_ID,
  UNIFIED_PROFILE_ERA196_POLICY_ID,
  UNIFIED_PROFILE_ERA196_PROFILE_SECTIONS,
  UNIFIED_PROFILE_ERA196_ROUTE,
  UNIFIED_PROFILE_ERA196_SERVICE,
  UNIFIED_PROFILE_ERA196_SUMMARY_ARTIFACT,
  UNIFIED_PROFILE_ERA196_WIRING_PATHS,
} from "@/lib/crm/unified-profile-era196-policy";
import {
  auditUnifiedProfileSmokeEra196Wiring,
  buildUnifiedProfileSmokeEra196Summary,
  resolveUnifiedProfileSmokeEra196ProofStatus,
} from "@/lib/crm/unified-profile-era196-smoke-summary";
import {
  UNIFIED_PROFILE_POLICY_ID,
  UNIFIED_PROFILE_SERVICE,
} from "@/lib/crm/unified-profile-policy";

const ROOT = process.cwd();

describe("unified customer profile era196", () => {
  it("locks era196 policy and artifact path", () => {
    expect(UNIFIED_PROFILE_ERA196_POLICY_ID).toBe("era196-unified-customer-profile-v1");
    expect(UNIFIED_PROFILE_ERA196_SUMMARY_ARTIFACT).toBe(
      "artifacts/unified-profile-era196-smoke-summary.json",
    );
    expect(UNIFIED_PROFILE_ERA196_ROUTE).toBe("/dashboard/customers/unified-profile");
    expect(UNIFIED_PROFILE_ERA196_WIRING_PATHS).toHaveLength(6);
    expect(UNIFIED_PROFILE_ERA196_PROFILE_SECTIONS).toHaveLength(4);
  });

  it("aligns era196 with canonical Unified Customer Profile policy", () => {
    expect(UNIFIED_PROFILE_ERA196_CANONICAL_POLICY_ID).toBe(UNIFIED_PROFILE_ERA121_POLICY_ID);
    expect(UNIFIED_PROFILE_ERA196_SERVICE).toBe(UNIFIED_PROFILE_SERVICE);
    expect(UNIFIED_PROFILE_POLICY_ID).toBe("crm-unified-profile-v1");
  });

  it("audits in-repo Unified Customer Profile Round 2 wiring", () => {
    const audit = auditUnifiedProfileSmokeEra196Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of UNIFIED_PROFILE_ERA196_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes orders preferences history loyalty wiring", () => {
    const service = readFileSync(join(ROOT, UNIFIED_PROFILE_ERA196_SERVICE), "utf8");
    expect(service).toContain("loadUnifiedCustomerProfileSnapshot");
    expect(service).toContain("loadUnifiedProfileHubSnapshot");
    expect(service).toContain("listOrdersForCustomer");

    const builders = readFileSync(join(ROOT, "lib/crm/unified-profile-builders.ts"), "utf8");
    expect(builders).toContain("buildUnifiedProfileTimelineRow");
    expect(builders).toContain("buildUnifiedProfileLoyaltySnapshot");

    const panel = readFileSync(
      join(ROOT, "components/crm/unified-customer-profile-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("unified-customer-profile-panel");
    expect(panel).toContain("Order history");
    expect(panel).toContain("Loyalty");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveUnifiedProfileSmokeEra196ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveUnifiedProfileSmokeEra196ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildUnifiedProfileSmokeEra196Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.sections).toContain("preferences");
    expect(summary.sections).toContain("history");
  });
});
