import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCaseStudyTemplateP2_50,
  formatCaseStudyTemplateP2_50AuditLines,
} from "@/lib/marketing/case-study-template-p2-50-audit";
import {
  CASE_STUDY_MILESTONE_METRICS,
  listCaseStudyTemplateP2_50SectionLabels,
} from "@/lib/marketing/case-study-template-p2-50-content";
import {
  scoreMilestoneCompleteness,
  validateCaseStudyMilestoneDraft,
} from "@/lib/marketing/case-study-template-p2-50-measurement";
import {
  CASE_STUDY_TEMPLATE_P2_50_AUDIT_SCRIPT,
  CASE_STUDY_TEMPLATE_P2_50_CHECK_NPM_SCRIPT,
  CASE_STUDY_TEMPLATE_P2_50_CI_WORKFLOW,
  CASE_STUDY_TEMPLATE_P2_50_CORE_SECTIONS,
  CASE_STUDY_TEMPLATE_P2_50_DOC,
  CASE_STUDY_TEMPLATE_P2_50_FILL_IN_DOC,
  CASE_STUDY_TEMPLATE_P2_50_FLOW_STEPS,
  CASE_STUDY_TEMPLATE_P2_50_MILESTONES,
  CASE_STUDY_TEMPLATE_P2_50_NPM_SCRIPT,
  CASE_STUDY_TEMPLATE_P2_50_POLICY_ID,
  CASE_STUDY_TEMPLATE_P2_50_UNIT_TEST,
} from "@/lib/marketing/case-study-template-p2-50-policy";

const ROOT = process.cwd();

const SAMPLE_DRAFT = `
### Challenge
Before OS Kitchen, orders were split across channels.

### Solution
Order Hub + KDS + Integration Health.

### Results — W1
Week 1 baseline.

### Results — M1
Month 1 verified delta.

### Results — M3
Month 3 retention metrics.
`;

describe("Case study template (P2-50)", () => {
  it("locks policy id and Challenge → Solution → Results flow", () => {
    expect(CASE_STUDY_TEMPLATE_P2_50_POLICY_ID).toBe("case-study-template-p2-50-v1");
    expect(CASE_STUDY_TEMPLATE_P2_50_CORE_SECTIONS).toEqual([
      "Challenge",
      "Solution",
      "Results",
    ]);
    expect(CASE_STUDY_TEMPLATE_P2_50_MILESTONES).toEqual(["W1", "M1", "M3"]);
    expect(CASE_STUDY_TEMPLATE_P2_50_FLOW_STEPS).toEqual([
      "define_challenge",
      "define_solution",
      "capture_results_w1",
      "capture_results_m1_m3",
    ]);
    expect(CASE_STUDY_MILESTONE_METRICS.length).toBeGreaterThanOrEqual(5);
  });

  it("validates W1/M1/M3 milestone draft structure", () => {
    const validation = validateCaseStudyMilestoneDraft(SAMPLE_DRAFT);
    expect(validation.hasChallenge).toBe(true);
    expect(validation.hasSolution).toBe(true);
    expect(validation.hasResults).toBe(true);
    expect(validation.milestonesPresent).toEqual(["W1", "M1", "M3"]);
    expect(validation.passed).toBe(true);
    expect(scoreMilestoneCompleteness(validation.milestonesPresent)).toBe(100);
    expect(listCaseStudyTemplateP2_50SectionLabels()).toContain("Results W1");
  });

  it("passes full case study template audit", () => {
    const summary = auditCaseStudyTemplateP2_50(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.fillInWired).toBe(true);
    expect(summary.mkt11Linked).toBe(true);
    expect(summary.goldenMilestoneValidationOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatCaseStudyTemplateP2_50AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, CASE_STUDY_TEMPLATE_P2_50_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CASE_STUDY_TEMPLATE_P2_50_FILL_IN_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CASE_STUDY_TEMPLATE_P2_50_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, CASE_STUDY_TEMPLATE_P2_50_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CASE_STUDY_TEMPLATE_P2_50_NPM_SCRIPT]).toContain(
      "audit-case-study-template-p2-50.ts",
    );
    expect(pkg.scripts?.[CASE_STUDY_TEMPLATE_P2_50_CHECK_NPM_SCRIPT]).toContain(
      CASE_STUDY_TEMPLATE_P2_50_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, CASE_STUDY_TEMPLATE_P2_50_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("case-study-template-p2-50");
  });
});
