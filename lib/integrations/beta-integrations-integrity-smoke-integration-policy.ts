/**
 * BETA integrations integrity smoke integration policy (QA-42).
 *
 * Validates DEV-52 smoke builder — registry + env cert chain → honest PASSED/FAILED.
 *
 * @see tests/integration/beta-integrations-integrity-smoke.integration.test.ts
 * @see scripts/smoke-beta-integrations-integrity-era17.ts
 */

import {
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_POLICY_ID,
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/integrations/beta-integrations-integrity-smoke-era17-policy";
import { LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";
import type { BetaIntegrationsIntegritySmokeSummary } from "@/lib/integrations/beta-integrations-integrity-smoke-summary";

export const BETA_INTEGRATIONS_INTEGRITY_SMOKE_INTEGRATION_POLICY_ID =
  "beta-integrations-integrity-smoke-integration-v1" as const;

export const BETA_INTEGRATIONS_INTEGRITY_SMOKE_INTEGRATION_SLI_ID =
  "integrations.beta_integrity_smoke_builder" as const;

export {
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_POLICY_ID,
  BETA_INTEGRATIONS_INTEGRITY_SMOKE_ERA17_SUMMARY_ARTIFACT,
};

export const BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT =
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT;

export type BetaIntegrationsIntegritySmokeIntegrationContract = {
  overall: BetaIntegrationsIntegritySmokeSummary["overall"];
  proofStatus: BetaIntegrationsIntegritySmokeSummary["proofStatus"];
  registryBetaCount: number;
  envTotal: number;
  expectedTotal: number;
  scaffoldFailureCount: number;
  registryOverall: BetaIntegrationsIntegritySmokeSummary["registry"]["overall"];
  envOverall: BetaIntegrationsIntegritySmokeSummary["env"]["overall"];
};

export function betaIntegrationsIntegritySmokePassContract(
  summary: BetaIntegrationsIntegritySmokeSummary,
): BetaIntegrationsIntegritySmokeIntegrationContract {
  return {
    overall: summary.overall,
    proofStatus: summary.proofStatus,
    registryBetaCount: summary.registry.registryBetaCount,
    envTotal: summary.env.envSummary.total,
    expectedTotal: summary.registry.expectedBetaCount,
    scaffoldFailureCount: summary.registry.scaffoldFailures.length,
    registryOverall: summary.registry.overall,
    envOverall: summary.env.overall,
  };
}

export function betaIntegrationsIntegritySmokeWithinPassContract(
  contract: BetaIntegrationsIntegritySmokeIntegrationContract,
): boolean {
  return (
    contract.overall === "PASSED" &&
    contract.proofStatus === "integrity_complete" &&
    contract.registryBetaCount === contract.expectedTotal &&
    contract.envTotal === contract.expectedTotal &&
    contract.expectedTotal === BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT &&
    contract.scaffoldFailureCount === 0 &&
    contract.registryOverall === "PASSED" &&
    contract.envOverall === "PASSED"
  );
}

export function betaIntegrationsIntegritySmokeHonestScaffold(
  summary: BetaIntegrationsIntegritySmokeSummary,
): boolean {
  return (
    summary.registry.scaffoldFailures.length === 0 &&
    summary.registry.registryBetaCount === BETA_INTEGRATIONS_INTEGRITY_EXPECTED_BETA_COUNT &&
    summary.registry.placeholderCount === 0
  );
}
