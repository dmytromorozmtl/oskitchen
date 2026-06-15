/**
 * KDS staging Playwright proof — Evolution Era 17 Workstream F Cycle 25.
 *
 * Records GitHub `playwright-kds-staging.yml` PASS evidence for pilot sales.
 * Does NOT claim rush-hour KDS, default-CI Playwright, or production Realtime SLO.
 */

import { KDS_STAGING_SMOKE_ERA15_POLICY_ID } from "@/lib/kitchen/kds-staging-smoke-era15-policy";
import { KDS_REALTIME_E2E_STAGING_WORKFLOW_ERA11_POLICY_ID } from "@/lib/ci/kds-realtime-e2e-staging-workflow-era11-policy";

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID =
  "era17-kds-staging-playwright-proof-v1" as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_DECISION_DATE = "2026-05-28" as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_EXTENDS_POLICIES = [
  KDS_STAGING_SMOKE_ERA15_POLICY_ID,
  KDS_REALTIME_E2E_STAGING_WORKFLOW_ERA11_POLICY_ID,
  "era13-kds-staging-workflow-secrets-align-v1",
] as const;

/** Awaiting GitHub playwright-kds-staging.yml PASS — not browser-certified yet. */
export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_PROOF_STATUS =
  "awaiting_github_kds_playwright_pass" as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-kds-staging-playwright-era17.ts" as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_SUMMARY_ARTIFACT =
  "artifacts/kds-staging-playwright-proof-summary.json" as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_NPM_SCRIPT =
  "smoke:kds-staging-playwright" as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_LEGACY_SMOKE = "smoke:kds-staging" as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_WORKFLOW =
  ".github/workflows/playwright-kds-staging.yml" as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_PREREQUISITE_ENV_VARS = [
  "E2E_STAGING_BASE_URL",
  "E2E_LOGIN_EMAIL",
  "E2E_LOGIN_PASSWORD",
  "E2E_PASSWORD",
] as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_GITHUB_EVIDENCE_ENV_VARS = [
  "GITHUB_KDS_STAGING_RUN_URL",
  "GITHUB_KDS_STAGING_RUN_OUTCOME",
] as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Configure GitHub secrets: E2E_STAGING_BASE_URL, E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD.",
  "Actions → Playwright KDS Staging → Run workflow → confirm kds-realtime-staging job appears.",
  "Record GITHUB_KDS_STAGING_RUN_URL and GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED|FAILED|SKIPPED.",
  "Run npm run smoke:kds-staging-playwright — review artifacts/kds-staging-playwright-proof-summary.json.",
  "Era 17 success requires GitHub PASSED with run URL — wiring cert alone is insufficient.",
  "Do not claim rush-hour or default-CI Playwright certification.",
] as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CANONICAL_MARKERS = [
  KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_POLICY_ID,
  "smoke:kds-staging-playwright",
  "awaiting_github_kds_playwright_pass",
  "GITHUB_KDS_STAGING_RUN_URL",
  "playwright-kds-staging.yml",
] as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_FORBIDDEN_CLAIMS = [
  "kds playwright always green in ci",
  "rush-hour kds certification",
  "default ci playwright kds",
  "kds staging pass without github evidence",
] as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CI_SCRIPTS = [
  "test:ci:kds-staging-playwright-proof-era17",
  "test:ci:kds-staging-playwright-proof-era17:cert",
] as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_UNIT_TESTS = [
  "tests/unit/kds-staging-playwright-proof-era17-policy.test.ts",
  "tests/unit/kds-staging-playwright-proof-summary.test.ts",
  "tests/unit/kds-staging-playwright-proof-era17-cert-live.test.ts",
] as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_CANONICAL_DOC_PATHS = [
  "docs/kds-staging-smoke-checklist.md",
  "docs/GITHUB_E2E_STAGING_SECRETS.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/qa-master-test-plan.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_REVIEW_SECTION =
  "Era 17 KDS staging Playwright proof (2026-05-28)" as const;

export const KDS_STAGING_PLAYWRIGHT_PROOF_ERA17_BACKLOG_ID = "KOS-E17-015" as const;
