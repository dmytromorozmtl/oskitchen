/**
 * Era25 post-market-proof steady operational witness — post-Band-A ops on frozen governance artifacts.
 * Policy: era63-era25-post-market-proof-steady-operational-witness-phases-v1
 */
import {
  ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_TRACKED_ENV_KEYS,
  ERA25_FROZEN_AFTER_CLOSURE_CAPSTONE_ENV_KEYS,
} from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-phases-era62";

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA63_PHASES_POLICY_ID =
  "era63-era25-post-market-proof-steady-operational-witness-phases-v1" as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_DOC =
  "docs/next-step-era25-post-market-proof-steady-operational-witness-phase-am-product-2026-05-28.md" as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_PLATFORM_ANCHOR =
  "#era25-post-market-proof-steady-operational-witness" as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_TRACKED_ENV_KEYS = [
  "ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_ATTESTED",
  "ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_ERA25_REPORT_REVIEWED",
] as const;

/** Env keys that must not mutate after honest post-market-proof witness (reopens era25 convergence governance). */
export const ERA25_FROZEN_AFTER_WITNESS_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_CLOSURE_CAPSTONE_ENV_KEYS,
  ...ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_TRACKED_ENV_KEYS,
] as const;

export function detectEra25PostMarketProofSteadyOperationalWitnessStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25GovernanceReopenClaimedAfterWitness(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_WITNESS_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_BACKLOG_ID =
  "KOS-E25-018-POST-MARKET-PROOF-STEADY-WITNESS" as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_GUARDRAILS: readonly string[] = [
  "Never attest post-market-proof witness before P0 closure capstone + governance chain closed",
  "Never mutate era25 convergence governance env after witness baseline — sustain improvement loop + commercial ops only",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after witness baseline sync",
] as const;

export const ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-post-market-proof-steady-operational-witness-integrity",
  "ops:validate-era25-p0-market-proof-honest-closure-capstone-integrity",
  "ops:validate-continuous-improvement-loop-integrity",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
