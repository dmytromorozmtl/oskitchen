import { expect, type Page } from "@playwright/test";

import {
  BETA_ENV_READINESS_HONESTY_PATTERN,
  BETA_ENV_READINESS_PANEL_TESTID,
  BETA_ENV_READINESS_ROWS_EXPECTED_COUNT,
  BETA_ENV_READINESS_ROWS_VISIBLE_MS,
  BETA_ENV_READINESS_SETUP_LINK_LABEL,
  BETA_ENV_STATUS_LABELS,
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  INTEGRATIONS_HEALTH_PATH,
  betaEnvReadinessSummarySumMatchesTotal,
  parseBetaEnvReadinessSummaryCounts,
} from "@/lib/integrations/beta-env-readiness-rows-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type BetaEnvReadinessRowsFlowResult = {
  rowCount: number;
  expectedCount: number;
  readyCount: number;
  optionalCount: number;
  missingCount: number;
  allRowsHaveStatusBadge: boolean;
  allRowsHaveSetupLink: boolean;
};

function rowHasStatusBadge(rowText: string): boolean {
  return BETA_ENV_STATUS_LABELS.some((label) => rowText.includes(label));
}

export async function runBetaEnvReadinessRowsFlow(
  page: Page,
): Promise<BetaEnvReadinessRowsFlowResult | null> {
  await page.goto(INTEGRATIONS_HEALTH_PATH);
  await skipIfLoginRedirect(page, "BETA env readiness rows E2E requires dashboard auth");

  if (await page.getByText(/permission denied|not available for your role/i).isVisible().catch(() => false)) {
    return null;
  }

  await expect(page.getByRole("heading", { name: INTEGRATIONS_HEALTH_HEADING_PATTERN })).toBeVisible({
    timeout: BETA_ENV_READINESS_ROWS_VISIBLE_MS,
  });

  const panel = page.getByTestId(BETA_ENV_READINESS_PANEL_TESTID);
  await expect(panel).toBeVisible({ timeout: BETA_ENV_READINESS_ROWS_VISIBLE_MS });
  await expect(panel).toContainText(BETA_ENV_READINESS_HONESTY_PATTERN);
  await assertNoDashboardRscFailure(page);

  const panelText = await panel.innerText();
  const counts = parseBetaEnvReadinessSummaryCounts(panelText);
  expect(counts, "BETA env readiness summary counts").not.toBeNull();
  expect(
    betaEnvReadinessSummarySumMatchesTotal(counts!, BETA_ENV_READINESS_ROWS_EXPECTED_COUNT),
    "ready + optional + missing must equal eighteen BETA integrations",
  ).toBe(true);

  const rows = panel.locator('[data-testid^="beta-env-readiness-"]');
  const rowCount = await rows.count();
  expect(rowCount).toBe(BETA_ENV_READINESS_ROWS_EXPECTED_COUNT);

  let allRowsHaveStatusBadge = true;
  let allRowsHaveSetupLink = true;

  for (let i = 0; i < rowCount; i += 1) {
    const row = rows.nth(i);
    const rowText = await row.innerText();
    if (!rowHasStatusBadge(rowText)) {
      allRowsHaveStatusBadge = false;
    }
    const setupLink = row.getByRole("link", { name: BETA_ENV_READINESS_SETUP_LINK_LABEL });
    if ((await setupLink.count()) < 1) {
      allRowsHaveSetupLink = false;
    }
  }

  expect(allRowsHaveStatusBadge, "each row must show env readiness status badge").toBe(true);
  expect(allRowsHaveSetupLink, "each row must link to integration setup").toBe(true);

  return {
    rowCount,
    expectedCount: BETA_ENV_READINESS_ROWS_EXPECTED_COUNT,
    readyCount: counts!.ready,
    optionalCount: counts!.optional,
    missingCount: counts!.missing,
    allRowsHaveStatusBadge,
    allRowsHaveSetupLink,
  };
}
