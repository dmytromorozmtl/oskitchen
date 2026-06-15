import { expect, test, type Page } from "@playwright/test";

import {
  MARKETPLACE_AVAILABLE_BALANCE_LABEL,
  MARKETPLACE_MATURITY_E2E_FLOW_STEPS,
  MARKETPLACE_MATURITY_E2E_VISIBLE_MS,
  MARKETPLACE_PAYOUT_INITIATED_PATTERN,
  MARKETPLACE_VENDOR_FINANCE_PATH,
  type MarketplaceMaturityE2EFlowStep,
} from "@/lib/marketplace/marketplace-maturity-e2e-policy";

import { assertNoDashboardRscFailure } from "./dashboard-smoke";
import { runMarketplaceCartPoFulfillFlow } from "./marketplace-cart-po-fulfill-flow";

export type MarketplaceMaturityE2EFlowResult = {
  orderId: string;
  steps: MarketplaceMaturityE2EFlowStep[];
};

export async function requestVendorPayoutIfEligible(page: Page): Promise<void> {
  await page.goto(MARKETPLACE_VENDOR_FINANCE_PATH);
  await assertNoDashboardRscFailure(page);
  await expect(page.getByRole("heading", { name: /^Finance$/i })).toBeVisible({
    timeout: MARKETPLACE_MATURITY_E2E_VISIBLE_MS,
  });
  await expect(page.getByText(MARKETPLACE_AVAILABLE_BALANCE_LABEL)).toBeVisible();

  const requestPayout = page.getByRole("button", { name: /Request payout/i });
  if (!(await requestPayout.isVisible().catch(() => false))) {
    test.skip(true, "Signed-in user lacks vendor:payouts:request permission.");
  }

  if (await requestPayout.isDisabled()) {
    test.skip(true, "No available balance yet — ship sync may require order SHIPPED status.");
  }

  await requestPayout.click();
  await expect(page.getByText(MARKETPLACE_PAYOUT_INITIATED_PATTERN)).toBeVisible({
    timeout: MARKETPLACE_MATURITY_E2E_VISIBLE_MS,
  });
}

export async function runMarketplaceMaturityE2EFlow(
  page: Page,
): Promise<MarketplaceMaturityE2EFlowResult> {
  const cartPoResult = await runMarketplaceCartPoFulfillFlow(page);
  const steps: MarketplaceMaturityE2EFlowStep[] = [...cartPoResult.steps, "vendor_payout"];

  await requestVendorPayoutIfEligible(page);

  if (steps.length !== MARKETPLACE_MATURITY_E2E_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return { orderId: cartPoResult.orderId, steps };
}
