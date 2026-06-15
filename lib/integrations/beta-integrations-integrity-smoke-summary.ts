/**
 * Unified BETA integrations integrity smoke summary — registry + env bundle.
 */

import {
  auditBetaIntegrationsRegistryScaffold,
  buildBetaIntegrationsRegistrySmokeSummary,
  type BetaIntegrationsRegistrySmokeSummary,
} from "@/lib/integrations/beta-integrations-registry-smoke-summary";
import {
  auditBetaIntegrationEnvReadiness,
  buildBetaIntegrationEnvReadinessSmokeSummary,
  type BetaIntegrationEnvReadinessSmokeSummary,
} from "@/lib/integrations/beta-integration-env-readiness-smoke-summary";
import { BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_POLICY_ID } from "@/lib/integrations/beta-integrations-integrity-smoke-era17-policy";

export const BETA_INTEGRATIONS_INTEGRITY_SMOKE_SUMMARY_VERSION =
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_POLICY_ID;

export type BetaIntegrationsIntegritySmokeOverall = "PASSED" | "FAILED";

export type BetaIntegrationsIntegritySmokeProofStatus =
  | "integrity_complete"
  | "registry_failed"
  | "env_failed"
  | "cert_failed";

export type BetaIntegrationsIntegritySmokeSummary = {
  version: typeof BETA_INTEGRATIONS_INTEGRITY_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: BetaIntegrationsIntegritySmokeOverall;
  proofStatus: BetaIntegrationsIntegritySmokeProofStatus;
  registryCertPassed: boolean;
  envCertPassed: boolean;
  strictEnvMode: boolean;
  registry: BetaIntegrationsRegistrySmokeSummary;
  env: BetaIntegrationEnvReadinessSmokeSummary;
};

export function resolveBetaIntegrationsIntegrityProofStatus(input: {
  registryCertPassed: boolean;
  envCertPassed: boolean;
  registryOverall: BetaIntegrationsRegistrySmokeSummary["overall"];
  envOverall: BetaIntegrationEnvReadinessSmokeSummary["overall"];
}): BetaIntegrationsIntegritySmokeProofStatus {
  if (!input.registryCertPassed || !input.envCertPassed) return "cert_failed";
  if (input.registryOverall === "FAILED") return "registry_failed";
  if (input.envOverall === "FAILED") return "env_failed";
  return "integrity_complete";
}

export function resolveBetaIntegrationsIntegrityOverall(
  proofStatus: BetaIntegrationsIntegritySmokeProofStatus,
): BetaIntegrationsIntegritySmokeOverall {
  return proofStatus === "integrity_complete" ? "PASSED" : "FAILED";
}

export function buildBetaIntegrationsIntegritySmokeSummary(input: {
  registryCertPassed: boolean;
  envCertPassed: boolean;
  strictEnvMode?: boolean;
  commitSha?: string | null;
  runAt?: Date;
  env?: NodeJS.ProcessEnv;
}): BetaIntegrationsIntegritySmokeSummary {
  const runAt = input.runAt ?? new Date();
  const env = input.env ?? process.env;
  const strictEnvMode = input.strictEnvMode ?? false;

  const registryAudit = auditBetaIntegrationsRegistryScaffold(process.cwd());
  const registry = buildBetaIntegrationsRegistrySmokeSummary({
    certPassed: input.registryCertPassed,
    scaffoldFailures: registryAudit.scaffoldFailures,
    registryBetaCount: registryAudit.registryBetaCount,
    placeholderCount: registryAudit.placeholderCount,
    commitSha: input.commitSha,
    runAt,
  });

  const envCards = auditBetaIntegrationEnvReadiness(env);
  const envSummary = buildBetaIntegrationEnvReadinessSmokeSummary({
    certPassed: input.envCertPassed,
    cards: envCards,
    strictMode: strictEnvMode,
    commitSha: input.commitSha,
    runAt,
  });

  const proofStatus = resolveBetaIntegrationsIntegrityProofStatus({
    registryCertPassed: input.registryCertPassed,
    envCertPassed: input.envCertPassed,
    registryOverall: registry.overall,
    envOverall: envSummary.overall,
  });

  return {
    version: BETA_INTEGRATIONS_INTEGRITY_SMOKE_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall: resolveBetaIntegrationsIntegrityOverall(proofStatus),
    proofStatus,
    registryCertPassed: input.registryCertPassed,
    envCertPassed: input.envCertPassed,
    strictEnvMode,
    registry,
    env: envSummary,
  };
}

export function formatBetaIntegrationsIntegritySmokeReportLines(
  summary: BetaIntegrationsIntegritySmokeSummary,
): string[] {
  return [
    `overall: ${summary.overall}`,
    `proofStatus: ${summary.proofStatus}`,
    `registryProofStatus: ${summary.registry.proofStatus}`,
    `envProofStatus: ${summary.env.proofStatus}`,
    `registryBetaCount: ${summary.registry.registryBetaCount}/${summary.registry.expectedBetaCount}`,
    `envReady: ${summary.env.envSummary.readyCount}/${summary.env.envSummary.total}`,
    `envMissing: ${summary.env.envSummary.missingCount}`,
    `scaffoldFailures: ${summary.registry.scaffoldFailures.length}`,
  ];
}
