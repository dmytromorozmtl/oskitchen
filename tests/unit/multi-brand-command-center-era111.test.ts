import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MULTI_BRAND_COMMAND_CENTER_ERA111_CANONICAL_POLICY_ID,
  MULTI_BRAND_COMMAND_CENTER_ERA111_CAPABILITIES,
  MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID,
  MULTI_BRAND_COMMAND_CENTER_ERA111_ROUTE,
  MULTI_BRAND_COMMAND_CENTER_ERA111_SERVICE,
  MULTI_BRAND_COMMAND_CENTER_ERA111_SUMMARY_ARTIFACT,
  MULTI_BRAND_COMMAND_CENTER_ERA111_WIRING_PATHS,
} from "@/lib/enterprise/multi-brand-command-center-era111-policy";
import {
  auditMultiBrandCommandCenterSmokeWiring,
  buildMultiBrandCommandCenterSmokeEra111Summary,
  resolveMultiBrandCommandCenterSmokeEra111ProofStatus,
} from "@/lib/enterprise/multi-brand-command-center-smoke-summary";
import {
  ENTERPRISE_BRAND_LANES,
  ENTERPRISE_MULTI_BRAND_POLICY_ID,
  ENTERPRISE_MULTI_BRAND_SERVICE,
} from "@/lib/enterprise/multi-brand-policy";

const ROOT = process.cwd();

describe("multi-brand command center era111", () => {
  it("locks era111 policy and artifact path", () => {
    expect(MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID).toBe(
      "era111-multi-brand-command-center-v1",
    );
    expect(MULTI_BRAND_COMMAND_CENTER_ERA111_SUMMARY_ARTIFACT).toBe(
      "artifacts/multi-brand-command-center-smoke-summary.json",
    );
    expect(MULTI_BRAND_COMMAND_CENTER_ERA111_ROUTE).toBe("/dashboard/enterprise/multi-brand");
    expect(MULTI_BRAND_COMMAND_CENTER_ERA111_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era111 with canonical multi-brand policy", () => {
    expect(MULTI_BRAND_COMMAND_CENTER_ERA111_CANONICAL_POLICY_ID).toBe(
      ENTERPRISE_MULTI_BRAND_POLICY_ID,
    );
    expect(MULTI_BRAND_COMMAND_CENTER_ERA111_SERVICE).toBe(ENTERPRISE_MULTI_BRAND_SERVICE);
    expect(ENTERPRISE_BRAND_LANES).toEqual(["A", "B", "C", "D"]);
  });

  it("audits in-repo Multi-Brand Command Center wiring", () => {
    const audit = auditMultiBrandCommandCenterSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MULTI_BRAND_COMMAND_CENTER_ERA111_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes brand lanes and revenue per brand wiring", () => {
    const service = readFileSync(
      join(ROOT, MULTI_BRAND_COMMAND_CENTER_ERA111_SERVICE),
      "utf8",
    );
    expect(service).toContain("loadEnterpriseMultiBrandDashboard");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/multi-brand-enterprise-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("enterprise-multi-brand-panel");
    expect(panel).toContain("Revenue share by lane");
    expect(panel).toContain("revenueShare");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMultiBrandCommandCenterSmokeEra111ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMultiBrandCommandCenterSmokeEra111ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMultiBrandCommandCenterSmokeEra111Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("revenue_per_brand");
  });
});
