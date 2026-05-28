/**
 * Staging workflows first green evidence — Evolution Era 17 (P0 commercial ops proof).
 *
 * Extends Era 16 first-green path with explicit missing-env reporting and
 * GitHub run URL recording. Does NOT claim staging E2E green without GitHub PASS.
 */

import {
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT,
} from "@/lib/ci/staging-workflows-first-green-era16-policy";

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID =
  "era17-staging-workflows-first-green-v1" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_DECISION_DATE = "2026-05-28" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_EXTENDS_POLICIES = [
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_POLICY_ID,
  "era15-staging-workflows-first-run-recert-v1",
] as const;

/** Awaiting GitHub workflow_dispatch PASS — not certified green yet. */
export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_PROOF_STATUS =
  "awaiting_github_first_green" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-staging-workflows-first-green-era17.ts" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_SUMMARY_ARTIFACT =
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_NPM_SCRIPT =
  "smoke:staging-workflows-first-green" as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_LEGACY_SMOKE =
  "smoke:staging-workflows" as const;

/** Prerequisite secrets for staging workflow jobs (never commit values). */
export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_PREREQUISITE_ENV_VARS = [
  "E2E_STAGING_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
  "E2E_PASSWORD",
] as const;

/** Operator-recorded GitHub Actions outcomes after workflow_dispatch (never commit URLs with tokens). */
export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_GITHUB_EVIDENCE_ENV_VARS = [
  "GITHUB_E2E_STAGING_RUN_URL",
  "GITHUB_E2E_STAGING_RUN_OUTCOME",
  "GITHUB_KDS_STAGING_RUN_URL",
  "GITHUB_KDS_STAGING_RUN_OUTCOME",
  "GITHUB_WOO_SHOPIFY_STAGING_RUN_URL",
  "GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_TRACKED_WORKFLOWS = [
  {
    id: "e2e_staging",
    workflow: ".github/workflows/e2e-staging.yml",
    runUrlEnv: "GITHUB_E2E_STAGING_RUN_URL",
    outcomeEnv: "GITHUB_E2E_STAGING_RUN_OUTCOME",
    label: "E2E Staging",
  },
  {
    id: "kds_staging",
    workflow: ".github/workflows/playwright-kds-staging.yml",
    runUrlEnv: "GITHUB_KDS_STAGING_RUN_URL",
    outcomeEnv: "GITHUB_KDS_STAGING_RUN_OUTCOME",
    label: "Playwright KDS Staging",
  },
  {
    id: "woo_shopify_staging",
    workflow: ".github/workflows/woo-shopify-staging-smoke.yml",
    runUrlEnv: "GITHUB_WOO_SHOPIFY_STAGING_RUN_URL",
    outcomeEnv: "GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME",
    label: "Woo Shopify Staging Smoke",
  },
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Configure GitHub secrets: E2E_STAGING_BASE_URL, E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD.",
  "Actions → E2E Staging → Run workflow → confirm staging-e2e job appears (not JOB_OMITTED_SECRETS_MISSING).",
  "Record GITHUB_E2E_STAGING_RUN_URL and GITHUB_E2E_STAGING_RUN_OUTCOME=PASSED|FAILED|SKIPPED.",
  "Optional: Playwright KDS Staging + Woo Shopify Staging Smoke with same pattern.",
  "Run npm run smoke:staging-workflows-first-green — review artifacts/staging-workflows-first-green-summary.json.",
  "Era 17 success requires at least two of three workflows with GitHub PASSED — not wiring cert alone.",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CANONICAL_MARKERS = [
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID,
  "staging-workflows-first-green",
  "awaiting_github_first_green",
  "GITHUB_E2E_STAGING_RUN_URL",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_FORBIDDEN_CLAIMS = [
  "staging e2e always green in ci",
  "github staging workflows run on every pr",
  "first green without secrets",
  "staging certified without github pass",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CI_SCRIPTS = [
  "test:ci:staging-workflows-first-green-era17",
  "test:ci:staging-workflows-first-green-era17:cert",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_UNIT_TESTS = [
  "tests/unit/staging-workflows-first-green-era17-policy.test.ts",
  "tests/unit/staging-workflows-first-green-era17-cert-live.test.ts",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_CANONICAL_DOC_PATHS = [
  "docs/GITHUB_E2E_STAGING_SECRETS.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const STAGING_WORKFLOWS_FIRST_GREEN_ERA17_REVIEW_SECTION =
  "Era 17 staging workflows first green (2026-05-28)" as const;
