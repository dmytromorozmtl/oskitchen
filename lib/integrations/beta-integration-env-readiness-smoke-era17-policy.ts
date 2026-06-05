/**
 * BETA integration env readiness smoke — Era 17 G2 gate audit artifact.
 */

export const BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_POLICY_ID =
  "era17-beta-integration-env-readiness-smoke-v1" as const;

export const BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_DOC =
  "docs/beta-integration-env-readiness-smoke.md" as const;

export const BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-beta-integration-env-readiness-era17.ts" as const;

export const BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_SUMMARY_ARTIFACT =
  "artifacts/smoke-beta-integration-env-readiness-summary.json" as const;

export const BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_NPM_SCRIPT =
  "smoke:beta-integration-env-readiness" as const;

export const BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_EXPECTED_COUNT = 8 as const;

export const BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Review Integration Health → BETA integration env readiness panel for missing platform vars.",
  "Run npm run smoke:beta-integration-env-readiness — review artifacts/smoke-beta-integration-env-readiness-summary.json.",
  "Set BETA_ENV_STRICT=1 in staging vault runs when at least one integration must be env-ready before pilot.",
] as const;
