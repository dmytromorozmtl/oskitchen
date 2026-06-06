import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID,
} from "@/lib/enterprise/multi-brand-command-center-era111-policy";
import {
  MULTI_BRAND_COMMAND_CENTER_ERA186_CANONICAL_POLICY_ID,
  MULTI_BRAND_COMMAND_CENTER_ERA186_CAPABILITIES,
  MULTI_BRAND_COMMAND_CENTER_ERA186_POLICY_ID,
  MULTI_BRAND_COMMAND_CENTER_ERA186_ROUTE,
  MULTI_BRAND_COMMAND_CENTER_ERA186_SERVICE,
  MULTI_BRAND_COMMAND_CENTER_ERA186_SUMMARY_ARTIFACT,
  MULTI_BRAND_COMMAND_CENTER_ERA186_WIRING_PATHS,
} from "@/lib/enterprise/multi-brand-command-center-era186-policy";
import {
  auditMultiBrandCommandCenterSmokeEra186Wiring,
  buildMultiBrandCommandCenterSmokeEra186Summary,
  resolveMultiBrandCommandCenterSmokeEra186ProofStatus,
} from "@/lib/enterprise/multi-brand-command-center-era186-smoke-summary";
import {
  ENTERPRISE_BRAND_LANES,
  ENTERPRISE_MULTI_BRAND_POLICY_ID,
  ENTERPRISE_MULTI_BRAND_SERVICE,
} from "@/lib/enterprise/multi-brand-policy";

const ROOT = process.cwd();

describe("multi-brand command center era186", () => {
  it("locks era186 policy and artifact path", () => {
    expect(MULTI_BRAND_COMMAND_CENTER_ERA186_POLICY_ID).toBe(
      "era186-multi-brand-command-center-v1",
    );
    expect(MULTI_BRAND_COMMAND_CENTER_ERA186_SUMMARY_ARTIFACT).toBe(
      "artifacts/multi-brand-command-center-era186-smoke-summary.json",
    );
    expect(MULTI_BRAND_COMMAND_CENTER_ERA186_ROUTE).toBe("/dashboard/enterprise/multi-brand");
    expect(MULTI_BRAND_COMMAND_CENTER_ERA186_WIRING_PATHS).toHaveLength(5);
    expect(MULTI_BRAND_COMMAND_CENTER_ERA186_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era186 with canonical Multi-Brand Command Center policy", () => {
    expect(MULTI_BRAND_COMMAND_CENTER_ERA186_CANONICAL_POLICY_ID).toBe(
      MULTI_BRAND_COMMAND_CENTER_ERA111_POLICY_ID,
    );
    expect(MULTI_BRAND_COMMAND_CENTER_ERA186_SERVICE).toBe(ENTERPRISE_MULTI_BRAND_SERVICE);
    expect(ENTERPRISE_MULTI_BRAND_POLICY_ID).toBe("enterprise-multi-brand-v1");
    expect(ENTERPRISE_BRAND_LANES).toEqual(["A", "B", "C", "D"]);
  });

  it("audits in-repo Multi-Brand Command Center Round 2 wiring", () => {
    const audit = auditMultiBrandCommandCenterSmokeEra186Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MULTI_BRAND_COMMAND_CENTER_ERA186_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes brand lanes and revenue per brand wiring", () => {
    const service = readFileSync(
      join(ROOT, MULTI_BRAND_COMMAND_CENTER_ERA186_SERVICE),
      "utf8",
    );
    expect(service).toContain("loadEnterpriseMultiBrandDashboard");

    const builders = readFileSync(join(ROOT, "lib/enterprise/multi-brand-builders.ts"), "utf8");
    expect(builders).toContain("buildEnterpriseBrandRanks");
    expect(builders).toContain("buildEnterpriseBrandAlerts");
    expect(builders).toContain("ENTERPRISE_BRAND_LANES");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/multi-brand-enterprise-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("enterprise-multi-brand-panel");
    expect(panel).toContain("Revenue share by lane");
    expect(panel).toContain("revenueShare");
    expect(panel).toContain("Brand lanes A–D");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMultiBrandCommandCenterSmokeEra186ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMultiBrandCommandCenterSmokeEra186ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMultiBrandCommandCenterSmokeEra186Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("brand_lanes_abcd");
    expect(summary.capabilities).toContain("revenue_per_brand");
    expect(summary.capabilities).toContain("portfolio_alerts");
  });
});
