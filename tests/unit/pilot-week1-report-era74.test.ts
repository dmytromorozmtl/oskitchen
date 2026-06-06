import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PILOT_WEEK1_REPORT_ERA74_CUSTOMER,
  PILOT_WEEK1_REPORT_ERA74_DOC,
  PILOT_WEEK1_REPORT_ERA74_DOC_REQUIRED_HEADINGS,
  PILOT_WEEK1_REPORT_ERA74_FORBIDDEN_CLAIMS,
  PILOT_WEEK1_REPORT_ERA74_KPI_TARGETS,
  PILOT_WEEK1_REPORT_ERA74_POLICY_ID,
  PILOT_WEEK1_REPORT_ERA74_WORKSPACE_SLUG,
} from "@/lib/commercial/pilot-week1-report-era74-policy";

const ROOT = process.cwd();

function auditPilotWeek1ReportDoc(root = ROOT) {
  const source = readFileSync(join(root, PILOT_WEEK1_REPORT_ERA74_DOC), "utf8");
  const missingHeadings = PILOT_WEEK1_REPORT_ERA74_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  return { missingHeadings, passed: missingHeadings.length === 0 };
}

function lintPilotWeek1ReportCopy(source: string) {
  const lower = source.toLowerCase();
  const forbiddenHits = PILOT_WEEK1_REPORT_ERA74_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return { forbiddenHits, passed: forbiddenHits.length === 0 };
}

describe("pilot week1 report era74", () => {
  it("locks era74 policy and doc path", () => {
    expect(PILOT_WEEK1_REPORT_ERA74_POLICY_ID).toBe("era74-pilot-week1-report-v1");
    expect(PILOT_WEEK1_REPORT_ERA74_DOC).toBe("docs/pilot-week1-report.md");
    expect(PILOT_WEEK1_REPORT_ERA74_CUSTOMER).toBe("Riverbend Commissary LLC");
    expect(PILOT_WEEK1_REPORT_ERA74_WORKSPACE_SLUG).toBe("riverbend-commissary");
  });

  it("passes audit on canonical pilot week1 report doc", () => {
    const audit = auditPilotWeek1ReportDoc();
    expect(audit.passed, audit.missingHeadings.join("; ")).toBe(true);
  });

  it("records Riverbend Week 1 KPIs with honest staging caveat", () => {
    const source = readFileSync(join(ROOT, PILOT_WEEK1_REPORT_ERA74_DOC), "utf8");
    expect(source).toContain("CONDITIONAL PASS");
    expect(source).toContain("12/day");
    expect(source).toContain("9 min");
    expect(source).toContain("staging");
    expect(source).toContain(PILOT_WEEK1_REPORT_ERA74_WORKSPACE_SLUG);
  });

  it("embeds Week 1 KPI targets from policy", () => {
    expect(PILOT_WEEK1_REPORT_ERA74_KPI_TARGETS.ordersPerDay).toBe(10);
    expect(PILOT_WEEK1_REPORT_ERA74_KPI_TARGETS.medianBumpMinutes).toBe(15);
    expect(PILOT_WEEK1_REPORT_ERA74_KPI_TARGETS.healthScore).toBe(80);
  });

  it("flags forbidden pilot week1 report claims", () => {
    const result = lintPilotWeek1ReportCopy(
      "Production-proven at scale with guaranteed sub-second KDS and 100% channel uptime.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest conditional week1 report copy", () => {
    const source = readFileSync(join(ROOT, PILOT_WEEK1_REPORT_ERA74_DOC), "utf8");
    const result = lintPilotWeek1ReportCopy(source);
    expect(result.passed).toBe(true);
  });
});
