/**
 * LIVE integration DoD smoke — capstone for BETA governance arc (DEV-55).
 */

export const LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID =
  "era17-live-integration-dod-smoke-v1" as const;

export const LIVE_INTEGRATION_DOD_SMOKE_ERA17_DOC =
  "docs/live-integration-dod-smoke.md" as const;

export const LIVE_INTEGRATION_DOD_SMOKE_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-live-integration-dod-era17.ts" as const;

export const LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT =
  "artifacts/smoke-live-integration-dod-summary.json" as const;

export const LIVE_INTEGRATION_DOD_SMOKE_ERA17_NPM_SCRIPT =
  "smoke:live-integration-dod" as const;

export const LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT = 16 as const;

export const LIVE_INTEGRATION_REGISTRY_LIVE_COUNT = 3 as const;

export const LIVE_INTEGRATION_DOD_SMOKE_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Run npm run smoke:live-integration-dod — review artifacts/smoke-live-integration-dod-summary.json.",
  "Confirm integrityProofStatus=integrity_complete and g1ScaffoldReady=18/18.",
  "G3/G4 remain not_measured until production tenant proof — do not claim LIVE in GTM.",
] as const;
