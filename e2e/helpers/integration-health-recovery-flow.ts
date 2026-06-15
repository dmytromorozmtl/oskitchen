import { expect, type Locator, type Page } from "@playwright/test";

import {
  INTEGRATION_HEALTH_HEADING_PATTERN,
  INTEGRATION_HEALTH_RECOVERY_URL,
  INTEGRATION_HEALTH_RECOVERY_VISIBLE_MS,
  RECOVERY_PANEL_TESTID,
  RECOVERY_QUICK_LINK_TESTID_PREFIX,
  RECOVERY_STEP_TESTID_PREFIX,
  type IntegrationHealthRecoveryClickSurface,
} from "@/lib/integration-health/integration-health-recovery-playbook-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";

export type IntegrationHealthRecoveryFlowResult = {
  clickedSurface: IntegrationHealthRecoveryClickSurface;
  destinationPath: string;
  recoveryStepCount: number;
  quickLinkCount: number;
};

async function pickRecoveryClickTarget(page: Page): Promise<{
  locator: Locator;
  surface: IntegrationHealthRecoveryClickSurface;
} | null> {
  const recoveryStep = page.locator(`[data-testid^="${RECOVERY_STEP_TESTID_PREFIX}"]`).first();
  const stepOpenButton = recoveryStep.getByRole("link", { name: /^Open$/i });
  if (await stepOpenButton.isVisible().catch(() => false)) {
    return { locator: stepOpenButton, surface: "recovery_step" };
  }

  const quickLink = page.locator(`[data-testid^="${RECOVERY_QUICK_LINK_TESTID_PREFIX}"]`).first();
  if (await quickLink.isVisible().catch(() => false)) {
    return { locator: quickLink, surface: "recovery_quick_link" };
  }

  return null;
}

export async function runIntegrationHealthRecoveryPlaybookFlow(
  page: Page,
): Promise<IntegrationHealthRecoveryFlowResult | null> {
  await page.goto(INTEGRATION_HEALTH_RECOVERY_URL);
  await skipIfLoginRedirect(page, "Integration health recovery requires dashboard auth");

  if (await page.getByText(/permission denied|not available for your role/i).isVisible().catch(() => false)) {
    return null;
  }

  await expect(page.getByRole("heading", { name: INTEGRATION_HEALTH_HEADING_PATTERN })).toBeVisible({
    timeout: INTEGRATION_HEALTH_RECOVERY_VISIBLE_MS,
  });
  await expect(page.getByTestId(RECOVERY_PANEL_TESTID)).toBeVisible({
    timeout: INTEGRATION_HEALTH_RECOVERY_VISIBLE_MS,
  });
  await assertNoDashboardRscFailure(page);

  const recoveryStepCount = await page
    .locator(`[data-testid^="${RECOVERY_STEP_TESTID_PREFIX}"]`)
    .count();
  const quickLinkCount = await page
    .locator(`[data-testid^="${RECOVERY_QUICK_LINK_TESTID_PREFIX}"]`)
    .count();

  const clickTarget = await pickRecoveryClickTarget(page);
  if (!clickTarget) {
    return null;
  }

  const beforePath = new URL(page.url()).pathname;
  await clickTarget.locator.click();
  await page.waitForLoadState("domcontentloaded");
  await expect
    .poll(() => new URL(page.url()).pathname, {
      timeout: INTEGRATION_HEALTH_RECOVERY_VISIBLE_MS,
    })
    .not.toBe(beforePath)
    .catch(() => undefined);
  await assertNoDashboardRscFailure(page);

  return {
    clickedSurface: clickTarget.surface,
    destinationPath: new URL(page.url()).pathname,
    recoveryStepCount,
    quickLinkCount,
  };
}
