import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ANALYTICS_SUITE_ERA125_CANONICAL_POLICY_ID,
  ANALYTICS_SUITE_ERA125_LANES,
  ANALYTICS_SUITE_ERA125_POLICY_ID,
  ANALYTICS_SUITE_ERA125_ROUTE,
  ANALYTICS_SUITE_ERA125_SERVICE,
  ANALYTICS_SUITE_ERA125_SUMMARY_ARTIFACT,
  ANALYTICS_SUITE_ERA125_WIRING_PATHS,
} from "@/lib/analytics/analytics-suite-era125-policy";
import {
  auditAnalyticsSuiteSmokeWiring,
  buildAnalyticsSuiteSmokeEra125Summary,
  resolveAnalyticsSuiteSmokeEra125ProofStatus,
} from "@/lib/analytics/analytics-suite-smoke-summary";
import { ANALYTICS_SUITE_POLICY_ID } from "@/lib/analytics/analytics-suite-policy";

const ROOT = process.cwd();

describe("analytics suite era125", () => {
  it("locks era125 policy and artifact path", () => {
    expect(ANALYTICS_SUITE_ERA125_POLICY_ID).toBe("era125-analytics-suite-v1");
    expect(ANALYTICS_SUITE_ERA125_SUMMARY_ARTIFACT).toBe(
      "artifacts/analytics-suite-smoke-summary.json",
    );
    expect(ANALYTICS_SUITE_ERA125_ROUTE).toBe("/dashboard/analytics/suite");
    expect(ANALYTICS_SUITE_ERA125_LANES).toHaveLength(8);
  });

  it("aligns era125 with canonical analytics suite policy", () => {
    expect(ANALYTICS_SUITE_ERA125_CANONICAL_POLICY_ID).toBe(ANALYTICS_SUITE_POLICY_ID);
  });

  it("audits in-repo Analytics Suite wiring", () => {
    const audit = auditAnalyticsSuiteSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of ANALYTICS_SUITE_ERA125_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes eight-lane unified metrics wiring", () => {
    const service = readFileSync(join(ROOT, ANALYTICS_SUITE_ERA125_SERVICE), "utf8");
    expect(service).toContain("loadAnalyticsSuiteSnapshot");
    expect(service).toContain("loadCustomerAnalytics");
    expect(service).toContain("loadInventoryAnalytics");
    expect(service).toContain('id: "forecast"');

    const builders = readFileSync(
      join(ROOT, "lib/analytics/analytics-suite-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildAnalyticsSuiteLane");
    expect(builders).toContain("meal_plans");

    const panel = readFileSync(
      join(ROOT, "components/analytics/analytics-suite-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("analytics-suite-panel");
    expect(panel).toContain("One screen — all analytics");
    expect(panel).toContain("Drill down");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAnalyticsSuiteSmokeEra125ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAnalyticsSuiteSmokeEra125ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAnalyticsSuiteSmokeEra125Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.lanes).toContain("forecast");
  });
});
