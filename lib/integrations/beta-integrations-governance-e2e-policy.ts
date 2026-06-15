/**
 * BETA integrations governance E2E policy (QA-37).
 *
 * Validates DEV-49–DEV-55 panels on Integration Health — env readiness + LIVE DoD gates.
 *
 * @see e2e/beta-integrations-governance.spec.ts
 * @see app/dashboard/integrations/health/page.tsx
 */

import { LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT } from "@/lib/integrations/live-integration-dod-smoke-era17-policy";

export const BETA_INTEGRATIONS_GOVERNANCE_E2E_POLICY_ID =
  "beta-integrations-governance-e2e-v1" as const;

export const BETA_INTEGRATIONS_GOVERNANCE_SLI_ID =
  "integrations.beta_governance_panels" as const;

export const INTEGRATIONS_HEALTH_PATH = "/dashboard/integrations/health" as const;

export const INTEGRATIONS_HEALTH_HEADING_PATTERN = /^Integration health$/i;

export const BETA_ENV_READINESS_PANEL_TESTID = "beta-integration-env-readiness-panel" as const;
export const BETA_ENV_READINESS_ROW_TESTID_PREFIX = "beta-env-readiness-" as const;

export const LIVE_DOD_PANEL_TESTID = "live-integration-dod-panel" as const;
export const LIVE_DOD_ROW_TESTID_PREFIX = "live-integration-dod-" as const;

export const BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT =
  LIVE_INTEGRATION_DOD_SMOKE_ERA17_EXPECTED_BETA_COUNT;

export const BETA_INTEGRATIONS_GOVERNANCE_VISIBLE_MS = 30_000 as const;

export function betaEnvReadinessRowTestId(integrationId: string): string {
  return `${BETA_ENV_READINESS_ROW_TESTID_PREFIX}${integrationId}`;
}

export function liveDodRowTestId(integrationId: string): string {
  return `${LIVE_DOD_ROW_TESTID_PREFIX}${integrationId}`;
}

export type BetaIntegrationsGovernanceContract = {
  betaEnvPanelVisible: boolean;
  liveDodPanelVisible: boolean;
  betaEnvRowCount: number;
  liveDodRowCount: number;
  expectedCount: number;
};

export function betaIntegrationsGovernanceWithinContract(
  input: BetaIntegrationsGovernanceContract,
): boolean {
  return (
    input.betaEnvPanelVisible &&
    input.liveDodPanelVisible &&
    input.betaEnvRowCount === input.expectedCount &&
    input.liveDodRowCount === input.expectedCount
  );
}
