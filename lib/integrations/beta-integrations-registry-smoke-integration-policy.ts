/**
 * BETA integrations registry smoke integration policy (QA-44).
 *
 * Validates DEV-49 smoke builder — scaffold audit → honest PASSED/FAILED.
 *
 * @see tests/integration/beta-integrations-registry-smoke.integration.test.ts
 * @see scripts/smoke-beta-integrations-registry-era17.ts
 */

import {
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
} from "@/lib/integrations/beta-integrations-registry-smoke-era17-policy";
import type { BetaIntegrationsRegistrySmokeSummary } from "@/lib/integrations/beta-integrations-registry-smoke-summary";

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_INTEGRATION_POLICY_ID =
  "beta-integrations-registry-smoke-integration-v1" as const;

export const BETA_INTEGRATIONS_REGISTRY_SMOKE_INTEGRATION_SLI_ID =
  "integrations.beta_registry_smoke_builder" as const;

export {
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_POLICY_ID,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_SUMMARY_ARTIFACT,
  BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT,
};

export type BetaIntegrationsRegistrySmokeIntegrationContract = {
  overall: BetaIntegrationsRegistrySmokeSummary["overall"];
  proofStatus: BetaIntegrationsRegistrySmokeSummary["proofStatus"];
  registryBetaCount: number;
  expectedBetaCount: number;
  placeholderCount: number;
  scaffoldFailureCount: number;
  certPassed: boolean;
};

export function betaIntegrationsRegistrySmokePassContract(
  summary: BetaIntegrationsRegistrySmokeSummary,
): BetaIntegrationsRegistrySmokeIntegrationContract {
  return {
    overall: summary.overall,
    proofStatus: summary.proofStatus,
    registryBetaCount: summary.registryBetaCount,
    expectedBetaCount: summary.expectedBetaCount,
    placeholderCount: summary.placeholderCount,
    scaffoldFailureCount: summary.scaffoldFailures.length,
    certPassed: summary.certPassed,
  };
}

export function betaIntegrationsRegistrySmokeWithinPassContract(
  contract: BetaIntegrationsRegistrySmokeIntegrationContract,
): boolean {
  return (
    contract.overall === "PASSED" &&
    contract.proofStatus === "scaffold_complete" &&
    contract.registryBetaCount === contract.expectedBetaCount &&
    contract.expectedBetaCount === BETA_INTEGRATIONS_REGISTRY_SMOKE_ERA17_EXPECTED_COUNT &&
    contract.placeholderCount === 0 &&
    contract.scaffoldFailureCount === 0 &&
    contract.certPassed
  );
}

export function betaIntegrationsRegistrySmokeHonestZeroPlaceholder(
  summary: BetaIntegrationsRegistrySmokeSummary,
): boolean {
  return summary.placeholderCount === 0 && summary.scaffoldFailures.length === 0;
}
