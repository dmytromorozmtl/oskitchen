import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CASE_STUDY_MILESTONE_METRICS,
  CASE_STUDY_TEMPLATE_P2_50_DISCLAIMER,
  CASE_STUDY_TEMPLATE_P2_50_SHORT_FORM,
} from "@/lib/marketing/case-study-template-p2-50-content";
import { validateCaseStudyMilestoneDraft } from "@/lib/marketing/case-study-template-p2-50-measurement";
import {
  CASE_STUDY_TEMPLATE_P2_50_DOC,
  CASE_STUDY_TEMPLATE_P2_50_FILL_IN_DOC,
  CASE_STUDY_TEMPLATE_P2_50_FLOW_STEPS,
  CASE_STUDY_TEMPLATE_P2_50_HONESTY_MARKERS,
  CASE_STUDY_TEMPLATE_P2_50_MILESTONES,
  CASE_STUDY_TEMPLATE_P2_50_MKT11_DOC,
  CASE_STUDY_TEMPLATE_P2_50_POLICY_ID,
  CASE_STUDY_TEMPLATE_P2_50_WIRING_PATHS,
} from "@/lib/marketing/case-study-template-p2-50-policy";

export type CaseStudyTemplateP2_50AuditSummary = {
  policyId: typeof CASE_STUDY_TEMPLATE_P2_50_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  fillInWired: boolean;
  mkt11Linked: boolean;
  goldenMilestoneValidationOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

const GOLDEN_MILESTONE_DRAFT = `
## Challenge
Manual channel chaos before pilot.

## Solution
OS Kitchen Order Hub + KDS + Integration Health.

## Results — W1
Week 1 baseline captured.

## Results — M1
Month 1 verified KPI delta.

## Results — M3
Month 3 retention and expansion metrics.
`;

export function auditCaseStudyTemplateP2_50(
  root = process.cwd(),
): CaseStudyTemplateP2_50AuditSummary {
  const wiringComplete = CASE_STUDY_TEMPLATE_P2_50_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, CASE_STUDY_TEMPLATE_P2_50_DOC))) {
    const source = readFileSync(join(root, CASE_STUDY_TEMPLATE_P2_50_DOC), "utf8");
    docWired =
      source.includes(CASE_STUDY_TEMPLATE_P2_50_POLICY_ID) &&
      source.includes("Challenge") &&
      source.includes("Solution") &&
      source.includes("Results") &&
      CASE_STUDY_TEMPLATE_P2_50_MILESTONES.every((m) => source.includes(m));
  }

  let fillInWired = false;
  if (existsSync(join(root, CASE_STUDY_TEMPLATE_P2_50_FILL_IN_DOC))) {
    const source = readFileSync(join(root, CASE_STUDY_TEMPLATE_P2_50_FILL_IN_DOC), "utf8");
    fillInWired =
      source.includes(CASE_STUDY_TEMPLATE_P2_50_DISCLAIMER) &&
      source.includes("### Challenge") &&
      source.includes("### Solution") &&
      CASE_STUDY_TEMPLATE_P2_50_MILESTONES.every((m) => source.includes(`Results — ${m}`)) &&
      CASE_STUDY_MILESTONE_METRICS.every((metric) => source.includes(metric.label));
  }

  let mkt11Linked = false;
  if (existsSync(join(root, CASE_STUDY_TEMPLATE_P2_50_MKT11_DOC))) {
    const source = readFileSync(join(root, CASE_STUDY_TEMPLATE_P2_50_MKT11_DOC), "utf8");
    mkt11Linked =
      source.includes(CASE_STUDY_TEMPLATE_P2_50_DOC) ||
      source.includes("case-study-template-p2-50");
  }

  const golden = validateCaseStudyMilestoneDraft(GOLDEN_MILESTONE_DRAFT);
  const goldenMilestoneValidationOk =
    golden.passed && golden.milestonesPresent.length === CASE_STUDY_TEMPLATE_P2_50_MILESTONES.length;

  const combined = [CASE_STUDY_TEMPLATE_P2_50_DOC, CASE_STUDY_TEMPLATE_P2_50_FILL_IN_DOC]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .concat(CASE_STUDY_TEMPLATE_P2_50_SHORT_FORM)
    .join("\n");

  const honestyMarkersPresent = CASE_STUDY_TEMPLATE_P2_50_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    fillInWired &&
    mkt11Linked &&
    goldenMilestoneValidationOk &&
    honestyMarkersPresent &&
    CASE_STUDY_TEMPLATE_P2_50_FLOW_STEPS.length === 4;

  return {
    policyId: CASE_STUDY_TEMPLATE_P2_50_POLICY_ID,
    wiringComplete,
    docWired,
    fillInWired,
    mkt11Linked,
    goldenMilestoneValidationOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCaseStudyTemplateP2_50AuditLines(
  summary: CaseStudyTemplateP2_50AuditSummary,
): string[] {
  return [
    `Case study template audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${CASE_STUDY_TEMPLATE_P2_50_DOC})`,
    `Fill-in scaffold: ${summary.fillInWired ? "yes" : "no"} (${CASE_STUDY_TEMPLATE_P2_50_FILL_IN_DOC})`,
    `MKT-11 linked: ${summary.mkt11Linked ? "yes" : "no"}`,
    `Golden W1/M1/M3 validation: ${summary.goldenMilestoneValidationOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
