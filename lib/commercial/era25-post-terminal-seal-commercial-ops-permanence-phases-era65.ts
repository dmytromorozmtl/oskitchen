/**
 * Era25 post-terminal-seal commercial ops permanence — sustained commercial rhythm after train seal.
 * Policy: era65-era25-post-terminal-seal-commercial-ops-permanence-phases-v1
 */
import {
  ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_TRACKED_ENV_KEYS,
  ERA25_FROZEN_AFTER_TERMINAL_SEAL_ENV_KEYS,
} from "@/lib/commercial/era25-governance-train-terminal-seal-phases-era64";

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA65_PHASES_POLICY_ID =
  "era65-era25-post-terminal-seal-commercial-ops-permanence-phases-v1" as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_DOC =
  "docs/next-step-era25-post-terminal-seal-commercial-ops-permanence-phase-ao-product-2026-05-28.md" as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_PLATFORM_ANCHOR =
  "#era25-post-terminal-seal-commercial-ops-permanence" as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_TRACKED_ENV_KEYS = [
  "ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_ATTESTED",
  "ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ERA25_REPORT_REVIEWED",
] as const;

/** Env keys that must not mutate after honest commercial ops permanence (reopens era25 governance). */
export const ERA25_FROZEN_AFTER_PERMANENCE_ENV_KEYS = [
  ...ERA25_FROZEN_AFTER_TERMINAL_SEAL_ENV_KEYS,
  ...ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_TRACKED_ENV_KEYS,
] as const;

export function detectEra25PostTerminalSealCommercialOpsPermanenceStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25GovernanceReopenClaimedAfterPermanence(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_PERMANENCE_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_BACKLOG_ID =
  "KOS-E25-020-POST-TERMINAL-SEAL-COMMERCIAL-OPS-PERMANENCE" as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_GUARDRAILS: readonly string[] = [
  "Never attest commercial ops permanence before governance train terminal seal + steady witness",
  "Never mutate era25 convergence governance env after permanence baseline — sustain improvement loop + honest commercial artifacts only",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles and test:ci:commercial-pilot-runbook:cert after permanence baseline sync",
] as const;

export const ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-post-terminal-seal-commercial-ops-permanence-integrity",
  "ops:validate-era25-governance-train-terminal-seal-integrity",
  "ops:validate-continuous-improvement-loop-integrity",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
