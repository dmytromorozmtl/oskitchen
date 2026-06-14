/**
 * P2-56 — Case study template + pipeline: pre-LOI template → publish 30 days after pilot.
 *
 * @see docs/case-study-template-pipeline-p2-56.md
 */

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_POLICY_ID =
  "case-study-template-pipeline-p2-56-v1" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_DOC =
  "docs/case-study-template-pipeline-p2-56.md" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_FILL_IN_DOC =
  "docs/case-studies/_LOI_TO_PUBLISH_PIPELINE.md" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_ARTIFACT =
  "artifacts/case-study-template-pipeline-p2-56.json" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_AUDIT_MODULE =
  "lib/marketing/case-study-template-pipeline-p2-56-audit.ts" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_MEASUREMENT_MODULE =
  "lib/marketing/case-study-template-pipeline-p2-56-measurement.ts" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CHECK_NPM_SCRIPT =
  "check:case-study-template-pipeline-p2-56" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CI_NPM_SCRIPT =
  "test:ci:case-study-template-pipeline-p2-56" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_UNIT_TEST =
  "tests/unit/case-study-template-pipeline-p2-56.test.ts" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

/** Days after pilot start when M1 publish review becomes eligible. */
export const CASE_STUDY_PIPELINE_P2_56_PUBLISH_REVIEW_DAYS = 30 as const;

export const CASE_STUDY_PIPELINE_P2_56_LOI_DOC = "docs/loi-design-partner-template.md" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_PRE_LOI_TEMPLATE_DOC =
  "docs/case-study-template-pre-pilot.md" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_MILESTONE_TEMPLATE_DOC =
  "docs/case-study-template-p2-50.md" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_PUBLISH_GATES_DOC =
  "docs/case-study-template.md" as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_STAGES = [
  "pre_loi_template",
  "loi_signed_internal_draft",
  "pilot_active_w1",
  "pilot_day_30_publish_review",
  "published_post_gates",
] as const;

export type CaseStudyPipelineP256Stage =
  (typeof CASE_STUDY_TEMPLATE_PIPELINE_P2_56_STAGES)[number];

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_TEMPLATE_BY_STAGE: Record<
  CaseStudyPipelineP256Stage,
  string
> = {
  pre_loi_template: CASE_STUDY_TEMPLATE_PIPELINE_P2_56_PRE_LOI_TEMPLATE_DOC,
  loi_signed_internal_draft: "docs/case-studies/_MILESTONE_TEMPLATE.md",
  pilot_active_w1: "docs/case-studies/_MILESTONE_TEMPLATE.md",
  pilot_day_30_publish_review: CASE_STUDY_TEMPLATE_PIPELINE_P2_56_PUBLISH_GATES_DOC,
  published_post_gates: "lib/marketing/case-studies.ts",
};

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_HONESTY_MARKERS = [
  "internal draft",
  "no published customer",
  "not contacted",
  "target",
  "permission",
] as const;

export const CASE_STUDY_TEMPLATE_PIPELINE_P2_56_WIRING_PATHS = [
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_FILL_IN_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_ARTIFACT,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_AUDIT_MODULE,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_MEASUREMENT_MODULE,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_UNIT_TEST,
  CASE_STUDY_PIPELINE_P2_56_LOI_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_PRE_LOI_TEMPLATE_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_MILESTONE_TEMPLATE_DOC,
  CASE_STUDY_TEMPLATE_PIPELINE_P2_56_PUBLISH_GATES_DOC,
  "docs/case-studies/_MILESTONE_TEMPLATE.md",
  "artifacts/pilot-gono-go-summary.json",
] as const;
