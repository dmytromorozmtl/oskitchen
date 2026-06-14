import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computePublishReviewDate,
  resolveCaseStudyPipelineStage,
} from "@/lib/marketing/case-study-template-pipeline-p2-56-measurement";
import {
  CASE_STUDY_PIPELINE_P2_56_PUBLISH_REVIEW_DAYS,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_FILL_IN_DOC,
  CASE_STUDY_PIPELINE_P2_56_LOI_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_PRE_LOI_TEMPLATE_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_STAGES,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_WIRING_PATHS,
} from "@/lib/marketing/case-study-template-pipeline-p2-56-policy";

export type CaseStudyTemplatePipelineP256AuditSummary = {
  policyId: typeof CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  fillInWired: boolean;
  loiTemplateLinked: boolean;
  preLoiTemplateLinked: boolean;
  publishReviewDaysOk: boolean;
  pipelineResolutionOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCaseStudyTemplatePipelineP256(
  root = process.cwd(),
): CaseStudyTemplatePipelineP256AuditSummary {
  const wiringComplete = CASE_STUDY_TEMPLATE_PIPELINE_P2_56_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let loiTemplateLinked = false;
  let preLoiTemplateLinked = false;
  let honestyMarkersPresent = false;

  if (existsSync(join(root, CASE_STUDY_TEMPLATE_PIPELINE_P2_56_DOC))) {
    const source = readFileSync(join(root, CASE_STUDY_TEMPLATE_PIPELINE_P2_56_DOC), "utf8");
    docWired =
      source.includes(CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID) &&
      source.includes("30 days") &&
      source.includes("LOI");
    loiTemplateLinked = source.includes("loi-design-partner-template.md");
    preLoiTemplateLinked = source.includes("case-study-template-pre-pilot.md");
    honestyMarkersPresent =
      source.toLowerCase().includes("internal draft") &&
      source.toLowerCase().includes("permission");
  }

  let fillInWired = false;
  if (existsSync(join(root, CASE_STUDY_TEMPLATE_PIPELINE_P2_56_FILL_IN_DOC))) {
    const fillIn = readFileSync(join(root, CASE_STUDY_TEMPLATE_PIPELINE_P2_56_FILL_IN_DOC), "utf8");
    fillInWired =
      fillIn.includes("pre_loi_template") &&
      fillIn.includes("Day 30") &&
      CASE_STUDY_TEMPLATE_PIPELINE_P2_56_STAGES.every((stage) => fillIn.includes(stage));
  }

  const publishReviewDaysOk =
    CASE_STUDY_PIPELINE_P2_56_PUBLISH_REVIEW_DAYS === 30 &&
    computePublishReviewDate("2026-06-01") === "2026-07-01";

  const preLoi = resolveCaseStudyPipelineStage({
    loiSignedDate: null,
    pilotStartDate: null,
    customerApproval: "none",
    publishGatesPassed: false,
  });
  const day30 = resolveCaseStudyPipelineStage({
    loiSignedDate: "2026-06-01",
    pilotStartDate: "2026-06-01",
    customerApproval: "none",
    publishGatesPassed: false,
    asOf: new Date("2026-07-05"),
  });
  const pipelineResolutionOk =
    preLoi.stage === "pre_loi_template" &&
    day30.stage === "pilot_day_30_publish_review" &&
    day30.publishReviewEligible === true;

  const passed =
    wiringComplete &&
    docWired &&
    fillInWired &&
    loiTemplateLinked &&
    preLoiTemplateLinked &&
    publishReviewDaysOk &&
    pipelineResolutionOk &&
    honestyMarkersPresent;

  return {
    policyId: CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID,
    wiringComplete,
    docWired,
    fillInWired,
    loiTemplateLinked,
    preLoiTemplateLinked,
    publishReviewDaysOk,
    pipelineResolutionOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCaseStudyTemplatePipelineP256AuditLines(
  summary: CaseStudyTemplatePipelineP256AuditSummary,
): string[] {
  return [
    `Case study template pipeline (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Pipeline doc: ${summary.docWired ? "yes" : "no"}`,
    `Fill-in checklist: ${summary.fillInWired ? "yes" : "no"}`,
    `LOI template linked: ${summary.loiTemplateLinked ? "yes" : "no"}`,
    `Pre-LOI template linked: ${summary.preLoiTemplateLinked ? "yes" : "no"}`,
    `30-day publish review: ${summary.publishReviewDaysOk ? "yes" : "no"}`,
    `Pipeline resolution: ${summary.pipelineResolutionOk ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
