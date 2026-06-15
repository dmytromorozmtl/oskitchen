/**
 * BETA integrations governance capstone E2E policy (QA-43).
 *
 * Golden path: Today health strip → Integration Health governance panels.
 *
 * @see e2e/beta-integrations-governance-capstone.spec.ts
 */

import {
  BETA_ENV_READINESS_PANEL_TESTID,
  BETA_ENV_READINESS_ROW_TESTID_PREFIX,
  BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT,
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  INTEGRATIONS_HEALTH_PATH,
  LIVE_DOD_PANEL_TESTID,
  LIVE_DOD_ROW_TESTID_PREFIX,
} from "@/lib/integrations/beta-integrations-governance-e2e-policy";
import { LIVE_DOD_G3_G4_HONESTY_PATTERN, LIVE_DOD_ZERO_LIVE_SUMMARY_PATTERN } from "@/lib/integrations/live-integration-dod-gates-e2e-policy";
import {
  BETA_ENV_FOOTNOTE_HEALTH_HREF,
  BETA_ENV_FOOTNOTE_LINK_LABEL,
  BETA_ENV_FOOTNOTE_TESTID,
  INTEGRATION_HEALTH_STRIP_TESTID,
  TODAY_HEADING_PATTERN,
  TODAY_PATH,
  betaEnvBadgeSumMatchesTotal,
  parseBetaEnvBadgeCounts,
} from "@/lib/integrations/today-beta-env-footnote-e2e-policy";

export const BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_E2E_POLICY_ID =
  "beta-integrations-governance-capstone-e2e-v1" as const;

export const BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_SLI_ID =
  "integrations.beta_governance_capstone" as const;

export {
  TODAY_PATH,
  TODAY_HEADING_PATTERN,
  INTEGRATIONS_HEALTH_PATH,
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  INTEGRATION_HEALTH_STRIP_TESTID,
  BETA_ENV_FOOTNOTE_TESTID,
  BETA_ENV_FOOTNOTE_LINK_LABEL,
  BETA_ENV_FOOTNOTE_HEALTH_HREF,
  BETA_ENV_READINESS_PANEL_TESTID,
  LIVE_DOD_PANEL_TESTID,
};

export const BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT =
  BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT;

export const BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_VISIBLE_MS = 30_000 as const;

export type BetaIntegrationsGovernanceCapstoneContract = {
  todayHealthStripVisible: boolean;
  todayFootnoteVisible: boolean;
  footnoteBadgeSumMatchesTotal: boolean;
  navigatedToHealth: boolean;
  envReadinessRowCount: number;
  liveDodRowCount: number;
  expectedCount: number;
  honestLiveCountInDodPanel: boolean;
  g3G4HonestyInDodPanel: boolean;
};

export function betaIntegrationsGovernanceCapstoneWithinContract(
  input: BetaIntegrationsGovernanceCapstoneContract,
): boolean {
  return (
    input.todayHealthStripVisible &&
    input.todayFootnoteVisible &&
    input.footnoteBadgeSumMatchesTotal &&
    input.navigatedToHealth &&
    input.envReadinessRowCount === input.expectedCount &&
    input.liveDodRowCount === input.expectedCount &&
    input.honestLiveCountInDodPanel &&
    input.g3G4HonestyInDodPanel
  );
}

export { parseBetaEnvBadgeCounts, betaEnvBadgeSumMatchesTotal, LIVE_DOD_ROW_TESTID_PREFIX, BETA_ENV_READINESS_ROW_TESTID_PREFIX };
