/**
 * Era 148 — First case study wiring cert (Phase 10 #75).
 *
 * Full path: LOI → Week 1 report → internal draft case study → publish gates.
 */

import {
  CASE_STUDY_1_ERA75_CUSTOMER,
  CASE_STUDY_1_ERA75_DOC,
  CASE_STUDY_1_ERA75_FORBIDDEN_CLAIMS,
  CASE_STUDY_1_ERA75_LOI_DOC,
  CASE_STUDY_1_ERA75_LONG_FORM_SECTIONS,
  CASE_STUDY_1_ERA75_PILOT_WEEK1_DOC,
  CASE_STUDY_1_ERA75_POLICY_ID,
  CASE_STUDY_1_ERA75_PUBLISH_STATUS,
  CASE_STUDY_1_ERA75_SLUG,
  CASE_STUDY_1_ERA75_TEMPLATE_DOC,
} from "@/lib/marketing/case-study-1-era75-policy";

export const CASE_STUDY_1_ERA148_POLICY_ID = "era148-case-study-1-v1" as const;

export const CASE_STUDY_1_ERA148_SUMMARY_ARTIFACT =
  "artifacts/case-study-1-era148-smoke-summary.json" as const;

export const CASE_STUDY_1_ERA148_NPM_SCRIPT = "smoke:case-study-1-era148" as const;

export const CASE_STUDY_1_ERA148_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-case-study-1-era148.ts" as const;

export const CASE_STUDY_1_ERA148_OPS_DOC = "docs/case-study-1-era148-setup.md" as const;

export const CASE_STUDY_1_ERA148_CANONICAL_DOC = CASE_STUDY_1_ERA75_DOC;

export const CASE_STUDY_1_ERA148_WIRING_PATHS = [
  CASE_STUDY_1_ERA75_DOC,
  CASE_STUDY_1_ERA75_TEMPLATE_DOC,
  CASE_STUDY_1_ERA75_PILOT_WEEK1_DOC,
  CASE_STUDY_1_ERA75_LOI_DOC,
  "lib/marketing/case-study-1-era75-policy.ts",
  "components/marketing/case-study-detail.tsx",
  "tests/unit/case-study-1-era75.test.ts",
] as const;

export const CASE_STUDY_1_ERA148_CYCLE_RUNBOOK_STEPS = [
  "Confirm Week 1 report docs/pilot-week1-report.md — CONDITIONAL PASS with KPIs.",
  "Fill docs/case-study-1.md from case-study-template — all 10 long-form sections.",
  "Keep publish status internal_draft until PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed.",
  "Run npm run smoke:pilot-case-study-draft-era17 — draft artifact wiring check.",
  "Obtain written partner approval before /customers publish or RAW_CASE_STUDIES.",
  "Run npm run smoke:case-study-1-era148 — artifact overall PASSED.",
] as const;

export const CASE_STUDY_1_ERA148_CI_SCRIPTS = [
  "test:ci:case-study-1-era148",
  "test:ci:case-study-1-era148:cert",
] as const;

export const CASE_STUDY_1_ERA148_UNIT_TESTS = [
  "tests/unit/case-study-1-era148.test.ts",
  "tests/unit/case-study-1-era75.test.ts",
  "tests/unit/case-study-template-policy.test.ts",
] as const;

export const CASE_STUDY_1_ERA148_CANONICAL_POLICY_ID = CASE_STUDY_1_ERA75_POLICY_ID;

export const CASE_STUDY_1_ERA148_SLUG = CASE_STUDY_1_ERA75_SLUG;

export const CASE_STUDY_1_ERA148_CUSTOMER = CASE_STUDY_1_ERA75_CUSTOMER;

export const CASE_STUDY_1_ERA148_PUBLISH_STATUS = CASE_STUDY_1_ERA75_PUBLISH_STATUS;

export const CASE_STUDY_1_ERA148_LONG_FORM_SECTIONS = CASE_STUDY_1_ERA75_LONG_FORM_SECTIONS;

export const CASE_STUDY_1_ERA148_FORBIDDEN_CLAIMS = CASE_STUDY_1_ERA75_FORBIDDEN_CLAIMS;

export const CASE_STUDY_1_ERA148_DRAFT_ARTIFACT =
  "artifacts/pilot-case-study-draft-summary.json" as const;

export const CASE_STUDY_1_ERA148_CAPABILITIES = [
  "internal_draft_case_study",
  "week1_evidence_chain",
  "publish_gate",
] as const;
