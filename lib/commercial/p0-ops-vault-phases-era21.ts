/**
 * P0 ops vault phases — shared between CLI validation and product UI.
 * Policy: era17-p0-staging-proof-unblock-v1
 */
import { P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

export const P0_OPS_VAULT_PHASES_ERA21_POLICY_ID = "era21-p0-ops-vault-phases-v1" as const;

export type P0OpsVaultPhaseDef = {
  id: string;
  label: string;
  keys: readonly string[];
  docPath: string;
  smokeScripts: readonly string[];
};

export const P0_OPS_VAULT_PHASES: readonly P0OpsVaultPhaseDef[] = [
  {
    id: "staging_login",
    label: "Phase 1 — Staging login",
    keys: ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL", "E2E_LOGIN_PASSWORD"],
    docPath: "docs/GITHUB_E2E_STAGING_SECRETS.md",
    smokeScripts: ["smoke:staging-workflows-first-green"],
  },
  {
    id: "database_encryption",
    label: "Phase 2 — Database + encryption",
    keys: ["DATABASE_URL", "ENCRYPTION_KEY"],
    docPath: "docs/commercial-pilot-runbook.md",
    smokeScripts: ["smoke:woo-shopify-live"],
  },
  {
    id: "channel_live",
    label: "Phase 3 — Channel tenant",
    keys: ["CHANNEL_SMOKE_OWNER_EMAIL"],
    docPath: "docs/commercial-pilot-runbook.md",
    smokeScripts: ["smoke:woo-shopify-live"],
  },
  {
    id: "sso_idp",
    label: "Phase 4 — SSO IdP",
    keys: [
      "SSO_STAGING_WORKSPACE_ID",
      "SSO_STAGING_IDP_VENDOR",
      "SSO_STAGING_ALLOWED_DOMAIN",
      "SSO_STAGING_TEST_EMAIL",
      "SSO_STAGING_SUPABASE_PROVIDER_REF",
    ],
    docPath: "docs/enterprise-sso-idp-staging-smoke-plan.md",
    smokeScripts: ["smoke:enterprise-sso-idp-staging"],
  },
] as const;

export const P0_OPS_VAULT_ENV_KEYS = P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG.map(
  (entry) => entry.key,
);

export type P0OpsVaultPhaseStatus = {
  id: string;
  label: string;
  complete: boolean;
  presentKeys: string[];
  missingKeys: string[];
  docPath: string;
  smokeScripts: readonly string[];
};

export function buildP0OpsVaultPhaseStatuses(input: {
  missingEnvVars: readonly string[];
}): P0OpsVaultPhaseStatus[] {
  const missingSet = new Set(input.missingEnvVars);

  return P0_OPS_VAULT_PHASES.map((phase) => {
    const missingKeys = phase.keys.filter((key) => missingSet.has(key));
    const presentKeys = phase.keys.filter((key) => !missingSet.has(key));
    return {
      id: phase.id,
      label: phase.label,
      complete: missingKeys.length === 0,
      presentKeys: [...presentKeys],
      missingKeys: [...missingKeys],
      docPath: phase.docPath,
      smokeScripts: phase.smokeScripts,
    };
  });
}

export function resolveNextIncompleteP0OpsVaultPhase(
  phases: readonly P0OpsVaultPhaseStatus[],
): P0OpsVaultPhaseStatus | null {
  return phases.find((phase) => !phase.complete) ?? null;
}

export function formatP0OpsVaultPhaseBlockerDetail(phase: P0OpsVaultPhaseStatus): string {
  if (phase.missingKeys.length === 0) {
    return `${phase.label} — all vars present.`;
  }
  return `${phase.label}: missing ${phase.missingKeys.join(", ")}.`;
}
