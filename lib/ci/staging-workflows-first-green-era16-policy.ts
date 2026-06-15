/**
 * Staging workflows first green evidence — Evolution Era 16 Cycle 14.
 *
 * Closes strategic priority #5: explicit first-green evidence path for optional
 * GitHub staging workflows. Does NOT wire staging into default ci.yml.
 */

import {
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_OMITTED_LABEL,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_OPS_DOC,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_WORKFLOWS,
} from "@/lib/ci/staging-workflows-first-run-era13-policy";
import { STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID } from "@/lib/ci/staging-workflows-first-run-era15-policy";
import { CHANNEL_LIVE_SMOKE_ERA16_WORKFLOW } from "@/lib/integrations/channel-live-smoke-era16-policy";

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID =
  "era16-staging-workflows-first-green-v1" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_DECISION_DATE = "2026-05-28" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_EXTENDS_POLICIES = [
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID,
  "era13-staging-workflows-first-run-ops-v1",
  "era16-channel-live-smoke-v1",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_MODULE =
  "lib/ci/staging-workflows-first-green-summary.ts" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-staging-workflows-first-green-era16.ts" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_CERT_SCRIPT =
  "scripts/cert-staging-workflows-first-green-era16.ts" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT =
  "artifacts/staging-workflows-first-green-summary.json" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_NPM_SCRIPT =
  "smoke:staging-workflows-first-green" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_LEGACY_SMOKE =
  "smoke:staging-workflows" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_ENV_VARS = [
  "E2E_STAGING_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
  "E2E_PASSWORD",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_OPTIONAL_WORKFLOWS = [
  ...STAGING_WORKFLOWS_FIRST_RUN_ERA13_WORKFLOWS.map((entry) => entry.workflow),
  CHANNEL_LIVE_SMOKE_ERA16_WORKFLOW,
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_PILOT_RUNBOOK_STEPS = [
  "Run npm run smoke:staging-workflows-first-green locally (wiring cert + optional staging health).",
  "Configure GitHub secrets: E2E_STAGING_BASE_URL, E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD.",
  "Actions → E2E Staging → Run workflow → confirm staging-e2e job appears (not JOB_OMITTED_SECRETS_MISSING).",
  "Actions → Playwright KDS Staging → download kds-realtime-e2e-staging-summary artifact.",
  "Optional: Actions → Woo Shopify Staging Smoke when DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL set.",
  "Record PASSED / FAILED / SKIPPED WITH REASON in artifacts/staging-workflows-first-green-summary.json.",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_HONEST_SCOPE = {
  inDefaultCi: false,
  claimsStagingCertifiedWithoutSecrets: false,
  jobOmittedWhenSecretsMissing: true,
  firstGreenRequiresOperatorRun: true,
} as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_CANONICAL_MARKERS = [
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_MODULE,
  "staging-workflows-first-green",
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_OMITTED_LABEL,
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_FORBIDDEN_CLAIMS = [
  "staging e2e always green in ci",
  "github staging workflows run on every pr",
  "first green without secrets",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_CI_SCRIPTS = [
  "test:ci:staging-workflows-first-green-era16",
  "test:ci:staging-workflows-first-green-era16:cert",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_UNIT_TESTS = [
  "tests/unit/staging-workflows-first-green-summary.test.ts",
  "tests/unit/staging-workflows-first-green-era16-policy.test.ts",
  "tests/unit/staging-workflows-first-green-era16-cert-live.test.ts",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_CANONICAL_DOC_PATHS = [
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_OPS_DOC,
  "docs/ci-e2e-tier-matrix.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/qa-master-test-plan.md",
  "docs/commercial-pilot-runbook.md",
  "docs/implementation-backlog.md",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_REVIEW_SECTION =
  "Era 16 staging workflows first green (2026-05-28)" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA16_JOB_OMITTED_LABEL =
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_OMITTED_LABEL;
