/**
 * Staging workflows first-run ops — Evolution Era 13 Cycle 3.
 *
 * Documents when optional GitHub staging workflows run vs are omitted, expected
 * outcomes (PASSED / FAILED / SKIPPED WITH REASON), and the operator checklist
 * for the first green run. Prevents false confidence when secrets are missing.
 */

import { E2E_STAGING_SECRETS_PASSWORD_JOB_IF_FRAGMENT } from "@/lib/ci/e2e-staging-secrets-era12-policy";

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID =
  "era13-staging-workflows-first-run-ops-v1" as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_EXTENDS_POLICIES = [
  "era12-e2e-staging-secrets-align-v1",
  "era12-e2e-staging-auth-wiring-v1",
  "era13-kds-staging-workflow-secrets-align-v1",
  "era11-kds-realtime-e2e-staging-workflow-v1",
] as const;

/** GitHub Actions job `if:` — all three optional staging jobs use this gate. */
export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_IF_EXPRESSION =
  `secrets.E2E_STAGING_BASE_URL != '' && secrets.E2E_LOGIN_EMAIL != '' && ${E2E_STAGING_SECRETS_PASSWORD_JOB_IF_FRAGMENT}` as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_WORKFLOWS = [
  {
    workflow: ".github/workflows/e2e-staging.yml",
    jobId: "staging-e2e",
    workflowName: "E2E Staging",
    schedule: "0 6 * * * (daily 06:00 UTC)",
    trigger: "workflow_dispatch | schedule",
    notInDefaultCi: true,
    summaryArtifact: null,
    expectedWhenSecretsMissing:
      "Workflow run shows no staging-e2e job (job omitted) — not a green pass",
    expectedWhenSecretsPresent:
      "auth.setup → unauthenticated smoke → dashboard-authed smoke; optional storefront when E2E_STOREFRONT_SLUG set",
  },
  {
    workflow: ".github/workflows/playwright-kds-staging.yml",
    jobId: "kds-realtime-staging",
    workflowName: "Playwright KDS Staging",
    schedule: "0 7 * * 1 (weekly Monday 07:00 UTC)",
    trigger: "workflow_dispatch | schedule",
    notInDefaultCi: true,
    summaryArtifact: "kds-realtime-e2e-staging-summary",
    expectedWhenSecretsMissing:
      "Workflow run shows no kds-realtime-staging job (job omitted) — not a green pass",
    expectedWhenSecretsPresent:
      "Playwright KDS realtime staging E2E; summary artifact PASSED | FAILED | SKIPPED WITH REASON",
  },
  {
    workflow: ".github/workflows/closed-beta-gate.yml",
    jobId: "staging-smoke",
    workflowName: "Closed Beta Gate",
    schedule: null,
    trigger: "workflow_dispatch only (after security-bundle)",
    notInDefaultCi: true,
    summaryArtifact: null,
    expectedWhenSecretsMissing:
      "security-bundle may still run; staging-smoke job omitted when E2E secrets missing",
    expectedWhenSecretsPresent:
      "auth.setup → remediation IDOR + beta export streaming (authed) → smoke:remediation",
  },
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_OUTCOME_LABELS = [
  "PASSED",
  "FAILED",
  "SKIPPED WITH REASON",
] as const;

/** When required secrets are unset, the job is not scheduled — this is not PASSED. */
export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_OMITTED_LABEL =
  "JOB_OMITTED_SECRETS_MISSING" as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_FIRST_RUN_CHECKLIST = [
  "GitHub → Settings → Secrets and variables → Actions → set E2E_STAGING_BASE_URL, E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD (legacy E2E_PASSWORD alias accepted)",
  "Optional: Variables → E2E_STOREFRONT_SLUG for storefront spec in e2e-staging.yml",
  "Actions → E2E Staging → Run workflow → confirm staging-e2e job appears and completes green",
  "Actions → Playwright KDS Staging → Run workflow → confirm kds-realtime-staging job + download kds-realtime-e2e-staging-summary artifact",
  "Actions → Closed Beta Gate → Run workflow → confirm security-bundle then staging-smoke when secrets set",
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_OPS_DOC =
  "docs/GITHUB_E2E_STAGING_SECRETS.md" as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_CI_SCRIPTS = [
  "test:ci:staging-workflows-first-run-era13",
  "test:ci:staging-workflows-first-run-era13:cert",
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_UNIT_TESTS = [
  "tests/unit/staging-workflows-first-run-era13-policy.test.ts",
  "tests/unit/staging-workflows-first-run-era13-cert-live.test.ts",
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_CANONICAL_DOC_PATHS = [
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_OPS_DOC,
  "docs/ci-e2e-tier-matrix.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/kds-staging-smoke-checklist.md",
] as const;

export const STAGING_WORKFLOWS_FIRST_RUN_ERA13_CANONICAL_MARKERS = [
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_RUN_ERA13_JOB_OMITTED_LABEL,
  "JOB_OMITTED_SECRETS_MISSING",
  "not a green pass",
  "PASSED",
  "FAILED",
  "SKIPPED WITH REASON",
] as const;
