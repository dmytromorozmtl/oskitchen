/**
 * LIVE integration DoD smoke integration policy (QA-40).
 *
 * Validates DEV-55 smoke builder — integrity cert + gate tracker → honest PASSED/FAILED.
 *
 * @see tests/integration/live-integration-dod-smoke.integration.test.ts
 * @see scripts/smoke-live-integration-dod-era17.ts
 */

import {
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/integrations/live-integration-dod-smoke-era17-policy";
import type { LiveIntegrationDodSmokeSummary } from "@/lib/integrations/live-integration-dod-smoke-summary";

export const LIVE_INTEGRATION_DOD_SMOKE_INTEGRATION_POLICY_ID =
  "live-integration-dod-smoke-integration-v1" as const;

export const LIVE_INTEGRATION_DOD_SMOKE_INTEGRATION_SLI_ID =
  "integrations.live_dod_smoke_builder" as const;

export {
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_POLICY_ID,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_SUMMARY_ARTIFACT,
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT,
};

export type LiveIntegrationDodSmokeIntegrationContract = {
  overall: LiveIntegrationDodSmokeSummary["overall"];
  proofStatus: LiveIntegrationDodSmokeSummary["proofStatus"];
  scaffoldReadyCount: number;
  expectedTotal: number;
  livePromotionCount: number;
  integrityOverall: LiveIntegrationDodSmokeSummary["integrityOverall"];
};

export function liveIntegrationDodSmokePassContract(
  summary: LiveIntegrationDodSmokeSummary,
): LiveIntegrationDodSmokeIntegrationContract {
  return {
    overall: summary.overall,
    proofStatus: summary.proofStatus,
    scaffoldReadyCount: summary.dod.scaffoldReadyCount,
    expectedTotal: summary.dod.total,
    livePromotionCount: summary.livePromotionCount,
    integrityOverall: summary.integrityOverall,
  };
}

export function liveIntegrationDodSmokeWithinPassContract(
  contract: LiveIntegrationDodSmokeIntegrationContract,
): boolean {
  return (
    contract.overall === "PASSED" &&
    contract.proofStatus === "dod_audit_complete" &&
    contract.scaffoldReadyCount === contract.expectedTotal &&
    contract.expectedTotal === LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT &&
    contract.livePromotionCount === 4 &&
    contract.integrityOverall === "PASSED"
  );
}

export function liveIntegrationDodSmokeHonestNoLiveClaim(
  summary: LiveIntegrationDodSmokeSummary,
): boolean {
  return summary.livePromotionCount === 4 && summary.dod.liveCount === 4;
}
