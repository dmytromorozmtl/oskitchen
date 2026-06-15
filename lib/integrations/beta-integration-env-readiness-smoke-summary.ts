/**
 * BETA integration env readiness smoke summary — Era 17 G2 audit artifact.
 */

import {
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_EXPECTED_COUNT,
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_POLICY_ID,
} from "@/lib/integrations/beta-integration-env-readiness-smoke-era17-policy";
import {
  listBetaIntegrationEnvReadinessCards,
  summarizeBetaIntegrationEnvReadiness,
  type BetaIntegrationEnvReadinessCard,
  type BetaIntegrationEnvReadinessSummary,
} from "@/lib/integrations/beta-integration-env-readiness";

export const BETA_INTEGRATION_ENV_READINESS_SMOKE_SUMMARY_VERSION =
  BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_POLICY_ID;

export type BetaIntegrationEnvReadinessSmokeOverall = "PASSED" | "FAILED";

export type BetaIntegrationEnvReadinessSmokeProofStatus =
  | "env_audit_complete"
  | "proof_failed_cert"
  | "proof_failed_strict_env";

export type BetaIntegrationEnvReadinessSmokeSummary = {
  version: typeof BETA_INTEGRATION_ENV_READINESS_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: BetaIntegrationEnvReadinessSmokeOverall;
  proofStatus: BetaIntegrationEnvReadinessSmokeProofStatus;
  certPassed: boolean;
  strictMode: boolean;
  envSummary: BetaIntegrationEnvReadinessSummary;
  missingIntegrations: Array<{ id: string; missingEnv: readonly string[] }>;
};

export function resolveBetaIntegrationEnvReadinessSmokeProofStatus(input: {
  certPassed: boolean;
  strictMode: boolean;
  envSummary: BetaIntegrationEnvReadinessSummary;
  cardCount: number;
}): BetaIntegrationEnvReadinessSmokeProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (input.cardCount !== BETA_INTEGRATION_ENV_READINESS_SMOKE_ERA17_EXPECTED_COUNT) {
    return "proof_failed_cert";
  }
  if (input.strictMode && input.envSummary.readyCount + input.envSummary.optionalCount === 0) {
    return "proof_failed_strict_env";
  }
  return "env_audit_complete";
}

export function resolveBetaIntegrationEnvReadinessSmokeOverall(
  proofStatus: BetaIntegrationEnvReadinessSmokeProofStatus,
): BetaIntegrationEnvReadinessSmokeOverall {
  return proofStatus === "env_audit_complete" ? "PASSED" : "FAILED";
}

export function buildBetaIntegrationEnvReadinessSmokeSummary(input: {
  certPassed: boolean;
  cards: readonly BetaIntegrationEnvReadinessCard[];
  strictMode?: boolean;
  commitSha?: string | null;
  runAt?: Date;
}): BetaIntegrationEnvReadinessSmokeSummary {
  const envSummary = summarizeBetaIntegrationEnvReadiness(input.cards);
  const strictMode = input.strictMode ?? false;
  const proofStatus = resolveBetaIntegrationEnvReadinessSmokeProofStatus({
    certPassed: input.certPassed,
    strictMode,
    envSummary,
    cardCount: input.cards.length,
  });

  const missingIntegrations = input.cards
    .filter((card) => card.status === "missing")
    .map((card) => ({ id: card.id, missingEnv: card.missingEnv }));

  return {
    version: BETA_INTEGRATION_ENV_READINESS_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall: resolveBetaIntegrationEnvReadinessSmokeOverall(proofStatus),
    proofStatus,
    certPassed: input.certPassed,
    strictMode,
    envSummary,
    missingIntegrations,
  };
}

export function auditBetaIntegrationEnvReadiness(
  env: NodeJS.ProcessEnv = process.env,
): BetaIntegrationEnvReadinessCard[] {
  return listBetaIntegrationEnvReadinessCards(env);
}

export function formatBetaIntegrationEnvReadinessSmokeReportLines(
  summary: BetaIntegrationEnvReadinessSmokeSummary,
): string[] {
  return [
    `overall: ${summary.overall}`,
    `proofStatus: ${summary.proofStatus}`,
    `certPassed: ${summary.certPassed}`,
    `strictMode: ${summary.strictMode}`,
    `envReady: ${summary.envSummary.readyCount}/${summary.envSummary.total}`,
    `envOptional: ${summary.envSummary.optionalCount}`,
    `envMissing: ${summary.envSummary.missingCount}`,
    `missingIntegrations: ${summary.missingIntegrations.length}`,
  ];
}
