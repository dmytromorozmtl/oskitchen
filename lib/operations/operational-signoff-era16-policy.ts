/**
 * KDS + production calendar operational sign-off — Evolution Era 16 Cycle 10.
 *
 * Turns staging smoke docs into a unified sign-off artifact with explicit
 * PASSED / FAILED / SKIPPED WITH REASON. Does NOT claim rush-hour certification.
 */

export const OPERATIONAL_SIGNOFF_ERA16_POLICY_ID = "era16-operational-signoff-v1" as const;

export const OPERATIONAL_SIGNOFF_ERA16_DECISION_DATE = "2026-05-28" as const;

export const OPERATIONAL_SIGNOFF_ERA16_EXTENDS_POLICIES = [
  "era15-kds-staging-smoke-recert-v1",
  "era15-production-calendar-operator-recert-v1",
  "era16-commercial-pilot-evidence-pack-v1",
] as const;

export const OPERATIONAL_SIGNOFF_ERA16_SUMMARY_MODULE =
  "lib/operations/operational-signoff-summary.ts" as const;

export const OPERATIONAL_SIGNOFF_ERA16_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-operational-signoff-era16.ts" as const;

export const OPERATIONAL_SIGNOFF_ERA16_CERT_SCRIPT =
  "scripts/cert-operational-signoff-era16.ts" as const;

export const OPERATIONAL_SIGNOFF_ERA16_SUMMARY_ARTIFACT =
  "artifacts/operational-signoff-summary.json" as const;

export const OPERATIONAL_SIGNOFF_ERA16_NPM_SCRIPT = "smoke:operational-signoff-era16" as const;

export const OPERATIONAL_SIGNOFF_ERA16_ENV_VARS = [
  "OPERATIONAL_SIGNOFF_STAGING_URL",
  "OPERATIONAL_SIGNOFF_OPERATOR_EMAIL",
  "OPERATIONAL_SIGNOFF_PILOT_TENANT_ID",
  "OPERATIONAL_SIGNOFF_COMMIT_SHA",
] as const;

export const OPERATIONAL_SIGNOFF_ERA16_SUBSYSTEMS = [
  {
    id: "kds",
    label: "KDS staging smoke",
    smokeScript: "smoke:kds-staging",
    manualDoc: "docs/kds-staging-smoke-checklist.md",
    policyId: "era15-kds-staging-smoke-recert-v1",
  },
  {
    id: "production_calendar",
    label: "Production calendar operator smoke",
    smokeScript: "smoke:production-calendar",
    manualDoc: "docs/production-calendar-operator-checklist.md",
    policyId: "era15-production-calendar-operator-recert-v1",
  },
] as const;

export const OPERATIONAL_SIGNOFF_ERA16_HONEST_SCOPE = {
  rushHourKdsCertified: false,
  productionCalendarDragDrop: false,
  kdsSyncFromProductionCalendar: false,
  manualStagingRequiredForFullSignOff: true,
  inDefaultCi: false,
} as const;

export const OPERATIONAL_SIGNOFF_ERA16_CANONICAL_MARKERS = [
  OPERATIONAL_SIGNOFF_ERA16_POLICY_ID,
  OPERATIONAL_SIGNOFF_ERA16_SUMMARY_MODULE,
  "operational-signoff-summary",
  "operational sign-off",
] as const;

export const OPERATIONAL_SIGNOFF_ERA16_FORBIDDEN_CLAIMS = [
  "rush-hour kds certified",
  "production calendar rush-hour certified",
  "full operational certification",
] as const;

export const OPERATIONAL_SIGNOFF_ERA16_CI_SCRIPTS = [
  "test:ci:operational-signoff-era16",
  "test:ci:operational-signoff-era16:cert",
] as const;

export const OPERATIONAL_SIGNOFF_ERA16_UNIT_TESTS = [
  "tests/unit/operational-signoff-summary.test.ts",
  "tests/unit/operational-signoff-era16-policy.test.ts",
  "tests/unit/operational-signoff-era16-cert-live.test.ts",
] as const;

export const OPERATIONAL_SIGNOFF_ERA16_CANONICAL_DOC_PATHS = [
  "docs/kds-staging-smoke-checklist.md",
  "docs/production-calendar-operator-checklist.md",
  "docs/commercial-pilot-runbook.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const OPERATIONAL_SIGNOFF_ERA16_RUNBOOK_DOC = "docs/commercial-pilot-runbook.md" as const;

export const OPERATIONAL_SIGNOFF_ERA16_REVIEW_SECTION =
  "Era 16 operational sign-off (2026-05-28)" as const;
