import { expect, type Page } from "@playwright/test";

import {
  INTEGRATIONS_HEALTH_HEADING_PATTERN,
  INTEGRATIONS_HEALTH_PATH,
  LIVE_DOD_G1_PASSED_TITLE_FRAGMENT,
  LIVE_DOD_G3_G4_HONESTY_PATTERN,
  LIVE_DOD_G3_NOT_MEASURED_TITLE_FRAGMENT,
  LIVE_DOD_G4_NOT_MEASURED_TITLE_FRAGMENT,
  LIVE_DOD_GATES_EXPECTED_ROW_COUNT,
  LIVE_DOD_GATES_VISIBLE_MS,
  LIVE_DOD_PANEL_TESTID,
  LIVE_DOD_ROW_TESTID_PREFIX,
  LIVE_DOD_ZERO_LIVE_SUMMARY_PATTERN,
} from "@/lib/integrations/live-integration-dod-gates-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type LiveIntegrationDodGatesFlowResult = {
  rowCount: number;
  expectedCount: number;
  allG1ScaffoldPassed: boolean;
  allG3NotMeasured: boolean;
  allG4NotMeasured: boolean;
};

async function rowGateTitleMatches(
  page: Page,
  rowTestId: string,
  titleFragment: string,
): Promise<boolean> {
  const row = page.getByTestId(rowTestId);
  const count = await row.locator(`[title*="${titleFragment}"]`).count();
  return count >= 1;
}

export async function runLiveIntegrationDodGatesFlow(
  page: Page,
): Promise<LiveIntegrationDodGatesFlowResult | null> {
  await page.goto(INTEGRATIONS_HEALTH_PATH);
  await skipIfLoginRedirect(page, "LIVE DoD gates E2E requires dashboard auth");

  if (await page.getByText(/permission denied|not available for your role/i).isVisible().catch(() => false)) {
    return null;
  }

  await expect(page.getByRole("heading", { name: INTEGRATIONS_HEALTH_HEADING_PATTERN })).toBeVisible({
    timeout: LIVE_DOD_GATES_VISIBLE_MS,
  });

  const panel = page.getByTestId(LIVE_DOD_PANEL_TESTID);
  await expect(panel).toBeVisible({ timeout: LIVE_DOD_GATES_VISIBLE_MS });
  await expect(panel).toContainText(LIVE_DOD_ZERO_LIVE_SUMMARY_PATTERN);
  await expect(panel).toContainText(LIVE_DOD_G3_G4_HONESTY_PATTERN);
  await assertNoDashboardRscFailure(page);

  const rows = page.locator(`[data-testid^="${LIVE_DOD_ROW_TESTID_PREFIX}"]`);
  const rowCount = await rows.count();
  expect(rowCount).toBe(LIVE_DOD_GATES_EXPECTED_ROW_COUNT);

  let allG1ScaffoldPassed = true;
  let allG3NotMeasured = true;
  let allG4NotMeasured = true;

  for (let i = 0; i < rowCount; i += 1) {
    const rowTestId = (await rows.nth(i).getAttribute("data-testid")) ?? "";
    if (!(await rowGateTitleMatches(page, rowTestId, LIVE_DOD_G1_PASSED_TITLE_FRAGMENT))) {
      allG1ScaffoldPassed = false;
    }
    if (!(await rowGateTitleMatches(page, rowTestId, LIVE_DOD_G3_NOT_MEASURED_TITLE_FRAGMENT))) {
      allG3NotMeasured = false;
    }
    if (!(await rowGateTitleMatches(page, rowTestId, LIVE_DOD_G4_NOT_MEASURED_TITLE_FRAGMENT))) {
      allG4NotMeasured = false;
    }
  }

  expect(allG1ScaffoldPassed, "all fourteen BETA rows must show G1 scaffold passed").toBe(true);
  expect(allG3NotMeasured, "G3 must remain not_measured on every row").toBe(true);
  expect(allG4NotMeasured, "G4 must remain not_measured on every row").toBe(true);

  return {
    rowCount,
    expectedCount: LIVE_DOD_GATES_EXPECTED_ROW_COUNT,
    allG1ScaffoldPassed,
    allG3NotMeasured,
    allG4NotMeasured,
  };
}
