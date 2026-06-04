import { expect, type Page } from "@playwright/test";

import {
  BETA_ENV_READINESS_PANEL_TESTID,
  BETA_ENV_READINESS_ROW_TESTID_PREFIX,
  BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT,
  BETA_INTEGRATIONS_GOVERNANCE_VISIBLE_MS,
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  INTEGRATIONS_HEALTH_PATH,
  LIVE_DOD_PANEL_TESTID,
  LIVE_DOD_ROW_TESTID_PREFIX,
} from "@/lib/integrations/beta-integrations-governance-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type BetaIntegrationsGovernanceFlowResult = {
  betaEnvRowCount: number;
  liveDodRowCount: number;
  expectedCount: number;
};

export async function runBetaIntegrationsGovernanceFlow(
  page: Page,
): Promise<BetaIntegrationsGovernanceFlowResult | null> {
  await page.goto(INTEGRATIONS_HEALTH_PATH);
  await skipIfLoginRedirect(page, "BETA integrations governance requires dashboard auth");

  if (await page.getByText(/permission denied|not available for your role/i).isVisible().catch(() => false)) {
    return null;
  }

  await expect(page.getByRole("heading", { name: INTEGRATIONS_HEALTH_HEADING_PATTERN })).toBeVisible({
    timeout: BETA_INTEGRATIONS_GOVERNANCE_VISIBLE_MS,
  });
  await expect(page.getByTestId(BETA_ENV_READINESS_PANEL_TESTID)).toBeVisible({
    timeout: BETA_INTEGRATIONS_GOVERNANCE_VISIBLE_MS,
  });
  await expect(page.getByTestId(LIVE_DOD_PANEL_TESTID)).toBeVisible({
    timeout: BETA_INTEGRATIONS_GOVERNANCE_VISIBLE_MS,
  });
  await assertNoDashboardRscFailure(page);

  const betaEnvRowCount = await page
    .locator(`[data-testid^="${BETA_ENV_READINESS_ROW_TESTID_PREFIX}"]`)
    .count();
  const liveDodRowCount = await page
    .locator(`[data-testid^="${LIVE_DOD_ROW_TESTID_PREFIX}"]`)
    .count();

  expect(betaEnvRowCount).toBe(BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT);
  expect(liveDodRowCount).toBe(BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT);

  return {
    betaEnvRowCount,
    liveDodRowCount,
    expectedCount: BETA_INTEGRATIONS_GOVERNANCE_EXPECTED_COUNT,
  };
}
