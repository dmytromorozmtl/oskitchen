/**
 * P0 ops vault UI slice — shared across Integration Health, Owner Briefing, Platform ops.
 */
import { P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  P0_OPS_VAULT_DAY0_READINESS_EXPORT_COMMAND,
  P0_OPS_VAULT_STAGING_HEALTH_COMMAND,
  resolveP0VaultDay0MilestoneFromPhaseStatuses,
  type P0VaultDay0Milestone,
} from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
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
  day0OrchestratorCommand: string;
  stagingHealthCheckCommand: string;
  exportDay0ReadinessChecklistCommand: string;
  vaultReadinessCommand: string;
  vaultReadinessArtifact: string;
  vaultMatrixDoc: string;
  p0ExecutionCommand: string;
  p0ExecutionArtifact: string;
  day0Milestone: P0VaultDay0Milestone;
  day0PartialComplete: boolean;
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
  const day0Milestone = resolveP0VaultDay0MilestoneFromPhaseStatuses(
    phases,
    p0Staging.p0ProofStatus,
  );
  const day0PartialComplete = phases
    .filter((phase) => phase.id === "staging_login" || phase.id === "database_encryption")
    .every((phase) => phase.complete);

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
    day0OrchestratorCommand: "npm run ops:run-p0-vault-day0-orchestrator -- --write",
    stagingHealthCheckCommand: P0_OPS_VAULT_STAGING_HEALTH_COMMAND,
    exportDay0ReadinessChecklistCommand: P0_OPS_VAULT_DAY0_READINESS_EXPORT_COMMAND,
    vaultReadinessCommand: "npm run check-vault-readiness -- --write",
    vaultReadinessArtifact: "artifacts/vault-readiness-report.json",
    vaultMatrixDoc: "docs/ops-vault-matrix.md",
    p0ExecutionCommand: "npm run ops:run-p0-staging-proof-execution -- --write",
    p0ExecutionArtifact: "artifacts/p0-staging-proof-execution-summary.json",
    day0Milestone,
    day0PartialComplete,
    integrationHealthHref: `/dashboard/integration-health${P0_OPS_VAULT_INTEGRATION_HEALTH_ANCHOR}`,
    launchWizardHref: "/dashboard/launch-wizard",
    nextPhase,
    nextPhaseDetail,
  };
}

export function formatP0OpsVaultProgressLabel(slice: P0OpsVaultUiSlice): string {
  const milestoneLabel =
    slice.day0Milestone === "day0_partial"
      ? "Day 0 partial 5/11"
      : slice.day0Milestone === "phase1_complete"
        ? "Phase 1 complete 3/11"
        : slice.day0Milestone;
  return `Ops vault ${slice.completedPhaseCount}/${slice.phases.length} phases · ${slice.missingCount}/${slice.totalCount} vars missing · ${milestoneLabel}`;
}
