/**
 * BETA governance smoke chain — registry → integrity → LIVE DoD (FINAL-05 / QA-45).
 */

export const BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_POLICY_ID =
  "era17-beta-governance-smoke-chain-v1" as const;

export const BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_DOC =
  "docs/beta-governance-smoke-chain.md" as const;

export const BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-beta-governance-smoke-chain-era17.ts" as const;

export const BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_SUMMARY_ARTIFACT =
  "artifacts/smoke-beta-governance-smoke-chain-summary.json" as const;

export const BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_NPM_SCRIPT =
  "smoke:beta-governance-chain" as const;

export const BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_CERT_NPM_SCRIPT =
  "test:ci:beta-governance-smoke-chain-era17:cert" as const;

export const BETA_GOVERNANCE_SMOKE_CHAIN_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Run npm run smoke:beta-governance-chain — review artifacts/smoke-beta-governance-smoke-chain-summary.json.",
  "Confirm registry + integrity + DoD chain overall PASSED with livePromotionCount=0.",
  "G3/G4 remain not_measured — do not claim LIVE in GTM or pilot decks.",
] as const;
