import { expect, test, type Page } from "@playwright/test";

import {
  BILL_SPLIT_NO_OPEN_TABS_TEXT,
  BILL_SPLIT_PANEL_TESTID,
  billSplitModeTestId,
  POS_TABS_PATH,
} from "@/lib/pos/bill-splitting-e2e-policy";
import { BILL_SPLIT_MODES } from "@/lib/pos/bill-splitting";

export async function navigateToBillSplitPanel(page: Page): Promise<void> {
  await page.goto(POS_TABS_PATH);

  if (await page.getByText(BILL_SPLIT_NO_OPEN_TABS_TEXT).isVisible().catch(() => false)) {
    test.skip(true, "No open tabs to split — open a tab with items under POS → Bar & table tabs.");
  }

  await expect(page.getByTestId(BILL_SPLIT_PANEL_TESTID)).toBeVisible({ timeout: 15_000 });
}

export async function assertBillSplitModesVisible(page: Page): Promise<void> {
  for (const mode of BILL_SPLIT_MODES) {
    await expect(page.getByTestId(billSplitModeTestId(mode))).toBeVisible();
  }
}

export async function runBillSplitPanelSmokeFlow(page: Page): Promise<void> {
  await navigateToBillSplitPanel(page);
  await assertBillSplitModesVisible(page);
  await expect(page.getByTestId(billSplitModeTestId("equal"))).toBeVisible();
  await expect(page.getByTestId(billSplitModeTestId("item"))).toBeVisible();
}
