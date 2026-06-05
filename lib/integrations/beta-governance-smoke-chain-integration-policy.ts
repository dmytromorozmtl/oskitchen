/**
 * BETA governance smoke chain capstone integration policy (QA-45).
 *
 * Validates DEV-49–DEV-55 full smoke chain — registry → integrity → LIVE DoD.
 *
 * @see tests/integration/beta-governance-smoke-chain.integration.test.ts
 */

import {
  betaIntegrationsIntegritySmokePassContract,
  betaIntegrationsIntegritySmokeWithinPassContract,
} from "@/lib/integrations/beta-integrations-integrity-smoke-integration-policy";
import {
  betaIntegrationsRegistrySmokePassContract,
  betaIntegrationsRegistrySmokeWithinPassContract,
} from "@/lib/integrations/beta-integrations-registry-smoke-integration-policy";
import { auditBetaIntegrationsRegistryScaffold } from "@/lib/integrations/beta-integrations-registry-smoke-summary";
import { buildBetaIntegrationsIntegritySmokeSummary } from "@/lib/integrations/beta-integrations-integrity-smoke-summary";
import { buildBetaIntegrationsRegistrySmokeSummary } from "@/lib/integrations/beta-integrations-registry-smoke-summary";
import { LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";
import {
  liveIntegrationDodSmokeHonestNoLiveClaim,
  liveIntegrationDodSmokePassContract,
  liveIntegrationDodSmokeWithinPassContract,
} from "@/lib/integrations/live-integration-dod-smoke-integration-policy";
import { buildLiveIntegrationDodSmokeSummary } from "@/lib/integrations/live-integration-dod-smoke-summary";

export const BETA_GOVERNANCE_SMOKE_CHAIN_INTEGRATION_POLICY_ID =
  "beta-governance-smoke-chain-integration-v1" as const;

export const BETA_GOVERNANCE_SMOKE_CHAIN_SLI_ID =
  "integrations.beta_governance_smoke_chain" as const;

export const BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT =
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT;

export type BetaGovernanceSmokeChainSummaries = {
  registry: ReturnType<typeof buildBetaIntegrationsRegistrySmokeSummary>;
  integrity: ReturnType<typeof buildBetaIntegrationsIntegritySmokeSummary>;
  dod: ReturnType<typeof buildLiveIntegrationDodSmokeSummary>;
};

export type BetaGovernanceSmokeChainContract = {
  registryPassed: boolean;
  integrityPassed: boolean;
  dodPassed: boolean;
  chainPassed: boolean;
  expectedBetaCount: number;
  livePromotionCount: number;
  placeholderCount: number;
};

export function buildBetaGovernanceSmokeChainSummaries(input: {
  certPassed: boolean;
  strictEnvMode?: boolean;
  commitSha?: string | null;
  runAt?: Date;
  env?: NodeJS.ProcessEnv;
  root?: string;
}): BetaGovernanceSmokeChainSummaries {
  const root = input.root ?? process.cwd();
  const audit = auditBetaIntegrationsRegistryScaffold(root);

  const registry = buildBetaIntegrationsRegistrySmokeSummary({
    certPassed: input.certPassed,
    scaffoldFailures: audit.scaffoldFailures,
    registryBetaCount: audit.registryBetaCount,
    placeholderCount: audit.placeholderCount,
    commitSha: input.commitSha,
    runAt: input.runAt,
  });

  const integrity = buildBetaIntegrationsIntegritySmokeSummary({
    registryCertPassed: input.certPassed,
    envCertPassed: input.certPassed,
    strictEnvMode: input.strictEnvMode ?? false,
    commitSha: input.commitSha,
    runAt: input.runAt,
    env: input.env,
  });

  const dod = buildLiveIntegrationDodSmokeSummary({
    certPassed: input.certPassed,
    integrityCertPassed: input.certPassed,
    envCertPassed: input.certPassed,
    strictEnvMode: input.strictEnvMode ?? false,
    commitSha: input.commitSha,
    runAt: input.runAt,
    env: input.env,
  });

  return { registry, integrity, dod };
}

export function betaGovernanceSmokeChainPassContract(
  summaries: BetaGovernanceSmokeChainSummaries,
): BetaGovernanceSmokeChainContract {
  const registryPassed = betaIntegrationsRegistrySmokeWithinPassContract(
    betaIntegrationsRegistrySmokePassContract(summaries.registry),
  );
  const integrityPassed = betaIntegrationsIntegritySmokeWithinPassContract(
    betaIntegrationsIntegritySmokePassContract(summaries.integrity),
  );
  const dodPassed = liveIntegrationDodSmokeWithinPassContract(
    liveIntegrationDodSmokePassContract(summaries.dod),
  );

  return {
    registryPassed,
    integrityPassed,
    dodPassed,
    chainPassed: registryPassed && integrityPassed && dodPassed,
    expectedBetaCount: summaries.registry.expectedBetaCount,
    livePromotionCount: summaries.dod.livePromotionCount,
    placeholderCount: summaries.registry.placeholderCount,
  };
}

export function betaGovernanceSmokeChainWithinPassContract(
  contract: BetaGovernanceSmokeChainContract,
): boolean {
  return (
    contract.chainPassed &&
    contract.registryPassed &&
    contract.integrityPassed &&
    contract.dodPassed &&
    contract.expectedBetaCount === BETA_GOVERNANCE_SMOKE_CHAIN_EXPECTED_BETA_COUNT &&
    contract.livePromotionCount === 3 &&
    contract.placeholderCount === 0
  );
}

export function betaGovernanceSmokeChainHonestNoLiveClaim(
  summaries: BetaGovernanceSmokeChainSummaries,
): boolean {
  return liveIntegrationDodSmokeHonestNoLiveClaim(summaries.dod);
}
