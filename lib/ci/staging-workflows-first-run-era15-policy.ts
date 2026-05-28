/**
 * Staging workflows first-run ops Era 15 recertification — Evolution Era 15 Cycle 3.
 *
 * Re-validates Era 12/13 optional GitHub staging workflows after Era 14/15 recerts.
 * Does not wire staging Playwright into default ci.yml or imply green when secrets missing.
 */

import { KDS_STAGING_SMOKE_ERA15_POLICY_ID } from "@/lib/kitchen/kds-staging-smoke-era15-policy";
import {
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_FIRST_RUN_CHECKLIST,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_IF_EXPRESSION,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_OMITTED_LABEL,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_OPS_DOC,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_OUTCOME_LABELS,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_WORKFLOWS,
} from "@/lib/ci/staging-workflows-first-run-era13-policy";

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID =
  "era15-staging-workflows-first-run-recert-v1" as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_EXTENDS_POLICIES = [
  "era12-e2e-staging-secrets-align-v1",
  "era12-e2e-staging-auth-wiring-v1",
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID,
  "era13-kds-staging-workflow-secrets-align-v1",
  KDS_STAGING_SMOKE_ERA15_POLICY_ID,
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_JOB_IF_EXPRESSION =
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_IF_EXPRESSION;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_WORKFLOWS =
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_WORKFLOWS;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_OUTCOME_LABELS =
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_OUTCOME_LABELS;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_JOB_OMITTED_LABEL =
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_OMITTED_LABEL;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_PILOT_CHECKLIST = [
  ...STAGING_WORKFLOWS_FIRST_RUN_ERA13_FIRST_RUN_CHECKLIST,
  "After Era 15 recert: run npm run smoke:staging-workflows before claiming staging E2E is certified in sales.",
  "KDS workflow: confirm kds-realtime-e2e-staging-summary is PASSED / FAILED / SKIPPED WITH REASON — never silent pass.",
  "Missing secrets → JOB_OMITTED_SECRETS_MISSING (job absent) — not a green workflow run.",
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_OPS_DOC =
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_OPS_DOC;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_SMOKE_SCRIPT =
  "scripts/smoke-staging-workflows.ts" as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_SMOKE_NPM_SCRIPT =
  "smoke:staging-workflows" as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_CI_SCRIPTS = [
  "test:ci:staging-workflows-first-run-era15",
  "test:ci:staging-workflows-first-run-era15:cert",
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_UNIT_TESTS = [
  "tests/unit/staging-workflows-first-run-era15-policy.test.ts",
  "tests/unit/staging-workflows-first-run-era15-cert-live.test.ts",
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_CANONICAL_DOC_PATHS = [
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_OPS_DOC,
  "docs/ci-e2e-tier-matrix.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/kds-staging-smoke-checklist.md",
  "docs/qa-master-test-plan.md",
  "docs/implementation-backlog.md",
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA15_CANONICAL_MARKERS = [
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_RUN_ERA15_JOB_OMITTED_LABEL,
  "not a green pass",
  "PASSED",
  "FAILED",
  "SKIPPED WITH REASON",
] as const;
