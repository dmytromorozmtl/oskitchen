/**
 * Blueprint P2-50 — Case study template (Challenge → Solution → Results W1/M1/M3).
 *
 * @see docs/case-study-template-p2-50.md
 * @see docs/case-studies/_MILESTONE_TEMPLATE.md
 */

export const CASE_STUDY_TEMPLATE_P2_50_POLICY_ID = "case-study-template-p2-50-v1" as const;

export const CASE_STUDY_TEMPLATE_P2_50_DOC = "docs/case-study-template-p2-50.md" as const;

export const CASE_STUDY_TEMPLATE_P2_50_FILL_IN_DOC =
  "docs/case-studies/_MILESTONE_TEMPLATE.md" as const;

export const CASE_STUDY_TEMPLATE_P2_50_MKT11_DOC = "docs/case-study-template.md" as const;

export const CASE_STUDY_TEMPLATE_P2_50_CONTENT_PATH =
  "lib/marketing/case-study-template-p2-50-content.ts" as const;

export const CASE_STUDY_TEMPLATE_P2_50_ARTIFACT =
  "artifacts/case-study-template-p2-50-registry.json" as const;

export const CASE_STUDY_TEMPLATE_P2_50_AUDIT_SCRIPT =
  "scripts/audit-case-study-template-p2-50.ts" as const;

export const CASE_STUDY_TEMPLATE_P2_50_NPM_SCRIPT = "audit:case-study-template-p2-50" as const;

export const CASE_STUDY_TEMPLATE_P2_50_CHECK_NPM_SCRIPT =
  "check:case-study-template-p2-50" as const;

export const CASE_STUDY_TEMPLATE_P2_50_UNIT_TEST =
  "tests/unit/case-study-template-p2-50.test.ts" as const;

export const CASE_STUDY_TEMPLATE_P2_50_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const CASE_STUDY_TEMPLATE_P2_50_CORE_SECTIONS = [
  "Challenge",
  "Solution",
  "Results",
] as const;

export const CASE_STUDY_TEMPLATE_P2_50_MILESTONES = ["W1", "M1", "M3"] as const;

export const CASE_STUDY_TEMPLATE_P2_50_FLOW_STEPS = [
  "define_challenge",
  "define_solution",
  "capture_results_w1",
  "capture_results_m1_m3",
] as const;

export const CASE_STUDY_TEMPLATE_P2_50_HONESTY_MARKERS = [
  "internal draft",
  "verified",
  "BETA",
  "not contacted",
  "target",
] as const;

export const CASE_STUDY_TEMPLATE_P2_50_WIRING_PATHS = [
  CASE_STUDY_TEMPLATE_P2_50_DOC,
  CASE_STUDY_TEMPLATE_P2_50_FILL_IN_DOC,
  CASE_STUDY_TEMPLATE_P2_50_CONTENT_PATH,
  "lib/marketing/case-study-template-p2-50-measurement.ts",
  "lib/marketing/case-study-template-p2-50-audit.ts",
  CASE_STUDY_TEMPLATE_P2_50_UNIT_TEST,
  CASE_STUDY_TEMPLATE_P2_50_ARTIFACT,
] as const;
