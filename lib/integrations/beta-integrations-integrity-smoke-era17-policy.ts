/**
 * Unified BETA integrations integrity smoke — chains registry + env audits (DEV-52).
 */

export const BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_POLICY_ID =
  "era17-beta-integrations-integrity-smoke-v1" as const;

export const BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_DOC =
  "docs/beta-integrations-integrity-smoke.md" as const;

export const BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-beta-integrations-integrity-era17.ts" as const;

export const BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_SUMMARY_ARTIFACT =
  "artifacts/smoke-beta-integrations-integrity-summary.json" as const;

export const BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_NPM_SCRIPT =
  "smoke:beta-integrations-integrity" as const;

export const BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Run npm run smoke:beta-integrations-integrity — review artifacts/smoke-beta-integrations-integrity-summary.json.",
  "Confirm registryProofStatus=scaffold_complete and envProofStatus=env_audit_complete.",
  "Use Integration Health panel + vault ops to close env gaps before pilot G2 claims.",
] as const;
