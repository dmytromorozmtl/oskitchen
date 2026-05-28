/**
 * P0 ops vault UI slice — shared across Integration Health, Owner Briefing, Platform ops.
 */
import { P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildP0OpsVaultPhaseStatuses,
  formatP0OpsVaultPhaseBlockerDetail,
  P0_OPS_VAULT_ENV_KEYS,
  resolveNextIncompleteP0OpsVaultPhase,
  type P0OpsVaultPhaseStatus,
} from "@/lib/commercial/p0-ops-vault-phases-era21";

export const P0_OPS_VAULT_UI_ERA21_POLICY_ID = "era21-p0-ops-vault-ui-v1" as const;

export const P0_OPS_VAULT_PLAYBOOK_DOC = "docs/p0-ops-vault-execution-playbook-2026-05-28.md" as const;

export const P0_OPS_VAULT_INTEGRATION_HEALTH_ANCHOR = "#integration-health-p0-trust" as const;

export type P0OpsVaultUiSlice = {
  policyId: typeof P0_OPS_VAULT_UI_ERA21_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  p0ProofStatus: string;
  overall: string | null;
  missingEnvVars: readonly string[];
  missingCount: number;
  totalCount: number;
  phases: readonly P0OpsVaultPhaseStatus[];
  completedPhaseCount: number;
  opsChecklistDoc: typeof P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC;
  playbookDoc: typeof P0_OPS_VAULT_PLAYBOOK_DOC;
  validateCommand: string;
  exportTemplateCommand: string;
  orchestratorCommand: string;
  githubSecretsChecklistCommand: string;
  syncProgressReportCommand: string;
  integrationHealthHref: string;
  launchWizardHref: string;
  nextPhase: P0OpsVaultPhaseStatus | null;
  nextPhaseDetail: string | null;
};

export function buildP0OpsVaultUiSlice(
  p0Staging: P0StagingProofUnblockSummary | null | undefined,
): P0OpsVaultUiSlice | null {
  if (!p0Staging) return null;

  const blocked = p0Staging.p0ProofStatus !== "proof_passed";
  if (!blocked) return null;

  const missingEnvVars = p0Staging.allMissingEnvVars;
  const phases = buildP0OpsVaultPhaseStatuses({ missingEnvVars });
  const completedPhaseCount = phases.filter((p) => p.complete).length;
  const nextPhase = resolveNextIncompleteP0OpsVaultPhase(phases);
  const nextPhaseDetail = nextPhase ? formatP0OpsVaultPhaseBlockerDetail(nextPhase) : null;

  return {
    policyId: P0_OPS_VAULT_UI_ERA21_POLICY_ID,
    visible: true,
    blocked,
    p0ProofStatus: p0Staging.p0ProofStatus,
    overall: p0Staging.overall,
    missingEnvVars,
    missingCount: missingEnvVars.length,
    totalCount: P0_OPS_VAULT_ENV_KEYS.length,
    phases,
    completedPhaseCount,
    opsChecklistDoc: P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC,
    playbookDoc: P0_OPS_VAULT_PLAYBOOK_DOC,
    validateCommand: "npm run ops:validate-p0-vault-env",
    exportTemplateCommand: "npm run ops:export-p0-vault-env-template -- --write",
    orchestratorCommand: "npm run smoke:p0-staging-proof-unblock",
    githubSecretsChecklistCommand: "npm run ops:print-p0-github-secrets-checklist",
    syncProgressReportCommand: "npm run ops:sync-p0-vault-progress-report -- --write",
    integrationHealthHref: `/dashboard/integration-health${P0_OPS_VAULT_INTEGRATION_HEALTH_ANCHOR}`,
    launchWizardHref: "/dashboard/launch-wizard",
    nextPhase,
    nextPhaseDetail,
  };
}

export function formatP0OpsVaultProgressLabel(slice: P0OpsVaultUiSlice): string {
  return `Ops vault ${slice.completedPhaseCount}/${slice.phases.length} phases · ${slice.missingCount}/${slice.totalCount} vars missing`;
}
