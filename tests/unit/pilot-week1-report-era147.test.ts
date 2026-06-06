import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PILOT_WEEK1_REPORT_ERA74_POLICY_ID } from "@/lib/commercial/pilot-week1-report-era74-policy";
import {
  PILOT_WEEK1_REPORT_ERA147_CANONICAL_DOC,
  PILOT_WEEK1_REPORT_ERA147_CANONICAL_POLICY_ID,
  PILOT_WEEK1_REPORT_ERA147_CAPABILITIES,
  PILOT_WEEK1_REPORT_ERA147_CUSTOMER,
  PILOT_WEEK1_REPORT_ERA147_KPI_TARGETS,
  PILOT_WEEK1_REPORT_ERA147_POLICY_ID,
  PILOT_WEEK1_REPORT_ERA147_SUMMARY_ARTIFACT,
  PILOT_WEEK1_REPORT_ERA147_WORKSPACE_SLUG,
  PILOT_WEEK1_REPORT_ERA147_WIRING_PATHS,
} from "@/lib/commercial/pilot-week1-report-era147-policy";
import {
  auditPilotWeek1ReportDocContent,
  auditPilotWeek1ReportEra147Wiring,
  buildPilotWeek1ReportEra147Summary,
  resolvePilotWeek1ReportEra147ProofStatus,
} from "@/lib/commercial/pilot-week1-report-era147-smoke-summary";

const ROOT = process.cwd();

describe("pilot week1 report era147", () => {
  it("locks era147 policy and artifact path", () => {
    expect(PILOT_WEEK1_REPORT_ERA147_POLICY_ID).toBe("era147-pilot-week1-report-v1");
    expect(PILOT_WEEK1_REPORT_ERA147_SUMMARY_ARTIFACT).toBe(
      "artifacts/pilot-week1-report-era147-smoke-summary.json",
    );
    expect(PILOT_WEEK1_REPORT_ERA147_CANONICAL_DOC).toBe("docs/pilot-week1-report.md");
    expect(PILOT_WEEK1_REPORT_ERA147_CUSTOMER).toBe("Riverbend Commissary LLC");
    expect(PILOT_WEEK1_REPORT_ERA147_WORKSPACE_SLUG).toBe("riverbend-commissary");
    expect(PILOT_WEEK1_REPORT_ERA147_WIRING_PATHS).toHaveLength(7);
    expect(PILOT_WEEK1_REPORT_ERA147_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era147 with canonical Pilot Week 1 report policy", () => {
    expect(PILOT_WEEK1_REPORT_ERA147_CANONICAL_POLICY_ID).toBe(
      PILOT_WEEK1_REPORT_ERA74_POLICY_ID,
    );
  });

  it("audits in-repo Pilot Week 1 report wiring", () => {
    const audit = auditPilotWeek1ReportEra147Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of PILOT_WEEK1_REPORT_ERA147_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("passes Week 1 report doc audit with Riverbend KPIs", () => {
    const audit = auditPilotWeek1ReportDocContent(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    const source = readFileSync(join(ROOT, PILOT_WEEK1_REPORT_ERA147_CANONICAL_DOC), "utf8");
    expect(source).toContain("CONDITIONAL PASS");
    expect(source).toContain("12/day");
    expect(source).toContain("9 min");
    expect(source).toContain(PILOT_WEEK1_REPORT_ERA147_WORKSPACE_SLUG);
    expect(PILOT_WEEK1_REPORT_ERA147_KPI_TARGETS.ordersPerDay).toBe(10);
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePilotWeek1ReportEra147ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePilotWeek1ReportEra147ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPilotWeek1ReportEra147Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.reportDocAuditPassed).toBe(true);
    expect(summary.capabilities).toContain("week1_checkpoint_report");
  });
});
