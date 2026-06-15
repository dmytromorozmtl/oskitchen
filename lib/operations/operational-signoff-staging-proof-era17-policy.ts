/**
 * Operational sign-off staging proof — Evolution Era 17 Workstream F Cycle 26.
 *
 * Records real staging URL + operator identity for KDS + production calendar sign-off.
 * Does NOT claim rush-hour certification or full manual UI completion without operator attestation.
 */

import {
  OPERATIONAL_SIGNOFF_ERA16_POLICY_ID,
  OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT,
} from "@/lib/operations/operational-signoff-era16-policy";

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID =
  "era17-operational-signoff-staging-proof-v1" as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_DECISION_DATE = "2026-05-28" as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_EXTENDS_POLICIES = [
  OPERATIONAL_SIGNOFF_ERA16_POLICY_ID,
  "era15-kds-staging-smoke-recert-v1",
  "era15-production-calendar-operator-recert-v1",
] as const;

/** Awaiting operator staging URL + manual checklist completion. */
export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_PROOF_STATUS =
  "awaiting_staging_operator_signoff" as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-operational-signoff-staging-era17.ts" as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_SUMMARY_ARTIFACT =
  "artifacts/operational-signoff-staging-proof-summary.json" as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_LEGACY_ARTIFACT =
  OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_NPM_SCRIPT =
  "smoke:operational-signoff-staging" as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_LEGACY_SMOKE =
  "smoke:operational-signoff-era16" as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_PREREQUISITE_ENV_VARS = [
  "OPERATIONAL_SIGNOFF_STAGING_URL",
  "OPERATIONAL_SIGNOFF_OPERATOR_EMAIL",
] as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_OPTIONAL_ENV_VARS = [
  "OPERATIONAL_SIGNOFF_PILOT_TENANT_ID",
  "OPERATIONAL_SIGNOFF_COMMIT_SHA",
  "OPERATIONAL_SIGNOFF_NOTES",
  "OPERATIONAL_SIGNOFF_KDS_MANUAL",
  "OPERATIONAL_SIGNOFF_PRODUCTION_CALENDAR_MANUAL",
] as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Set OPERATIONAL_SIGNOFF_STAGING_URL to staging host (e.g. https://staging.example.com).",
  "Set OPERATIONAL_SIGNOFF_OPERATOR_EMAIL to the kitchen/ops lead performing sign-off.",
  "Run npm run smoke:operational-signoff-staging — review both summary artifacts.",
  "Complete manual KDS + production calendar checklists on staging.",
  "Re-run with OPERATIONAL_SIGNOFF_KDS_MANUAL=passed and OPERATIONAL_SIGNOFF_PRODUCTION_CALENDAR_MANUAL=passed when checklists complete.",
  "Do not claim rush-hour or full production SLO certification.",
] as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CANONICAL_MARKERS = [
  OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_POLICY_ID,
  "smoke:operational-signoff-staging",
  "awaiting_staging_operator_signoff",
  "OPERATIONAL_SIGNOFF_STAGING_URL",
] as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_FORBIDDEN_CLAIMS = [
  "rush-hour kds certified",
  "full operational certification without manual sign-off",
  "staging sign-off without operator email",
] as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CI_SCRIPTS = [
  "test:ci:operational-signoff-staging-proof-era17",
  "test:ci:operational-signoff-staging-proof-era17:cert",
] as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_UNIT_TESTS = [
  "tests/unit/operational-signoff-staging-proof-era17-policy.test.ts",
  "tests/unit/operational-signoff-staging-proof-summary.test.ts",
  "tests/unit/operational-signoff-staging-proof-era17-cert-live.test.ts",
] as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_CANONICAL_DOC_PATHS = [
  "docs/kds-staging-smoke-checklist.md",
  "docs/production-calendar-operator-checklist.md",
  "docs/commercial-pilot-runbook.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_REVIEW_SECTION =
  "Era 17 operational sign-off staging proof (2026-05-28)" as const;

export const OPERATIONAL_SIGNOFF_STAGING_PROOF_ERA17_BACKLOG_ID = "KOS-E17-016" as const;
