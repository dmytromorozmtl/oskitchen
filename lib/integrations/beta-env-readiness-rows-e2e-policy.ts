/**
 * BETA env readiness panel row contract E2E policy (QA-41).
 *
 * Validates DEV-50 env readiness rows — status badges + summary counts on Integration Health.
 *
 * @see e2e/beta-env-readiness-rows.spec.ts
 * @see components/integrations/beta-integration-env-readiness-panel.tsx
 */

import {
  BETA_ENV_READINESS_PANEL_TESTID,
  BETA_ENV_READINESS_ROW_TESTID_PREFIX,
  BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT,
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  INTEGRATIONS_HEALTH_PATH,
  betaEnvReadinessRowTestId,
} from "@/lib/integrations/beta-integrations-governance-e2e-policy";

export const BETA_ENV_READINESS_ROWS_E2E_POLICY_ID =
  "beta-env-readiness-rows-e2e-v1" as const;

export const BETA_ENV_READINESS_ROWS_SLI_ID =
  "integrations.beta_env_readiness_rows" as const;

export {
  INTEGRATIONS_HEALTH_PATH,
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  BETA_ENV_READINESS_PANEL_TESTID,
  BETA_ENV_READINESS_ROW_TESTID_PREFIX,
  betaEnvReadinessRowTestId,
};

export const BETA_ENV_READINESS_ROWS_EXPECTED_COUNT =
  BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT;

export const BETA_ENV_READINESS_ROWS_VISIBLE_MS = 30_000 as const;

export const BETA_ENV_STATUS_READY_LABEL = "Env ready" as const;
export const BETA_ENV_STATUS_OPTIONAL_LABEL = "No server env" as const;
export const BETA_ENV_STATUS_MISSING_LABEL = "Missing env" as const;

export const BETA_ENV_READINESS_HONESTY_PATTERN =
  /Does not replace tenant credential/i;

export const BETA_ENV_READINESS_SETUP_LINK_LABEL = "Setup →" as const;

export type BetaEnvReadinessRowsContract = {
  panelVisible: boolean;
  rowCount: number;
  expectedCount: number;
  readyCount: number;
  optionalCount: number;
  missingCount: number;
  allRowsHaveStatusBadge: boolean;
  allRowsHaveSetupLink: boolean;
  honestyDisclaimerVisible: boolean;
};

export function parseBetaEnvReadinessSummaryCounts(text: string): {
  ready: number;
  optional: number;
  missing: number;
} | null {
  const ready = text.match(/(\d+)\s+env ready/i);
  const optional = text.match(/(\d+)\s+no server env/i);
  const missing = text.match(/(\d+)\s+missing vars/i);
  if (!ready || !optional || !missing) return null;
  return {
    ready: Number(ready[1]),
    optional: Number(optional[1]),
    missing: Number(missing[1]),
  };
}

export function betaEnvReadinessSummarySumMatchesTotal(
  counts: { ready: number; optional: number; missing: number },
  expectedTotal: number = BETA_ENV_READINESS_ROWS_EXPECTED_COUNT,
): boolean {
  return counts.ready + counts.optional + counts.missing === expectedTotal;
}

export function betaEnvReadinessRowsWithinContract(
  input: BetaEnvReadinessRowsContract,
): boolean {
  return (
    input.panelVisible &&
    input.rowCount === input.expectedCount &&
    betaEnvReadinessSummarySumMatchesTotal(
      {
        ready: input.readyCount,
        optional: input.optionalCount,
        missing: input.missingCount,
      },
      input.expectedCount,
    ) &&
    input.allRowsHaveStatusBadge &&
    input.allRowsHaveSetupLink &&
    input.honestyDisclaimerVisible
  );
}

export const BETA_ENV_STATUS_LABELS = [
  BETA_ENV_STATUS_READY_LABEL,
  BETA_ENV_STATUS_OPTIONAL_LABEL,
  BETA_ENV_STATUS_MISSING_LABEL,
] as const;
