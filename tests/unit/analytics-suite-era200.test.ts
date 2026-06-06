import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ANALYTICS_SUITE_ERA125_POLICY_ID,
} from "@/lib/analytics/analytics-suite-era125-policy";
import {
  ANALYTICS_SUITE_ERA200_CANONICAL_POLICY_ID,
  ANALYTICS_SUITE_ERA200_LANES,
  ANALYTICS_SUITE_ERA200_POLICY_ID,
  ANALYTICS_SUITE_ERA200_ROUTE,
  ANALYTICS_SUITE_ERA200_SERVICE,
  ANALYTICS_SUITE_ERA200_SUMMARY_ARTIFACT,
  ANALYTICS_SUITE_ERA200_WIRING_PATHS,
} from "@/lib/analytics/analytics-suite-era200-policy";
import {
  auditAnalyticsSuiteSmokeEra200Wiring,
  buildAnalyticsSuiteSmokeEra200Summary,
  resolveAnalyticsSuiteSmokeEra200ProofStatus,
} from "@/lib/analytics/analytics-suite-era200-smoke-summary";
import {
  ANALYTICS_SUITE_POLICY_ID,
  ANALYTICS_SUITE_SERVICE,
} from "@/lib/analytics/analytics-suite-policy";

const ROOT = process.cwd();

describe("analytics suite era200", () => {
  it("locks era200 policy and artifact path", () => {
    expect(ANALYTICS_SUITE_ERA200_POLICY_ID).toBe("era200-analytics-suite-v1");
    expect(ANALYTICS_SUITE_ERA200_SUMMARY_ARTIFACT).toBe(
      "artifacts/analytics-suite-era200-smoke-summary.json",
    );
    expect(ANALYTICS_SUITE_ERA200_ROUTE).toBe("/dashboard/analytics/suite");
    expect(ANALYTICS_SUITE_ERA200_WIRING_PATHS).toHaveLength(5);
    expect(ANALYTICS_SUITE_ERA200_LANES).toHaveLength(8);
  });

  it("aligns era200 with canonical Analytics Suite policy", () => {
    expect(ANALYTICS_SUITE_ERA200_CANONICAL_POLICY_ID).toBe(ANALYTICS_SUITE_ERA125_POLICY_ID);
    expect(ANALYTICS_SUITE_ERA200_SERVICE).toBe(ANALYTICS_SUITE_SERVICE);
    expect(ANALYTICS_SUITE_POLICY_ID).toBe("analytics-suite-v1");
  });

  it("audits in-repo Analytics Suite Round 2 wiring", () => {
    const audit = auditAnalyticsSuiteSmokeEra200Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of ANALYTICS_SUITE_ERA200_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes eight-lane unified metrics wiring", () => {
    const service = readFileSync(join(ROOT, ANALYTICS_SUITE_ERA200_SERVICE), "utf8");
    expect(service).toContain("loadAnalyticsSuiteSnapshot");
    expect(service).toContain("loadExecutiveOverview");
    expect(service).toContain("loadForecasting2Snapshot");

    const builders = readFileSync(
      join(ROOT, "lib/analytics/analytics-suite-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildAnalyticsSuiteMetric");
    expect(builders).toContain("catering");

    const panel = readFileSync(
      join(ROOT, "components/analytics/analytics-suite-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("analytics-suite-panel");
    expect(panel).toContain("Metric lanes");
    expect(panel).toContain("Drill down");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAnalyticsSuiteSmokeEra200ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAnalyticsSuiteSmokeEra200ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAnalyticsSuiteSmokeEra200Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.lanes).toContain("revenue");
    expect(summary.lanes).toContain("operations");
  });
});
