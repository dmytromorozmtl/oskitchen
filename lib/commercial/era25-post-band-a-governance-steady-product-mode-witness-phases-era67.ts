/**
 * Era25 post-band-a-governance steady product mode witness — post-governance product ops only.
 * Policy: era67-era25-post-band-a-governance-steady-product-mode-witness-phases-v1
 */
import {
  ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_TRACKED_ENV_KEYS,
  ERA25_FROZEN_AFTER_CAPSTONE_WITNESS_ENV_KEYS,
} from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-phases-era66";

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA67_PHASES_POLICY_ID =
  "era67-era25-post-band-a-governance-steady-product-mode-witness-phases-v1" as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_DOC =
  "docs/next-step-era25-post-band-a-governance-steady-product-mode-witness-phase-aq-product-2026-05-28.md" as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_PLATFORM_ANCHOR =
  "#era25-post-band-a-governance-steady-product-mode-witness" as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_TRACKED_ENV_KEYS = [
  "ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_ATTESTED",
  "ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ERA25_REPORT_REVIEWED",
] as const;

/** Env keys that must not mutate after honest post-governance steady product mode witness. */
export const ERA25_FROZEN_AFTER_STEADY_PRODUCT_MODE_WITNESS_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_CAPSTONE_WITNESS_ENV_KEYS,
  ...ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_TRACKED_ENV_KEYS,
] as const;

export function detectEra25PostBandAGovernanceSteadyProductModeWitnessStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25GovernanceReopenClaimedAfterSteadyProductModeWitness(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_STEADY_PRODUCT_MODE_WITNESS_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_BACKLOG_ID =
  "KOS-E25-022-POST-BAND-A-GOVERNANCE-STEADY-PRODUCT-MODE-WITNESS" as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_GUARDRAILS: readonly string[] = [
  "Never attest steady product mode witness before Band A capstone witness + improvement loop PASS",
  "Never mutate era25 convergence governance env after steady product mode witness baseline — sustain improvement loop + honest commercial artifacts only",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after steady product mode witness baseline sync",
] as const;

export const ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_FOREVER_COMMANDS: readonly string[] =
  [
    "ops:validate-era25-post-band-a-governance-steady-product-mode-witness-integrity",
    "ops:validate-era25-band-a-governance-chain-capstone-witness-integrity",
    "ops:validate-continuous-improvement-loop-integrity",
    "test:ci:governance-bundles",
    "test:ci:commercial-pilot-runbook:cert",
  ] as const;
