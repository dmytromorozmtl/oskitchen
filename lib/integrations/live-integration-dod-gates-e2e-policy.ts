/**
 * LIVE integration DoD G1–G4 gate contract E2E policy (QA-39).
 *
 * Validates DEV-54 gate honesty on Integration Health — G1 scaffold, G3/G4 not_measured.
 *
 * @see e2e/live-integration-dod-gates.spec.ts
 * @see components/integrations/live-integration-dod-panel.tsx
 */

import { LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";
import {
  BETA_INTEGRATIONS_GOVERNANCE_E2E_POLICY_ID,
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  INTEGRATIONS_HEALTH_PATH,
  LIVE_DOD_PANEL_TESTID,
  LIVE_DOD_ROW_TESTID_PREFIX,
} from "@/lib/integrations/beta-integrations-governance-e2e-policy";

export const LIVE_INTEGRATION_DOD_GATES_E2E_POLICY_ID =
  "live-integration-dod-gates-e2e-v1" as const;

export const LIVE_INTEGRATION_DOD_GATES_SLI_ID =
  "integrations.live_dod_gate_contract" as const;

export {
  INTEGRATIONS_HEALTH_PATH,
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  LIVE_DOD_PANEL_TESTID,
  LIVE_DOD_ROW_TESTID_PREFIX,
};

export const LIVE_DOD_GATES_EXPECTED_ROW_COUNT =
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT;

export const LIVE_DOD_GATES_VISIBLE_MS = 30_000 as const;

/** Gate pill `title` when G1 scaffold audit passes. */
export const LIVE_DOD_G1_PASSED_TITLE_FRAGMENT =
  "Registry scaffold complete" as const;

/** Gate pill `title` when G3 is honestly not measured in CI. */
export const LIVE_DOD_G3_NOT_MEASURED_TITLE_FRAGMENT =
  "Requires production tenant" as const;

/** Gate pill `title` when G4 is honestly not measured in CI. */
export const LIVE_DOD_G4_NOT_MEASURED_TITLE_FRAGMENT =
  "Requires 24h production" as const;

export const LIVE_DOD_ZERO_LIVE_SUMMARY_PATTERN = /3 LIVE/i;
export const LIVE_DOD_G3_G4_HONESTY_PATTERN = /G3\/G4 require production proof/i;

export const LIVE_DOD_GATES_PARENT_POLICY_ID = BETA_INTEGRATIONS_GOVERNANCE_E2E_POLICY_ID;

export type LiveIntegrationDodGatesContract = {
  panelVisible: boolean;
  rowCount: number;
  expectedCount: number;
  allG1ScaffoldPassed: boolean;
  allG3NotMeasured: boolean;
  allG4NotMeasured: boolean;
  oneLiveInSummary: boolean;
  g3G4HonestyInDescription: boolean;
};

export function liveIntegrationDodGatesWithinContract(
  input: LiveIntegrationDodGatesContract,
): boolean {
  return (
    input.panelVisible &&
    input.rowCount === input.expectedCount &&
    input.allG1ScaffoldPassed &&
    input.allG3NotMeasured &&
    input.allG4NotMeasured &&
    input.oneLiveInSummary &&
    input.g3G4HonestyInDescription
  );
}

export function liveDodRowTestId(integrationId: string): string {
  return `${LIVE_DOD_ROW_TESTID_PREFIX}${integrationId}`;
}
