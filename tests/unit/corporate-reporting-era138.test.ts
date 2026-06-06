import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CORPORATE_REPORTING_ERA138_CANONICAL_POLICY_ID,
  CORPORATE_REPORTING_ERA138_POLICY_ID,
  CORPORATE_REPORTING_ERA138_ROUTE,
  CORPORATE_REPORTING_ERA138_SECTIONS,
  CORPORATE_REPORTING_ERA138_SERVICE,
  CORPORATE_REPORTING_ERA138_SUMMARY_ARTIFACT,
  CORPORATE_REPORTING_ERA138_WIRING_PATHS,
} from "@/lib/enterprise/corporate-reporting-era138-policy";
import {
  auditCorporateReportingSmokeWiring,
  buildCorporateReportingSmokeEra138Summary,
  resolveCorporateReportingSmokeEra138ProofStatus,
} from "@/lib/enterprise/corporate-reporting-smoke-summary";
import {
  buildCorporatePlLines,
  buildCorporateReportingDashboard,
} from "@/lib/enterprise/corporate-reporting-builders";
import { CORPORATE_REPORTING_POLICY_ID } from "@/lib/enterprise/corporate-reporting-policy";

const ROOT = process.cwd();

describe("corporate reporting era138", () => {
  it("locks era138 policy and artifact path", () => {
    expect(CORPORATE_REPORTING_ERA138_POLICY_ID).toBe("era138-corporate-reporting-v1");
    expect(CORPORATE_REPORTING_ERA138_SUMMARY_ARTIFACT).toBe(
      "artifacts/corporate-reporting-smoke-summary.json",
    );
    expect(CORPORATE_REPORTING_ERA138_ROUTE).toBe("/dashboard/enterprise/reports");
    expect(CORPORATE_REPORTING_ERA138_SECTIONS).toHaveLength(3);
  });

  it("aligns era138 with canonical corporate reporting policy", () => {
    expect(CORPORATE_REPORTING_ERA138_CANONICAL_POLICY_ID).toBe(CORPORATE_REPORTING_POLICY_ID);
  });

  it("audits in-repo Corporate Reporting wiring", () => {
    const audit = auditCorporateReportingSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of CORPORATE_REPORTING_ERA138_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes CEO P&L trends forecast wiring", () => {
    const service = readFileSync(join(ROOT, CORPORATE_REPORTING_ERA138_SERVICE), "utf8");
    expect(service).toContain("loadCorporateReportingDashboard");
    expect(service).toContain("loadForecasting2Snapshot");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/corporate-reporting-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("corporate-reporting-panel");
    expect(panel).toContain("EBITDA (proxy)");

    const lines = buildCorporatePlLines({
      grossRevenue: 100000,
      netRevenue: 95000,
      cancelledRevenue: 5000,
      foodCostAmount: 30400,
      laborCostAmount: 26600,
      opexAmount: 7600,
    });
    expect(lines.find((l) => l.id === "ebitda")).toBeDefined();
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCorporateReportingSmokeEra138ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCorporateReportingSmokeEra138ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCorporateReportingSmokeEra138Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.sections).toContain("forecast");
  });
});
