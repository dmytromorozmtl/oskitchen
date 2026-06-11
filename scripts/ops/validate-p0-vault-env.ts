#!/usr/bin/env npx tsx
/**
 * Validates P0 ops vault env vars without faking smoke PASS.
 * Policy: era17-p0-staging-proof-unblock-v1
 */
import {
  P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG,
  P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
} from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import {
  isP0VaultDay0PartialComplete,
  resolveP0VaultDay0Milestone,
} from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import { logger } from "@/lib/logger";
import {
  P0_OPS_VAULT_ENV_KEYS,
  P0_OPS_VAULT_PHASES,
} from "@/lib/commercial/p0-ops-vault-phases-era21";

export type P0VaultEnvPhase = {
  id: string;
  label: string;
  keys: readonly string[];
};

/** @deprecated use P0_OPS_VAULT_PHASES from lib/commercial/p0-ops-vault-phases-era21 */
export const P0_VAULT_ENV_PHASES = P0_OPS_VAULT_PHASES;

export { P0_OPS_VAULT_ENV_KEYS as P0_VAULT_ENV_KEYS };

export function evaluateP0VaultEnv(env: NodeJS.ProcessEnv = process.env): {
  present: string[];
  missing: string[];
  phases: Array<P0VaultEnvPhase & { present: string[]; missing: string[]; complete: boolean }>;
  allPresent: boolean;
  day0PartialComplete: boolean;
  day0Milestone: ReturnType<typeof resolveP0VaultDay0Milestone>;
} {
  const present = P0_OPS_VAULT_ENV_KEYS.filter((key) => Boolean(env[key]?.trim()));
  const missing = P0_OPS_VAULT_ENV_KEYS.filter((key) => !env[key]?.trim());

  const phases = P0_OPS_VAULT_PHASES.map((phase) => {
    const phasePresent = phase.keys.filter((key) => Boolean(env[key]?.trim()));
    const phaseMissing = phase.keys.filter((key) => !env[key]?.trim());
    return {
      ...phase,
      present: phasePresent,
      missing: phaseMissing,
      complete: phaseMissing.length === 0,
    };
  });

  return {
    present,
    missing,
    phases,
    allPresent: missing.length === 0,
    day0PartialComplete: isP0VaultDay0PartialComplete({ phases }),
    day0Milestone: resolveP0VaultDay0Milestone({ env: { allPresent: missing.length === 0, present, phases } }),
  };
}

function printJson(result: ReturnType<typeof evaluateP0VaultEnv>): void {
  logger.cli(
    JSON.stringify(
      {
        policyId: P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
        presentCount: result.present.length,
        totalCount: P0_OPS_VAULT_ENV_KEYS.length,
        allPresent: result.allPresent,
        day0PartialComplete: result.day0PartialComplete,
        day0Milestone: result.day0Milestone,
        missing: result.missing,
        phases: result.phases.map((phase) => ({
          id: phase.id,
          label: phase.label,
          complete: phase.complete,
          missing: phase.missing,
        })),
      },
      null,
      2,
    ),
  );
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateP0VaultEnv();

  if (jsonOutput) {
    printJson(result);
    process.exit(result.allPresent ? 0 : 1);
  }

  logger.cli(`P0 ops vault validation (${P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID})\n`);
  logger.cli(`Present: ${result.present.length}/${P0_OPS_VAULT_ENV_KEYS.length}`);
  logger.cli(`Day 0 milestone: ${result.day0Milestone}`);
  logger.cli(`Day 0 partial (Phase 1+2): ${result.day0PartialComplete ? "yes" : "no"}\n`);

  for (const phase of result.phases) {
    const status = phase.complete ? "✓ complete" : `✗ ${phase.missing.length} missing`;
    logger.cli(`${phase.label} — ${status}`);
    for (const key of phase.present) logger.cli(`  ✓ ${key}`);
    for (const key of phase.missing) logger.cli(`  ✗ ${key}`);
    logger.cli("");
  }

  if (result.missing.length) {
    logger.cli("Child smoke mapping:");
    for (const entry of P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG) {
      if (!result.missing.includes(entry.key)) continue;
      logger.cli(`  ${entry.key} → ${entry.childSmokes.join(", ")}`);
    }
    logger.cli(`\nNext: ${P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC}`);
    logger.cli("      docs/p0-ops-vault-execution-playbook-2026-05-28.md");
    logger.cli("Then: npm run smoke:p0-staging-proof-unblock");
    process.exit(1);
  }

  logger.cli("All 11 P0 vars present.");
  logger.cli("Run: npm run smoke:p0-staging-proof-unblock");
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
