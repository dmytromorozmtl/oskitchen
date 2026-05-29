/**
 * Commercial inflection readiness UI slice — Today, Integration Health, Owner Briefing.
 */
import {
  COMMERCIAL_INFLECTION_BLOCKED_MILESTONES,
  COMMERCIAL_INFLECTION_EXECUTION_STEP_DOC,
  COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC,
  COMMERCIAL_INFLECTION_READINESS_PLATFORM_ANCHOR,
  evaluateCommercialInflectionReadiness,
  type CommercialInflectionMilestone,
  type CommercialInflectionReadinessSummary,
} from "@/lib/commercial/commercial-inflection-readiness-era28";
import { buildP0OpsVaultUiSlice } from "@/lib/commercial/p0-ops-vault-ui-era21";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { VaultReadinessReport } from "@/lib/ops/vault-readiness-report";

export const COMMERCIAL_INFLECTION_READINESS_UI_ERA28_POLICY_ID =
  "commercial-inflection-readiness-ui-v1" as const;

export const COMMERCIAL_INFLECTION_INTEGRATION_HEALTH_ANCHOR =
  "#integration-health-commercial-inflection" as const;

export const COMMERCIAL_INFLECTION_PLATFORM_OPS_ROUTE = "/platform/commercial-pilot-ops" as const;

export type CommercialInflectionReadinessUiSlice = {
  policyId: typeof COMMERCIAL_INFLECTION_READINESS_UI_ERA28_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  milestone: CommercialInflectionMilestone;
  pilotExecutableScore: number;
  governanceScore: number;
  p0ProofStatus: string;
  goDecision: string | null;
  tier2ProofStatus: string | null;
  integrationRegistryLiveCount: number;
  channelRegistryLiveCount: number;
  p0VaultMissingCount: number;
  blockedP0Count: number;
  blockedP1Count: number;
  stopRuleCount: number;
  topBlockerTitle: string;
  topBlockerDetail: string;
  matrixDoc: typeof COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC;
  executionDoc: typeof COMMERCIAL_INFLECTION_EXECUTION_STEP_DOC;
  validateCommand: string;
  orchestratorCommand: string;
  syncReportCommand: string;
  platformOpsHref: string;
  integrationHealthHref: string;
  p0PlaybookDoc: string;
};

export type CommercialInflectionReadinessUiContext = {
  vaultReport?: VaultReadinessReport | null;
  p0Staging?: P0StagingProofUnblockSummary | null;
};

export function formatCommercialInflectionMilestoneLabel(
  milestone: CommercialInflectionMilestone,
): string {
  return milestone.replaceAll("_", " ");
}

export function formatCommercialInflectionScorecardLabel(slice: CommercialInflectionReadinessUiSlice): string {
  return `Pilot ${slice.pilotExecutableScore}/100 · Governance ${slice.governanceScore}/100 · ${formatCommercialInflectionMilestoneLabel(slice.milestone)}`;
}

export function resolveCommercialInflectionTopBlocker(
  summary: CommercialInflectionReadinessSummary,
): { title: string; detail: string } {
  const urgent = summary.blockers.find(
    (row) =>
      (row.priority === "P0" || row.priority === "STOP") &&
      (row.status === "blocked" || row.status === "human_required"),
  );
  if (urgent) {
    return { title: urgent.title, detail: urgent.detail };
  }
  const p1 = summary.blockers.find((row) => row.priority === "P1" && row.status === "blocked");
  if (p1) {
    return { title: p1.title, detail: p1.detail };
  }
  return {
    title: "Commercial inflection gates",
    detail: "Review blocker matrix — governance score is orchestration only, not market ready.",
  };
}

export function buildCommercialInflectionReadinessUiSlice(
  summary: CommercialInflectionReadinessSummary = evaluateCommercialInflectionReadiness(),
  context?: CommercialInflectionReadinessUiContext,
): CommercialInflectionReadinessUiSlice | null {
  const blocked = COMMERCIAL_INFLECTION_BLOCKED_MILESTONES.includes(summary.milestone);
  if (!blocked) return null;

  const opsVault = buildP0OpsVaultUiSlice(
    context?.p0Staging ?? null,
    context?.vaultReport ?? null,
  );
  const top = resolveCommercialInflectionTopBlocker(summary);
  const platformOpsHref =
    summary.milestone === "p0_ops_vault_blocked" && opsVault?.platformOpsHref
      ? opsVault.platformOpsHref
      : `${COMMERCIAL_INFLECTION_PLATFORM_OPS_ROUTE}${COMMERCIAL_INFLECTION_READINESS_PLATFORM_ANCHOR}`;

  return {
    policyId: COMMERCIAL_INFLECTION_READINESS_UI_ERA28_POLICY_ID,
    visible: true,
    blocked,
    milestone: summary.milestone,
    pilotExecutableScore: summary.pilotExecutableScore,
    governanceScore: summary.governanceScore,
    p0ProofStatus: summary.p0ProofStatus,
    goDecision: summary.goDecision,
    tier2ProofStatus: summary.tier2ProofStatus,
    integrationRegistryLiveCount: summary.integrationRegistryLiveCount,
    channelRegistryLiveCount: summary.channelRegistryLiveCount,
    p0VaultMissingCount: summary.p0VaultMissingCount,
    blockedP0Count: summary.blockedP0Count,
    blockedP1Count: summary.blockedP1Count,
    stopRuleCount: summary.stopRuleCount,
    topBlockerTitle: top.title,
    topBlockerDetail: top.detail,
    matrixDoc: COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC,
    executionDoc: COMMERCIAL_INFLECTION_EXECUTION_STEP_DOC,
    validateCommand: "npm run ops:validate-commercial-inflection-readiness -- --json",
    orchestratorCommand: "npm run ops:run-commercial-inflection-readiness-orchestrator -- --write",
    syncReportCommand: "npm run ops:sync-commercial-inflection-readiness-report -- --write",
    platformOpsHref,
    integrationHealthHref: `/dashboard/integration-health${COMMERCIAL_INFLECTION_INTEGRATION_HEALTH_ANCHOR}`,
    p0PlaybookDoc: "docs/p0-ops-vault-execution-playbook-2026-05-28.md",
  };
}
