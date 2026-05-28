/**
 * KDS staging smoke Era 15 recertification — Evolution Era 15 Cycle 1.
 *
 * Re-validates Era 4/6/8/10/11/13 KDS operational smoke after Era 14 honesty cycles.
 * Does not claim rush-hour, default-CI Playwright Realtime, or hardware certification.
 */

import {
  KDS_STAGING_SMOKE_ERA10_INTEGRATION_STAGES,
  KDS_STAGING_SMOKE_ERA10_INTEGRATION_TESTS,
  KDS_STAGING_SMOKE_ERA10_POLICY_ID,
} from "@/lib/kitchen/kds-staging-smoke-era10-policy";
import { KDS_STAGING_SMOKE_POLICY_ID } from "@/lib/kitchen/kds-staging-smoke-policy";
import { KDS_REALTIME_E2E_STAGING_POLICY_ID } from "@/lib/kitchen/kds-realtime-e2e-staging-policy";
import { KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID } from "@/lib/ci/kds-staging-workflow-secrets-era13-policy";

export const KDS_STAGING_SMOKE_ERA15_POLICY_ID = "era15-kds-staging-smoke-recert-v1" as const;

export const KDS_STAGING_SMOKE_ERA15_EXTENDS_POLICIES = [
  KDS_STAGING_SMOKE_POLICY_ID,
  KDS_STAGING_SMOKE_ERA10_POLICY_ID,
  "era6-kds-realtime-smoke-v1",
  KDS_REALTIME_E2E_STAGING_POLICY_ID,
  "era11-kds-realtime-e2e-staging-v1",
  KDS_STAGING_WORKFLOW_SECRETS_ERA13_POLICY_ID,
] as const;

export const KDS_STAGING_SMOKE_ERA15_INTEGRATION_TESTS = KDS_STAGING_SMOKE_ERA10_INTEGRATION_TESTS;

export const KDS_STAGING_SMOKE_ERA15_INTEGRATION_STAGES = KDS_STAGING_SMOKE_ERA10_INTEGRATION_STAGES;

export const KDS_STAGING_SMOKE_ERA15_REALTIME_PLAYWRIGHT_IN_DEFAULT_CI = false as const;

export const KDS_STAGING_SMOKE_ERA15_PLAYWRIGHT_WORKFLOW =
  ".github/workflows/playwright-kds-staging.yml" as const;

export const KDS_STAGING_SMOKE_ERA15_PILOT_CHECKLIST = [
  "Run npm run smoke:kds-staging before kitchen pilot sign-off (CI certs only — no browser).",
  "Tier B manual: queue → bump → recall on staging with DAILY_SERVICE tenant.",
  "Tier E Playwright: use playwright-kds-staging.yml or local playwright with E2E_LOGIN_* secrets.",
  "Do not claim rush-hour or multi-station certification.",
  "Check kds-realtime-e2e-staging-summary for PASSED / SKIPPED WITH REASON — never silent pass.",
] as const;

export const KDS_STAGING_SMOKE_ERA15_OPS_DOC = "docs/kds-staging-smoke-checklist.md" as const;

export const KDS_STAGING_SMOKE_ERA15_SMOKE_SCRIPT = "scripts/smoke-kds-staging.ts" as const;

export const KDS_STAGING_SMOKE_ERA15_SMOKE_NPM_SCRIPT = "smoke:kds-staging" as const;

export const KDS_STAGING_SMOKE_ERA15_CI_SCRIPTS = [
  "test:ci:kds-staging-smoke-era15",
  "test:ci:kds-staging-smoke-era15:cert",
] as const;

export const KDS_STAGING_SMOKE_ERA15_UNIT_TESTS = [
  "tests/unit/kds-staging-smoke-era15-policy.test.ts",
  "tests/unit/kds-staging-smoke-era15-cert-live.test.ts",
] as const;

export const KDS_STAGING_SMOKE_ERA15_CANONICAL_DOC_PATHS = [
  KDS_STAGING_SMOKE_ERA15_OPS_DOC,
  "docs/feature-maturity-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/implementation-backlog.md",
] as const;

export const KDS_STAGING_SMOKE_ERA15_CANONICAL_MARKERS = [
  KDS_STAGING_SMOKE_ERA15_POLICY_ID,
  KDS_STAGING_SMOKE_POLICY_ID,
  KDS_STAGING_SMOKE_ERA10_POLICY_ID,
  "recall_to_preparing",
  "rush-hour",
  "not in default CI",
] as const;
