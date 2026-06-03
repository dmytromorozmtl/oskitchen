import { expect, test, type Page } from "@playwright/test";

import {
  POS_SHIFTS_PATH,
  POS_SHIFT_CLOSE_FORM_TEST_ID,
  POS_SHIFT_CLOSE_HISTORY_TEST_ID,
  POS_SHIFT_CLOSE_SUBMIT_TEST_ID,
  posShiftHistoryRowTestId,
} from "@/lib/pos/pos-checkout-shift-report-e2e-policy";

export async function preparePosTerminal(page: Page): Promise<void> {
  await page.goto("/dashboard/pos/terminal");

  if (await page.getByRole("link", { name: /add register/i }).isVisible().catch(() => false)) {
    test.skip(true, "No POS register — add one under POS → Registers.");
  }
  if (await page.getByRole("link", { name: /open staff/i }).isVisible().catch(() => false)) {
    test.skip(true, "No active staff — add under Staff.");
  }

  const tile = page.getByTestId("pos-product-tile").first();
  if ((await tile.count()) === 0) {
    test.skip(true, "No POS-visible products — enable posVisible on menu items or seed catalog.");
  }
}

export async function completePosCashSale(page: Page): Promise<void> {
  await page.getByTestId("pos-product-tile").first().click();
  await page.getByTestId("pos-complete-sale").click();

  const status = page.getByTestId("pos-checkout-status");
  await expect(status).toBeVisible({ timeout: 60_000 });
  await expect(status).toContainText(/sale complete|not available on your current plan|POS is not available/i, {
    timeout: 60_000,
  });

  const text = (await status.textContent()) ?? "";
  if (/not available on your current plan|POS is not available/i.test(text)) {
    test.skip(true, "POS terminal not entitled on this workspace plan.");
  }
  if (!/sale complete/i.test(text)) {
    throw new Error(`Expected cash sale completion, got: ${text.slice(0, 240)}`);
  }
}

export async function ensureOpenShift(page: Page): Promise<string> {
  await page.goto(POS_SHIFTS_PATH);
  await expect(page.getByRole("heading", { name: /^POS shifts$/i })).toBeVisible({ timeout: 15_000 });

  const permissionDenied = page.getByText(/do not have permission|access restricted/i);
  if (await permissionDenied.isVisible().catch(() => false)) {
    test.skip(true, "E2E user lacks pos.shift.open or pos.shift.close permissions.");
  }

  const shiftSelect = page.getByTestId("pos-shift-close-select");
  if (await shiftSelect.isVisible().catch(() => false)) {
    const shiftId = await shiftSelect.inputValue();
    if (shiftId) return shiftId;
  }

  const openButton = page.getByRole("button", { name: /^open shift$/i });
  if (!(await openButton.isVisible().catch(() => false))) {
    test.skip(true, "Shift tracking unavailable — Team plan pos_shifts feature required.");
  }

  const registerSelect = page.locator("#registerId");
  if ((await registerSelect.locator("option").count()) === 0) {
    test.skip(true, "No POS register — add one under POS → Registers.");
  }

  await openButton.click();
  await page.waitForURL(/\/dashboard\/pos\/shifts/, { timeout: 30_000 });

  await expect(page.getByTestId("pos-shift-close-select")).toBeVisible({ timeout: 15_000 });
  const shiftId = await page.getByTestId("pos-shift-close-select").inputValue();
  if (!shiftId) {
    test.skip(true, "Could not open shift — register or staff prerequisites missing.");
  }
  return shiftId;
}

export async function closeShiftWithExpectedCash(page: Page, shiftId: string): Promise<void> {
  await page.goto(POS_SHIFTS_PATH);
  await expect(page.getByTestId(POS_SHIFT_CLOSE_FORM_TEST_ID)).toBeVisible({ timeout: 15_000 });

  const shiftSelect = page.getByTestId("pos-shift-close-select");
  await shiftSelect.selectOption(shiftId);

  const useExpected = page.getByTestId("pos-shift-use-expected-cash");
  if (await useExpected.isVisible().catch(() => false)) {
    await useExpected.click();
  } else {
    const preview = page.getByTestId("pos-shift-closeout-preview");
    await expect(preview).toBeVisible();
  }

  await page.getByTestId(POS_SHIFT_CLOSE_SUBMIT_TEST_ID).click();
  await page.waitForURL(/\/dashboard\/pos\/shifts/, { timeout: 30_000 });
}

export async function assertClosedShiftReport(page: Page, shiftId: string): Promise<void> {
  await page.goto(POS_SHIFTS_PATH);
  await expect(page.getByTestId(POS_SHIFT_CLOSE_HISTORY_TEST_ID)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId(posShiftHistoryRowTestId(shiftId))).toBeVisible({ timeout: 15_000 });
}
