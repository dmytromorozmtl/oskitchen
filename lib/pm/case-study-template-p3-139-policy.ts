/**
 * Blueprint P3-139 — Case study template PM (pre-pilot with founder story).
 *
 * @see docs/case-study-template-pm.md
 */

export const CASE_STUDY_TEMPLATE_P3_139_POLICY_ID = "case-study-template-p3-139-v1" as const;

export const CASE_STUDY_TEMPLATE_P3_139_DOC = "docs/case-study-template-pm.md" as const;

export const CASE_STUDY_TEMPLATE_P3_139_ARTIFACT =
  "artifacts/case-study-template-pm-registry.json" as const;

export const CASE_STUDY_TEMPLATE_P3_139_AUDIT_SCRIPT =
  "scripts/audit-case-study-template-p3-139.ts" as const;

export const CASE_STUDY_TEMPLATE_P3_139_NPM_SCRIPT = "audit:case-study-template-p3-139" as const;

export const CASE_STUDY_TEMPLATE_P3_139_UNIT_TEST =
  "tests/unit/case-study-template-p3-139.test.ts" as const;

export const CASE_STUDY_TEMPLATE_P3_139_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const CASE_STUDY_TEMPLATE_P3_139_IMPLEMENTATION_REF =
  "case-study-template-pre-pilot-absolute-final-v1" as const;

export const CASE_STUDY_TEMPLATE_P3_139_TEMPLATE_TYPE = "pre_pilot_founder_story" as const;

export const CASE_STUDY_TEMPLATE_P3_139_SECTION_IDS = [
  "founder_story",
  "operator_archetype",
  "before_pilot",
  "why_building",
  "design_partner_cta",
  "upgrade_path",
  "forbidden_claims",
] as const;

export type CaseStudyTemplateP3_139SectionId =
  (typeof CASE_STUDY_TEMPLATE_P3_139_SECTION_IDS)[number];

export const CASE_STUDY_TEMPLATE_P3_139_FOUNDER_SUBSECTIONS = [
  "The problem we saw",
  "Why we built before the first customer",
  "Founder quote",
  "What changes after the first pilot",
] as const;

export const CASE_STUDY_TEMPLATE_P3_139_LIVE_AUDIT_NPM =
  "test:ci:case-study-template-pre-pilot" as const;

export const CASE_STUDY_TEMPLATE_P3_139_RELATED_DOCS = [
  "docs/case-study-template-pre-pilot.md",
  "docs/case-study-template.md",
  "docs/founding-customer-story.md",
  "docs/case-studies/_PRE_PILOT_TEMPLATE.md",
  "docs/sales-limitation-sheet.md",
  "lib/marketing/case-study-template-pre-pilot-policy.ts",
] as const;

export const CASE_STUDY_TEMPLATE_P3_139_HONESTY_MARKERS = [
  "Pre-pilot only",
  "founder story",
  "0 signed LOIs",
  "template_only",
  "baseline",
] as const;

export const CASE_STUDY_TEMPLATE_P3_139_WIRING_PATHS = [
  CASE_STUDY_TEMPLATE_P3_139_DOC,
  "lib/pm/case-study-template-p3-139-policy.ts",
  "lib/pm/case-study-template-p3-139-operations.ts",
  "lib/pm/case-study-template-p3-139-audit.ts",
  CASE_STUDY_TEMPLATE_P3_139_ARTIFACT,
  CASE_STUDY_TEMPLATE_P3_139_UNIT_TEST,
] as const;
