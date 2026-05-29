/**
 * Era25 governance train terminal seal — final seal on era47–AM convergence governance train.
 * Policy: era64-era25-governance-train-terminal-seal-phases-v1
 */
import {
  ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_TRACKED_ENV_KEYS,
  ERA25_FROZEN_AFTER_WITNESS_ENV_KEYS,
} from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-phases-era63";

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA64_PHASES_POLICY_ID =
  "era64-era25-governance-train-terminal-seal-phases-v1" as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_DOC =
  "docs/next-step-era25-governance-train-terminal-seal-phase-an-product-2026-05-28.md" as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_PLATFORM_ANCHOR =
  "#era25-governance-train-terminal-seal" as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_TRACKED_ENV_KEYS = [
  "ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_ATTESTED",
  "ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ERA25_REPORT_REVIEWED",
] as const;

/** Env keys that must not mutate after honest governance train terminal seal. */
export const ERA25_FROZEN_AFTER_TERMINAL_SEAL_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_WITNESS_ENV_KEYS,
  ...ERA25_POST_MARKET_PROOF_STEADY_OPERATIONAL_WITNESS_TRACKED_ENV_KEYS,
] as const;

export function detectEra25GovernanceTrainTerminalSealStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25GovernanceReopenClaimedAfterTerminalSeal(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_TERMINAL_SEAL_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_BACKLOG_ID =
  "KOS-E25-019-GOVERNANCE-TRAIN-TERMINAL-SEAL" as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_GUARDRAILS: readonly string[] = [
  "Never attest governance train terminal seal before post-market steady ops witness + governance chain closed",
  "Never mutate era25 convergence governance env after terminal seal baseline — sustain improvement loop + commercial ops only",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after seal baseline sync",
] as const;

export const ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-governance-train-terminal-seal-integrity",
  "ops:validate-era25-post-market-proof-steady-operational-witness-integrity",
  "ops:validate-continuous-improvement-loop-integrity",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
