import { expect, test } from "@playwright/test";

import {
  focusPosTerminalSurface,
  preparePosDesktopTerminal,
} from "@/e2e/helpers/pos-terminal-keyboard-navigation";
import { POS_TERMINAL_KEYBOARD_TEST_IDS } from "@/lib/pos/pos-terminal-keyboard-navigation-policy";

/**
 * Absolute Final Task 47 — keyboard navigation on desktop POS terminal.
 * Requires `chromium-authed` (see `playwright.config.ts`).
 */
test.describe("POS terminal keyboard navigation", () => {
  test.beforeEach(async ({ page }) => {
    await preparePosDesktopTerminal(page);
  });

  test("F1 focuses product search", async ({ page }) => {
    await focusPosTerminalSurface(page);
    await page.keyboard.press("F1");
    await expect(page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.productSearch)).toBeFocused();
  });

  test("F9 opens keyboard shortcuts overlay", async ({ page }) => {
    await focusPosTerminalSurface(page);
    await page.keyboard.press("F9");
    await expect(page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.shortcutsOverlay)).toBeVisible();
    await page.getByRole("button", { name: "Close shortcuts" }).click();
    await expect(page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.shortcutsOverlay)).toBeHidden();
  });

  test("F7 focuses customer search when CRM attach is enabled", async ({ page }) => {
    const customerQuery = page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.customerQuery);
    if ((await customerQuery.count()) === 0) {
      test.skip(true, "Customer attach disabled on this workspace.");
    }
    await focusPosTerminalSurface(page);
    await page.keyboard.press("F7");
    await expect(customerQuery).toBeFocused();
  });

  test("number key 1 quick-adds first visible product", async ({ page }) => {
    const firstTitle = (await page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.productTile).first().innerText())
      .split("\n")[0]
      ?.trim();
    if (!firstTitle) {
      test.skip(true, "Could not read first product tile title.");
    }

    await focusPosTerminalSurface(page);
    await page.keyboard.press("1");
    await expect(page.getByText("Cart is empty")).toBeHidden();
    await expect(page.getByText(firstTitle!, { exact: false })).toBeVisible();
  });

  test("+ increments last cart line quantity", async ({ page }) => {
    const firstTitle = (await page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.productTile).first().innerText())
      .split("\n")[0]
      ?.trim();
    if (!firstTitle) {
      test.skip(true, "Could not read first product tile title.");
    }

    await focusPosTerminalSurface(page);
    await page.keyboard.press("1");
    await expect(page.getByText("Cart is empty")).toBeHidden();

    const cartLine = page.locator("div.rounded-xl.border").filter({ hasText: firstTitle! });
    await expect(cartLine.locator("span.font-semibold")).toHaveText("1");
    await page.keyboard.press("+");
    await expect(cartLine.locator("span.font-semibold")).toHaveText("2");
  });

  test("Escape clears cart after quick-add", async ({ page }) => {
    await focusPosTerminalSurface(page);
    await page.keyboard.press("1");
    await expect(page.getByText("Cart is empty")).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Cart is empty")).toBeVisible();
  });

  test("F3 selects cash payment mode", async ({ page }) => {
    await focusPosTerminalSurface(page);
    await page.keyboard.press("F3");
    await expect(page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.paymentPanel)).toContainText(/cash/i);
  });

  test("Tab moves focus forward from product search", async ({ page }) => {
    await page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.productSearch).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.productSearch)).not.toBeFocused();
  });
});
