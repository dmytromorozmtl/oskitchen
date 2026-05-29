/**
 * P0 staging proof execution orchestrator — Step 2 honest milestone + phase truth.
 * Policy: era30-p0-staging-proof-execution-v1
 */
import { evaluateP0StagingProofIntegrity } from "@/lib/commercial/p0-staging-proof-integrity-era28";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  checkP0StagingHealth,
  type P0StagingHealthResult,
} from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import type { VaultReadinessReport } from "@/lib/ops/vault-readiness-report";
import {
  P0_STAGING_PROOF_EXECUTION_PHASES,
  resolveNextIncompleteP0StagingProofExecutionPhase,
  type P0StagingProofExecutionPhaseStatus,
} from "@/lib/ops/p0-staging-proof-execution-phases";
import { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";

export const P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID =
  "era30-p0-staging-proof-execution-v1" as const;

export const P0_STAGING_PROOF_EXECUTION_DOC =
  "docs/next-step-2-p0-staging-proof-execution-2026-05-29.md" as const;

export const P0_STAGING_PROOF_EXECUTION_STEP3_DOC =
  "docs/next-step-3-tier2-staging-proof-band-2026-05-29.md" as const;

export const P0_STAGING_PROOF_EXECUTION_SUMMARY_ARTIFACT =
  "artifacts/p0-staging-proof-execution-summary.json" as const;

export const P0_STAGING_PROOF_EXECUTION_HTML_ARTIFACT =
  "artifacts/p0-staging-proof-execution-report.html" as const;

export const P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND =
  "npm run ops:run-p0-staging-proof-execution" as const;

export type P0StagingProofExecutionMilestone =
  | "vault_blocked"
  | "awaiting_staging_health"
  | "awaiting_staging_workflows"
  | "awaiting_channel_live"
  | "awaiting_sso_idp"
  | "awaiting_p0_aggregate"
  | "awaiting_integrity_pass"
  | "proof_passed";

type ChildArtifacts = {
  workflows: {
    overall?: string;
    firstGreenProofStatus?: string;
  } | null;
  channel: {
    overall?: string;
    wooLiveProofStatus?: string;
    shopifyLiveProofStatus?: string;
  } | null;
  sso: {
    overall?: string;
    loginProofStatus?: string;
  } | null;
  p0: P0StagingProofUnblockSummary | null;
};

function isProofPassed(status: string | null | undefined): boolean {
  return status === "proof_passed" || status?.includes("proof_passed") === true;
}

function channelProofPassed(artifact: ChildArtifacts["channel"]): boolean {
  if (!artifact) return false;
  return (
    isProofPassed(artifact.wooLiveProofStatus) ||
    isProofPassed(artifact.shopifyLiveProofStatus) ||
    artifact.wooLiveProofStatus === "proof_passed/proof_passed"
  );
}

export function buildP0StagingProofExecutionPhaseStatuses(input: {
  vaultReady: boolean;
  stagingHealth: P0StagingHealthResult;
  childArtifacts: ChildArtifacts;
  integrityPassed: boolean;
}): P0StagingProofExecutionPhaseStatus[] {
  const workflowsPassed = isProofPassed(input.childArtifacts.workflows?.firstGreenProofStatus);
  const channelPassed = channelProofPassed(input.childArtifacts.channel);
  const ssoPassed = isProofPassed(input.childArtifacts.sso?.loginProofStatus);
  const p0Passed = input.childArtifacts.p0?.p0ProofStatus === "proof_passed";

  return P0_STAGING_PROOF_EXECUTION_PHASES.map((phase) => {
    switch (phase.id) {
      case "vault_gate":
        return {
          ...phase,
          complete: input.vaultReady,
          blocked: !input.vaultReady,
          proofStatus: input.vaultReady ? "proof_passed" : "awaiting_ops_credentials",
          detail: input.vaultReady
            ? "All 11 ops vault secrets present in shell."
            : "Configure 11 secrets — see docs/ops-vault-matrix.md",
        };
      case "staging_health":
        return {
          ...phase,
          complete: input.stagingHealth.checked && input.stagingHealth.ok,
          blocked: !input.vaultReady,
          proofStatus:
            input.stagingHealth.checked && input.stagingHealth.ok
              ? "proof_passed"
              : input.stagingHealth.checked
                ? "proof_failed"
                : "proof_skipped_missing_prerequisites",
          detail: input.stagingHealth.checked
            ? input.stagingHealth.ok
              ? `Health PASS — ${input.stagingHealth.url}`
              : `Health FAIL — ${input.stagingHealth.error ?? "unknown"}`
            : "Set E2E_STAGING_BASE_URL and run ops:check-p0-staging-health",
        };
      case "staging_workflows":
        return {
          ...phase,
          complete: workflowsPassed,
          blocked: !input.vaultReady,
          proofStatus: input.childArtifacts.workflows?.firstGreenProofStatus ?? null,
          detail: workflowsPassed
            ? "GitHub staging workflows first green PASS."
            : "Run smoke:staging-workflows-first-green after staging health PASS.",
        };
      case "channel_live":
        return {
          ...phase,
          complete: channelPassed,
          blocked: !input.vaultReady,
          proofStatus:
            input.childArtifacts.channel?.wooLiveProofStatus &&
            input.childArtifacts.channel?.shopifyLiveProofStatus
              ? `${input.childArtifacts.channel.wooLiveProofStatus}/${input.childArtifacts.channel.shopifyLiveProofStatus}`
              : input.childArtifacts.channel?.wooLiveProofStatus ??
                input.childArtifacts.channel?.shopifyLiveProofStatus ??
                null,
          detail: channelPassed
            ? "Woo or Shopify live smoke PASS — canonical order in staging DB."
            : "Run smoke:woo-shopify-live with DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
        };
      case "sso_idp":
        return {
          ...phase,
          complete: ssoPassed,
          blocked: !input.vaultReady,
          proofStatus: input.childArtifacts.sso?.loginProofStatus ?? null,
          detail: ssoPassed
            ? "SSO IdP staging login PASS."
            : "Run smoke:enterprise-sso-idp-staging with SSO_STAGING_* vars.",
        };
      case "p0_aggregate":
        return {
          ...phase,
          complete: p0Passed,
          blocked: !input.vaultReady,
          proofStatus: input.childArtifacts.p0?.p0ProofStatus ?? null,
          detail: p0Passed
            ? "P0 orchestrator proof_passed — all child smokes aggregated."
            : "Run smoke:p0-staging-proof-unblock after child smokes PASS.",
        };
      case "integrity_validate":
        return {
          ...phase,
          complete: p0Passed && input.integrityPassed,
          blocked: !p0Passed,
          proofStatus: input.integrityPassed ? "integrity_passed" : "integrity_failed",
          detail:
            p0Passed && input.integrityPassed
              ? "P0 artifact integrity PASS — no fake PASS detected."
              : "Run ops:validate-p0-staging-proof-integrity after P0 PASS.",
        };
      default:
        return {
          ...phase,
          complete: false,
          blocked: true,
          proofStatus: null,
          detail: "Unknown phase",
        };
    }
  });
}

export function resolveP0StagingProofExecutionMilestone(
  phases: readonly P0StagingProofExecutionPhaseStatus[],
): P0StagingProofExecutionMilestone {
  const byId = new Map(phases.map((phase) => [phase.id, phase]));

  if (!byId.get("vault_gate")?.complete) return "vault_blocked";
  if (!byId.get("staging_health")?.complete) return "awaiting_staging_health";
  if (!byId.get("staging_workflows")?.complete) return "awaiting_staging_workflows";
  if (!byId.get("channel_live")?.complete) return "awaiting_channel_live";
  if (!byId.get("sso_idp")?.complete) return "awaiting_sso_idp";
  if (!byId.get("p0_aggregate")?.complete) return "awaiting_p0_aggregate";
  if (!byId.get("integrity_validate")?.complete) return "awaiting_integrity_pass";
  return "proof_passed";
}

export type P0StagingProofExecutionSummary = {
  version: "p0-staging-proof-execution-v1";
  policyId: typeof P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID;
  generatedAt: string;
  milestone: P0StagingProofExecutionMilestone;
  vaultReady: boolean;
  p0ProofStatus: string | null;
  p0Overall: string | null;
  integrityPassed: boolean;
  stagingHealth: P0StagingHealthResult;
  phases: readonly P0StagingProofExecutionPhaseStatus[];
  nextPhase: P0StagingProofExecutionPhaseStatus | null;
  recommendedCommands: readonly string[];
  honestyNote: string;
};

export function buildP0StagingProofExecutionSummary(input: {
  env?: NodeJS.ProcessEnv;
  vaultReport?: VaultReadinessReport | null;
  childArtifacts: ChildArtifacts;
  stagingHealth: P0StagingHealthResult;
  integrityPassed: boolean;
  generatedAt?: Date;
}): P0StagingProofExecutionSummary {
  const vault = evaluateP0VaultEnv(input.env);
  const vaultReady = input.vaultReport?.vaultReady ?? vault.allPresent;
  const phases = buildP0StagingProofExecutionPhaseStatuses({
    vaultReady,
    stagingHealth: input.stagingHealth,
    childArtifacts: input.childArtifacts,
    integrityPassed: input.integrityPassed,
  });
  const milestone = resolveP0StagingProofExecutionMilestone(phases);
  const nextPhase = resolveNextIncompleteP0StagingProofExecutionPhase(phases);

  const recommendedCommands: string[] = [];
  if (!vaultReady) {
    recommendedCommands.push("npm run check-vault-readiness -- --write");
    recommendedCommands.push("npm run ops:run-p0-vault-day0-orchestrator -- --write");
  } else if (nextPhase?.smokeScript) {
    recommendedCommands.push(`npm run ${nextPhase.smokeScript}`);
  } else if (nextPhase?.id === "staging_health") {
    recommendedCommands.push("npm run ops:check-p0-staging-health");
  } else if (nextPhase?.id === "integrity_validate") {
    recommendedCommands.push("npm run ops:validate-p0-staging-proof-integrity -- --json");
    recommendedCommands.push("npm run check-vault-readiness -- --write");
  }

  if (milestone === "proof_passed") {
    recommendedCommands.push("npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write");
    recommendedCommands.push("npm run smoke:pilot-gono-go");
  } else if (vaultReady) {
    recommendedCommands.push(P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_COMMAND + " -- --execute");
  }

  return {
    version: "p0-staging-proof-execution-v1",
    policyId: P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    milestone,
    vaultReady,
    p0ProofStatus: input.childArtifacts.p0?.p0ProofStatus ?? null,
    p0Overall: input.childArtifacts.p0?.overall ?? null,
    integrityPassed: input.integrityPassed,
    stagingHealth: input.stagingHealth,
    phases,
    nextPhase,
    recommendedCommands,
    honestyNote:
      "PASS > SKIPPED — Step 2 never fabricates proof_passed. Use --execute only when vault is ready.",
  };
}

export function formatP0StagingProofExecutionLines(
  summary: P0StagingProofExecutionSummary,
): string[] {
  return [
    `P0 staging proof execution: ${summary.milestone}`,
    `Vault ready: ${summary.vaultReady ? "yes" : "no"}`,
    `P0 artifact: ${summary.p0ProofStatus ?? "missing"} (${summary.p0Overall ?? "n/a"})`,
    `Integrity: ${summary.integrityPassed ? "PASS" : "FAIL"}`,
    summary.nextPhase
      ? `Next: ${summary.nextPhase.label} — ${summary.nextPhase.detail}`
      : "All phases complete",
  ];
}

export { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT };
