/**
 * Pilot case study draft — Evolution Era 17 Workstream K Cycle 43.
 *
 * Internal draft template gated on customer approval and pilot metrics.
 * Does NOT publish a customer case study without signed permission and verified KPIs.
 */

import { COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID } from "@/lib/commercial/competitor-feature-gap-matrix-era17-policy";
import { PILOT_METRICS_BASELINE_ERA17_POLICY_ID } from "@/lib/commercial/pilot-metrics-baseline-era17-policy";
import { PILOT_GONOGO_ERA17_POLICY_ID } from "@/lib/commercial/pilot-gono-go-era17-policy";

export const PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID =
  "era17-pilot-case-study-draft-v1" as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_EXTENDS_POLICIES = [
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID,
  PILOT_METRICS_BASELINE_ERA17_POLICY_ID,
  PILOT_GONOGO_ERA17_POLICY_ID,
  "era7-marketing-claims-governance-v1",
] as const;

/** Internal draft ready — public publish blocked until customer approval + metrics. */
export const PILOT_CASE_STUDY_DRAFT_ERA17_PROOF_STATUS =
  "internal_draft_awaiting_customer_approval" as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_DOC =
  "docs/pilot-case-study-draft-era17.md" as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pilot-case-study-draft-era17.ts" as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pilot-case-study-draft-summary.json" as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_NPM_SCRIPT = "smoke:pilot-case-study-draft" as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_PILOT_METRICS_ARTIFACT =
  "artifacts/pilot-metrics-baseline-summary.json" as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_APPROVAL_ENV =
  "PILOT_CASE_STUDY_CUSTOMER_APPROVAL" as const;

/** signed | anonymized_signed — required for publishProofStatus proof_ready_for_publish */
export const PILOT_CASE_STUDY_DRAFT_ERA17_VALID_APPROVAL_VALUES = [
  "signed",
  "anonymized_signed",
] as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_REQUIRED_SECTIONS = [
  "Purpose and honest scope",
  "Internal draft only",
  "Customer permission gate",
  "Metrics verification gate",
  "Safe case study wording",
  "Forbidden claims",
  "Anonymized pilot draft template",
  "Sign-off checklist",
] as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Review docs/pilot-case-study-draft-era17.md — internal_draft_awaiting_customer_approval.",
  "Confirm pilot agreement case study clause signed before any external publish.",
  "Capture KPIs via npm run smoke:pilot-metrics-baseline — overall PASSED required for metrics in draft.",
  "Set PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed|anonymized_signed only after written permission.",
  "Run npm run smoke:pilot-case-study-draft — review artifacts/pilot-case-study-draft-summary.json.",
  "Run MARKETING_CLAIMS_STRICT=1 verify-claims before publishing to /customers or sales deck.",
] as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_CANONICAL_MARKERS = [
  PILOT_CASE_STUDY_DRAFT_ERA17_POLICY_ID,
  "smoke:pilot-case-study-draft",
  "internal_draft_awaiting_customer_approval",
  "caseStudyProofStatus",
  "publishProofStatus",
] as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_FORBIDDEN_CLAIMS = [
  "published customer case study without signed approval",
  "fabricated pilot metrics or before/after numbers",
  "named customer reference without permission",
  "production sso or soc2 type ii in case study",
  "unified inventory or unified rewards outcomes",
  "rush-hour kds or toast parity claims",
  "live marketplace integration proof",
] as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_CI_SCRIPTS = [
  "test:ci:pilot-case-study-draft-era17",
  "test:ci:pilot-case-study-draft-era17:cert",
] as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_UNIT_TESTS = [
  "tests/unit/pilot-case-study-draft-era17-policy.test.ts",
  "tests/unit/pilot-case-study-draft-summary.test.ts",
  "tests/unit/pilot-case-study-draft-era17-cert-live.test.ts",
] as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_CANONICAL_DOC_PATHS = [
  PILOT_CASE_STUDY_DRAFT_ERA17_DOC,
  "docs/outreach/pilot-agreement-template.md",
  "docs/templates/CASE_STUDY_TEMPLATE.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/era17-strategic-execution-map-2026-05-28.md",
  "docs/competitor-feature-gap-matrix.md",
] as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_REVIEW_SECTION =
  "Era 17 pilot case study draft (2026-05-28)" as const;

export const PILOT_CASE_STUDY_DRAFT_ERA17_BACKLOG_ID = "KOS-E17-036" as const;
