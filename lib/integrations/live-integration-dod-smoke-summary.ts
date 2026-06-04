/**
 * LIVE integration DoD smoke summary — integrity + gate tracker artifact.
 */

import { buildBetaIntegrationsIntegritySmokeSummary } from "@/lib/integrations/beta-integrations-integrity-smoke-summary";
import {
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID,
} from "@/lib/integrations/live-integration-dod-smoke-era17-policy";
import {
  listLiveIntegrationDodRows,
  summarizeLiveIntegrationDod,
  type LiveIntegrationDodSummary,
} from "@/lib/integrations/live-integration-dod-tracker";

export const LIVE_INTEGRATION_DOD_SMOKE_SUMMARY_VERSION =
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID;

export type LiveIntegrationDodSmokeOverall = "PASSED" | "FAILED";

export type LiveIntegrationDodSmokeProofStatus =
  | "dod_audit_complete"
  | "proof_failed_cert"
  | "proof_failed_scaffold";

export type LiveIntegrationDodSmokeSummary = {
  version: typeof LIVE_INTEGRATION_DOD_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: LiveIntegrationDodSmokeOverall;
  proofStatus: LiveIntegrationDodSmokeProofStatus;
  certPassed: boolean;
  integrityOverall: "PASSED" | "FAILED";
  integrityProofStatus: string;
  dod: LiveIntegrationDodSummary;
  g1g2ReadyCount: number;
  livePromotionCount: number;
};

export function resolveLiveIntegrationDodSmokeProofStatus(input: {
  certPassed: boolean;
  integrityOverall: "PASSED" | "FAILED";
  scaffoldReadyCount: number;
}): LiveIntegrationDodSmokeProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (
    input.integrityOverall !== "PASSED" ||
    input.scaffoldReadyCount !== LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT
  ) {
    return "proof_failed_scaffold";
  }
  return "dod_audit_complete";
}

export function resolveLiveIntegrationDodSmokeOverall(
  proofStatus: LiveIntegrationDodSmokeProofStatus,
): LiveIntegrationDodSmokeOverall {
  return proofStatus === "dod_audit_complete" ? "PASSED" : "FAILED";
}

export function buildLiveIntegrationDodSmokeSummary(input: {
  certPassed: boolean;
  integrityCertPassed: boolean;
  envCertPassed: boolean;
  strictEnvMode?: boolean;
  commitSha?: string | null;
  runAt?: Date;
  env?: NodeJS.ProcessEnv;
}): LiveIntegrationDodSmokeSummary {
  const runAt = input.runAt ?? new Date();
  const env = input.env ?? process.env;

  const integrity = buildBetaIntegrationsIntegritySmokeSummary({
    registryCertPassed: input.integrityCertPassed,
    envCertPassed: input.envCertPassed,
    strictMode: input.strictEnvMode ?? false,
    commitSha: input.commitSha,
    runAt,
    env,
  });

  const dodRows = listLiveIntegrationDodRows(env);
  const dod = summarizeLiveIntegrationDod(dodRows);
  const g1g2ReadyCount = dodRows.filter(
    (row) =>
      row.gates.find((g) => g.id === "G1")?.status === "passed" &&
      row.gates.find((g) => g.id === "G2")?.status === "passed",
  ).length;

  const proofStatus = resolveLiveIntegrationDodSmokeProofStatus({
    certPassed: input.certPassed,
    integrityOverall: integrity.overall,
    scaffoldReadyCount: dod.scaffoldReadyCount,
  });

  return {
    version: LIVE_INTEGRATION_DOD_SMOKE_SUMMARY_VERSION,
    runAt: runAt.toISOString(),
    commitSha: input.commitSha?.trim() || null,
    overall: resolveLiveIntegrationDodSmokeOverall(proofStatus),
    proofStatus,
    certPassed: input.certPassed,
    integrityOverall: integrity.overall,
    integrityProofStatus: integrity.proofStatus,
    dod,
    g1g2ReadyCount,
    livePromotionCount: dod.liveCount,
  };
}

export function formatLiveIntegrationDodSmokeReportLines(
  summary: LiveIntegrationDodSmokeSummary,
): string[] {
  return [
    `overall: ${summary.overall}`,
    `proofStatus: ${summary.proofStatus}`,
    `integrityOverall: ${summary.integrityOverall}`,
    `integrityProofStatus: ${summary.integrityProofStatus}`,
    `g1ScaffoldReady: ${summary.dod.scaffoldReadyCount}/${summary.dod.total}`,
    `g2EnvReady: ${summary.dod.envReadyCount}/${summary.dod.total}`,
    `g1g2Ready: ${summary.g1g2ReadyCount}/${summary.dod.total}`,
    `liveCount: ${summary.livePromotionCount}`,
  ];
}
