/**
 * Era25 Band A governance chain capstone witness — terminal witness on era61–AO stack.
 * Policy: era66-era25-band-a-governance-chain-capstone-witness-phases-v1
 */
import {
  ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_TRACKED_ENV_KEYS,
  ERA25_FROZEN_AFTER_PERMANENCE_ENV_KEYS,
} from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-phases-era65";

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA66_PHASES_POLICY_ID =
  "era66-era25-band-a-governance-chain-capstone-witness-phases-v1" as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_DOC =
  "docs/next-step-era25-band-a-governance-chain-capstone-witness-phase-ap-product-2026-05-28.md" as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_PLATFORM_ANCHOR =
  "#era25-band-a-governance-chain-capstone-witness" as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_TRACKED_ENV_KEYS = [
  "ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_ATTESTED",
  "ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ERA25_REPORT_REVIEWED",
] as const;

/** Env keys that must not mutate after honest Band A capstone witness. */
export const ERA25_FROZEN_AFTER_CAPSTONE_WITNESS_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_PERMANENCE_ENV_KEYS,
  ...ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_TRACKED_ENV_KEYS,
] as const;

export function detectEra25BandAGovernanceChainCapstoneWitnessStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25GovernanceReopenClaimedAfterCapstoneWitness(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_CAPSTONE_WITNESS_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_BACKLOG_ID =
  "KOS-E25-021-BAND-A-GOVERNANCE-CHAIN-CAPSTONE-WITNESS" as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_GUARDRAILS: readonly string[] = [
  "Never attest Band A capstone witness before commercial ops permanence + governance train sealed",
  "Never mutate era25 convergence governance env after capstone witness baseline — sustain improvement loop + honest commercial artifacts only",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after capstone witness baseline sync",
] as const;

export const ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-band-a-governance-chain-capstone-witness-integrity",
  "ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity",
  "ops:validate-continuous-improvement-loop-integrity",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
