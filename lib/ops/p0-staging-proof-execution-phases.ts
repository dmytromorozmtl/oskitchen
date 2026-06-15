/**
 * P0 staging proof execution phases — Step 2 ordered gate sequence.
 * Policy: era30-p0-staging-proof-execution-v1
 */

export const P0_STAGING_PROOF_EXECUTION_PHASES_POLICY_ID =
  "era30-p0-staging-proof-execution-phases-v1" as const;

export type P0StagingProofExecutionPhaseId =
  | "vault_gate"
  | "staging_health"
  | "staging_workflows"
  | "channel_live"
  | "sso_idp"
  | "p0_aggregate"
  | "integrity_validate";

export type P0StagingProofExecutionPhaseDef = {
  id: P0StagingProofExecutionPhaseId;
  label: string;
  smokeScript: string | null;
  artifactPath: string | null;
  docPath: string;
  owner: string;
};

export const P0_STAGING_PROOF_EXECUTION_PHASES: readonly P0StagingProofExecutionPhaseDef[] = [
  {
    id: "vault_gate",
    label: "Step 2.0 — Vault gate (11 secrets)",
    smokeScript: null,
    artifactPath: "artifacts/vault-readiness-report.json",
    docPath: "docs/ops-vault-matrix.md",
    owner: "VP Operations",
  },
  {
    id: "staging_health",
    label: "Step 2.1a — Staging /api/health",
    smokeScript: null,
    artifactPath: null,
    docPath: "docs/GITHUB_E2E_STAGING_SECRETS.md",
    owner: "DevOps",
  },
  {
    id: "staging_workflows",
    label: "Step 2.1b — GitHub staging workflows first green",
    smokeScript: "smoke:staging-workflows-first-green",
    artifactPath: "artifacts/staging-workflows-first-green-summary.json",
    docPath: "docs/GITHUB_E2E_STAGING_SECRETS.md",
    owner: "DevOps",
  },
  {
    id: "channel_live",
    label: "Step 2.2 — Woo/Shopify live channel smoke",
    smokeScript: "smoke:woo-shopify-live",
    artifactPath: "artifacts/channel-live-smoke-summary.json",
    docPath: "docs/commercial-pilot-runbook.md",
    owner: "Integration engineer",
  },
  {
    id: "sso_idp",
    label: "Step 2.3 — SSO IdP staging login",
    smokeScript: "smoke:enterprise-sso-idp-staging",
    artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
    docPath: "docs/enterprise-sso-idp-staging-smoke-plan.md",
    owner: "Security / CTO",
  },
  {
    id: "p0_aggregate",
    label: "Step 2.4 — P0 orchestrator aggregation",
    smokeScript: "smoke:p0-staging-proof-unblock",
    artifactPath: "artifacts/p0-staging-proof-unblock-summary.json",
    docPath: "docs/era18-p0-staging-proof-ops-checklist.md",
    owner: "DevOps",
  },
  {
    id: "integrity_validate",
    label: "Step 2.5 — P0 integrity validation",
    smokeScript: null,
    artifactPath: "artifacts/p0-staging-proof-unblock-summary.json",
    docPath: "docs/next-step-2-p0-staging-proof-execution-2026-05-29.md",
    owner: "Engineering",
  },
] as const;

export type P0StagingProofExecutionPhaseStatus = {
  id: P0StagingProofExecutionPhaseId;
  label: string;
  complete: boolean;
  blocked: boolean;
  proofStatus: string | null;
  detail: string;
  smokeScript: string | null;
  artifactPath: string | null;
  docPath: string;
  owner: string;
};

export function resolveNextIncompleteP0StagingProofExecutionPhase(
  phases: readonly P0StagingProofExecutionPhaseStatus[],
): P0StagingProofExecutionPhaseStatus | null {
  return phases.find((phase) => !phase.complete) ?? null;
}
