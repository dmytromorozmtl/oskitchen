import { expect, type Page } from "@playwright/test";

import {
  BETA_ENV_FOOTNOTE_TESTID,
  BETA_ENV_READINESS_PANEL_TESTID,
  BETA_ENV_READINESS_ROW_TESTID_PREFIX,
  BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT,
  BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_VISIBLE_MS,
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  INTEGRATIONS_HEALTH_PATH,
  INTEGRATION_HEALTH_STRIP_TESTID,
  LIVE_DOD_PANEL_TESTID,
  LIVE_DOD_ROW_TESTID_PREFIX,
  TODAY_HEADING_PATTERN,
  TODAY_PATH,
  betaEnvBadgeSumMatchesTotal,
  parseBetaEnvBadgeCounts,
} from "@/lib/integrations/beta-integrations-governance-capstone-e2e-policy";
import {
  BETA_ENV_FOOTNOTE_LINK_LABEL,
} from "@/lib/integrations/today-beta-env-footnote-e2e-policy";
import {
  LIVE_DOD_G3_G4_HONESTY_PATTERN,
  LIVE_DOD_ZERO_LIVE_SUMMARY_PATTERN,
} from "@/lib/integrations/live-integration-dod-gates-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type BetaIntegrationsGovernanceCapstoneFlowResult = {
  footnoteBadgeSumMatchesTotal: boolean;
  envReadinessRowCount: number;
  liveDodRowCount: number;
  expectedCount: number;
  zeroLiveInDodPanel: boolean;
  g3G4HonestyInDodPanel: boolean;
};

export async function runBetaIntegrationsGovernanceCapstoneFlow(
  page: Page,
): Promise<BetaIntegrationsGovernanceCapstoneFlowResult | null> {
  await page.goto(TODAY_PATH);
  await skipIfLoginRedirect(page, "BETA governance capstone requires dashboard auth");

  if (await page.getByText(/permission denied|not available for your role/i).isVisible().catch(() => false)) {
    return null;
  }

  await expect(page.getByRole("heading", { name: TODAY_HEADING_PATTERN }).first()).toBeVisible({
    timeout: BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_VISIBLE_MS,
  });
  await expect(page.getByTestId(INTEGRATION_HEALTH_STRIP_TESTID)).toBeVisible({
    timeout: BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_VISIBLE_MS,
  });

  const footnote = page.getByTestId(BETA_ENV_FOOTNOTE_TESTID);
  await expect(footnote).toBeVisible({ timeout: BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_VISIBLE_MS });

  const footnoteText = await footnote.innerText();
  const counts = parseBetaEnvBadgeCounts(footnoteText);
  expect(counts).not.toBeNull();
  const footnoteBadgeSumMatchesTotal = betaEnvBadgeSumMatchesTotal(
    counts!,
    BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT,
  );
  expect(footnoteBadgeSumMatchesTotal).toBe(true);

  await footnote.getByRole("link", { name: BETA_ENV_FOOTNOTE_LINK_LABEL }).click();
  await expect(page).toHaveURL(new RegExp(`${INTEGRATIONS_HEALTH_PATH.replace("/", "\\/")}`), {
    timeout: BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_VISIBLE_MS,
  });
  await expect(page.getByRole("heading", { name: INTEGRATIONS_HEALTH_HEADING_PATTERN })).toBeVisible({
    timeout: BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_VISIBLE_MS,
  });
  await assertNoDashboardRscFailure(page);

  const envPanel = page.getByTestId(BETA_ENV_READINESS_PANEL_TESTID);
  const dodPanel = page.getByTestId(LIVE_DOD_PANEL_TESTID);
  await expect(envPanel).toBeVisible({ timeout: BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_VISIBLE_MS });
  await expect(dodPanel).toBeVisible({ timeout: BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_VISIBLE_MS });
  await expect(dodPanel).toContainText(LIVE_DOD_ZERO_LIVE_SUMMARY_PATTERN);
  await expect(dodPanel).toContainText(LIVE_DOD_G3_G4_HONESTY_PATTERN);

  const envReadinessRowCount = await page
    .locator(`[data-testid^="${BETA_ENV_READINESS_ROW_TESTID_PREFIX}"]`)
    .count();
  const liveDodRowCount = await page
    .locator(`[data-testid^="${LIVE_DOD_ROW_TESTID_PREFIX}"]`)
    .count();

  expect(envReadinessRowCount).toBe(BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT);
  expect(liveDodRowCount).toBe(BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT);

  return {
    footnoteBadgeSumMatchesTotal,
    envReadinessRowCount,
    liveDodRowCount,
    expectedCount: BETA_INTEGRATIONS_GOVERNANCE_CAPSTONE_EXPECTED_COUNT,
    zeroLiveInDodPanel: true,
    g3G4HonestyInDodPanel: true,
  };
}
