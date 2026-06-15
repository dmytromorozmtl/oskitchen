import { expect, type Page } from "@playwright/test";

import {
  BETA_ENV_FOOTNOTE_LINK_LABEL,
  BETA_ENV_FOOTNOTE_TESTID,
  INTEGRATION_HEALTH_STRIP_TESTID,
  TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL,
  TODAY_BETA_ENV_FOOTNOTE_VISIBLE_MS,
  TODAY_HEADING_PATTERN,
  TODAY_PATH,
  betaEnvBadgeSumMatchesTotal,
  parseBetaEnvBadgeCounts,
} from "@/lib/integrations/today-beta-env-footnote-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type TodayBetaEnvFootnoteFlowResult = {
  readyCount: number;
  optionalCount: number;
  missingCount: number;
  expectedTotal: number;
};

export async function runTodayBetaEnvFootnoteFlow(
  page: Page,
): Promise<TodayBetaEnvFootnoteFlowResult | null> {
  await page.goto(TODAY_PATH);
  await skipIfLoginRedirect(page, "Today BETA env footnote requires dashboard auth");

  if (await page.getByText(/permission denied|not available for your role/i).isVisible().catch(() => false)) {
    return null;
  }

  await expect(page.getByRole("heading", { name: TODAY_HEADING_PATTERN }).first()).toBeVisible({
    timeout: TODAY_BETA_ENV_FOOTNOTE_VISIBLE_MS,
  });

  const healthStrip = page.getByTestId(INTEGRATION_HEALTH_STRIP_TESTID);
  await expect(healthStrip).toBeVisible({ timeout: TODAY_BETA_ENV_FOOTNOTE_VISIBLE_MS });

  const footnote = page.getByTestId(BETA_ENV_FOOTNOTE_TESTID);
  await expect(footnote).toBeVisible({ timeout: TODAY_BETA_ENV_FOOTNOTE_VISIBLE_MS });
  await assertNoDashboardRscFailure(page);

  const footnoteText = await footnote.innerText();
  const counts = parseBetaEnvBadgeCounts(footnoteText);
  expect(counts, "BETA env footnote badge counts").not.toBeNull();
  expect(
    betaEnvBadgeSumMatchesTotal(counts!, TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL),
    "ready + optional + missing must equal eighteen BETA integrations",
  ).toBe(true);

  await expect(footnote.getByRole("link", { name: BETA_ENV_FOOTNOTE_LINK_LABEL })).toBeVisible();

  return {
    readyCount: counts!.ready,
    optionalCount: counts!.optional,
    missingCount: counts!.missing,
    expectedTotal: TODAY_BETA_ENV_FOOTNOTE_EXPECTED_TOTAL,
  };
}
