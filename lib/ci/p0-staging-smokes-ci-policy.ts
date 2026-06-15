/**
 * P0 staging smokes CI policy — Evolution Era 17 P0 ops bundle in default CI.
 *
 * Unit/policy gates run on every `p0-staging-smokes` job. Live staging smokes
 * (`smoke:p0-staging-proof-unblock`) run only when all 11 vault secrets exist;
 * CI must never imply P0 proof passed when smokes were skipped.
 */

import {
  P0_STAGING_PROOF_UNBLOCK_ERA17_NPM_SCRIPT,
  P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
} from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { P0_OPS_VAULT_ENV_KEYS } from "@/lib/commercial/p0-ops-vault-phases-era21";
import { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";

export const P0_STAGING_SMOKES_DEDICATED_WORKFLOW_PATH =
  ".github/workflows/p0-staging-smokes.yml" as const;

export const P0_STAGING_SMOKES_CI_POLICY_ID = "era17-p0-staging-smokes-optional-v1" as const;

export const P0_STAGING_SMOKES_SECRETS_POLICY_ID =
  "era17-p0-staging-smokes-secrets-accept-v1" as const;

export type P0StagingSmokesCiStatus = "PASSED" | "FAILED" | "SKIPPED";

export const P0_STAGING_SMOKES_REQUIRED_SECRETS = P0_OPS_VAULT_ENV_KEYS;

/** Always executed in `p0-staging-smokes` regardless of vault secrets. */
export const P0_STAGING_SMOKES_ALWAYS_ON_SCRIPTS = [
  "test:ci:p0-staging-proof-unblock-era17",
] as const;

export const P0_STAGING_SMOKES_ORCHESTRATOR_SCRIPT =
  P0_STAGING_PROOF_UNBLOCK_ERA17_NPM_SCRIPT;

export type P0StagingSmokesCiSummary = {
  policyId: typeof P0_STAGING_SMOKES_CI_POLICY_ID;
  status: P0StagingSmokesCiStatus;
  reason: string;
  vaultSecretsPresent: boolean;
  missingSecrets: readonly string[];
  smokeStepOutcome: string | null;
  recordedAt: string;
  alwaysOnCertification: readonly string[];
  opsChecklistDoc: typeof P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC;
  extendsPolicyId: typeof P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID;
};

export type ResolveP0StagingSmokesCiInput = {
  env?: NodeJS.ProcessEnv;
  smokeStepOutcome?: string | null;
};

export function vaultSecretsPresentForP0StagingSmokes(
  env: NodeJS.ProcessEnv = process.env,
): { present: boolean; missing: string[] } {
  const result = evaluateP0VaultEnv(env);
  return { present: result.allPresent, missing: result.missing };
}

export function resolveP0StagingSmokesCiStatus(
  input: ResolveP0StagingSmokesCiInput,
): Pick<
  P0StagingSmokesCiSummary,
  "status" | "reason" | "vaultSecretsPresent" | "missingSecrets" | "smokeStepOutcome"
> {
  const env = input.env ?? process.env;
  const { present: vaultSecretsPresent, missing } = vaultSecretsPresentForP0StagingSmokes(env);
  const smokeStepOutcome = input.smokeStepOutcome?.trim() || null;

  if (!vaultSecretsPresent) {
    return {
      status: "SKIPPED",
      reason: `Missing ${missing.length} of 11 P0 vault secrets (${missing.join(", ")}). Policy unit gate still ran.`,
      vaultSecretsPresent: false,
      missingSecrets: missing,
      smokeStepOutcome,
    };
  }

  if (smokeStepOutcome === "success") {
    return {
      status: "PASSED",
      reason: "P0 staging proof unblock smokes completed successfully.",
      vaultSecretsPresent: true,
      missingSecrets: [],
      smokeStepOutcome,
    };
  }

  if (smokeStepOutcome === "skipped" || smokeStepOutcome === null) {
    return {
      status: "SKIPPED",
      reason:
        "All 11 P0 vault secrets are configured but the staging smoke step did not run (workflow outcome skipped or unset). Policy unit gate still applies.",
      vaultSecretsPresent: true,
      missingSecrets: [],
      smokeStepOutcome,
    };
  }

  return {
    status: "FAILED",
    reason: `P0 staging smoke step outcome: ${smokeStepOutcome}.`,
    vaultSecretsPresent: true,
    missingSecrets: [],
    smokeStepOutcome,
  };
}

export function buildP0StagingSmokesCiSummary(
  input: ResolveP0StagingSmokesCiInput,
  recordedAt: string = new Date().toISOString(),
): P0StagingSmokesCiSummary {
  const resolved = resolveP0StagingSmokesCiStatus(input);
  return {
    policyId: P0_STAGING_SMOKES_CI_POLICY_ID,
    ...resolved,
    recordedAt,
    alwaysOnCertification: P0_STAGING_SMOKES_ALWAYS_ON_SCRIPTS,
    opsChecklistDoc: P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC,
    extendsPolicyId: P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  };
}

export function exitCodeForP0StagingSmokesCiStatus(status: P0StagingSmokesCiStatus): number {
  return status === "FAILED" ? 1 : 0;
}

export const P0_STAGING_SMOKES_ACCEPT_FORK_SKIP_WITHOUT_SECRETS = true as const;

export const P0_STAGING_SMOKES_CANONICAL_DOC_PATHS = ["docs/ci-e2e-tier-matrix.md"] as const;
