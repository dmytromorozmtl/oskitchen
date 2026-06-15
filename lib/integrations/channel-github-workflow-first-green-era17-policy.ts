/**
 * Channel GitHub workflow first green — Evolution Era 17 Cycle 9.
 *
 * Records operator evidence from woo-shopify-staging-smoke.yml workflow_dispatch.
 * Does NOT claim GitHub PASS without recorded run URL + outcome.
 */

import { CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID } from "@/lib/integrations/channel-live-smoke-era16-policy";
import { CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID } from "@/lib/integrations/channel-live-smoke-shopify-era17-policy";
import { CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID } from "@/lib/integrations/channel-live-smoke-woo-era17-policy";

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID =
  "era17-channel-github-workflow-first-green-v1" as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_DECISION_DATE = "2026-05-28" as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_EXTENDS_POLICIES = [
  CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID,
  CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID,
  CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID,
] as const;

/** Awaiting workflow_dispatch PASS recorded in ops vault — not GitHub green yet. */
export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_PROOF_STATUS =
  "awaiting_github_first_green" as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_WORKFLOW =
  ".github/workflows/woo-shopify-staging-smoke.yml" as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-channel-github-workflow-first-green-era17.ts" as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_NPM_SCRIPT =
  "smoke:channel-github-workflow-first-green" as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_SUMMARY_ARTIFACT =
  "artifacts/channel-github-workflow-first-green-summary.json" as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_LIVE_SMOKE_ARTIFACT =
  "artifacts/channel-live-smoke-summary.json" as const;

/** GitHub Actions secrets required for woo-shopify-staging-smoke.yml (never commit values). */
export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_GITHUB_SECRET_VARS = [
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "CHANNEL_SMOKE_OWNER_EMAIL",
  "CHANNEL_SMOKE_CONNECTION_ID",
] as const;

/** Operator-recorded evidence after workflow_dispatch (never commit URLs with tokens). */
export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_GITHUB_EVIDENCE_ENV_VARS = [
  "GITHUB_WOO_SHOPIFY_STAGING_RUN_URL",
  "GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME",
] as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Configure GitHub secrets: DATABASE_URL, ENCRYPTION_KEY, CHANNEL_SMOKE_OWNER_EMAIL (or workflow owner_email input).",
  "Actions → Woo Shopify Staging Smoke → Run workflow (skip_live default true for credentials-only path).",
  "Confirm live-channel-smoke job runs — not skip-report (JOB_OMITTED_SECRETS_MISSING).",
  "Download channel-live-smoke-summary artifact from the GitHub run.",
  "Record GITHUB_WOO_SHOPIFY_STAGING_RUN_URL and GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME=PASSED|FAILED|SKIPPED.",
  "Run npm run smoke:channel-github-workflow-first-green — review artifacts/channel-github-workflow-first-green-summary.json.",
  "proof_passed requires GitHub outcome PASSED with run URL — wiring cert alone is insufficient.",
] as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CANONICAL_MARKERS = [
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID,
  "channel-github-workflow-first-green",
  "awaiting_github_first_green",
  "GITHUB_WOO_SHOPIFY_STAGING_RUN_URL",
  "woo-shopify-staging-smoke.yml",
] as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_FORBIDDEN_CLAIMS = [
  "woo shopify github workflow always green",
  "channel live smoke proven in ci without github pass",
  "marketplace live ops certified via workflow wiring alone",
] as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CI_SCRIPTS = [
  "test:ci:channel-github-workflow-first-green-era17",
  "test:ci:channel-github-workflow-first-green-era17:cert",
] as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_UNIT_TESTS = [
  "tests/unit/channel-github-workflow-first-green-era17-policy.test.ts",
  "tests/unit/channel-github-workflow-first-green-era17-cert-live.test.ts",
] as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_CANONICAL_DOC_PATHS = [
  "docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md",
  "docs/GITHUB_E2E_STAGING_SECRETS.md",
  "docs/commercial-pilot-runbook.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_REVIEW_SECTION =
  "Era 17 channel GitHub workflow first green (2026-05-28)" as const;
