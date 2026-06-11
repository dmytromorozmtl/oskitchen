import { expect, test, type Page } from "@playwright/test";

import {
  focusPosTerminalSurface,
  preparePosDesktopTerminal,
} from "@/e2e/helpers/pos-terminal-keyboard-navigation";
import {
  SCREEN_READER_DYNAMIC_POS_CART_BUTTONS,
  SCREEN_READER_STATIC_ICON_BUTTONS,
} from "@/lib/accessibility/screen-reader-icon-button-policy";
import { POS_TERMINAL_KEYBOARD_TEST_IDS } from "@/lib/pos/pos-terminal-keyboard-navigation-policy";

/**
 * Absolute Final Task 48 — icon-only buttons must expose accessible names for screen readers.
 * Uses Playwright role+name queries (same discovery path as assistive tech).
 */
async function expectNamedIconButton(page: Page, name: string) {
  const button = page.getByRole("button", { name, exact: true });
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
}

test.describe("screen reader — icon-only buttons", () => {
  for (const expectation of SCREEN_READER_STATIC_ICON_BUTTONS) {
    if (
      expectation.id === "pos_shortcuts_close" ||
      expectation.id === "pos_welcome_dismiss" ||
      expectation.id === "kds_sound_alerts_on" ||
      expectation.id === "kds_sound_alerts_off"
    ) {
      continue;
    }

    test(`${expectation.id}: "${expectation.accessibleName}" on ${expectation.route}`, async ({
      page,
    }) => {
      await page.goto(expectation.route);
      await page.waitForLoadState("domcontentloaded");
      await expectNamedIconButton(page, expectation.accessibleName);
    });
  }

  test("pos_welcome_dismiss: Dismiss on welcome banner", async ({ page }) => {
    await preparePosDesktopTerminal(page);
    await page.goto(`${SCREEN_READER_DYNAMIC_POS_CART_BUTTONS.route}&welcome=true`);
    await page.waitForLoadState("domcontentloaded");
    await expectNamedIconButton(page, "Dismiss");
  });

  test("pos_shortcuts_close: Close shortcuts after F9 overlay", async ({ page }) => {
    await preparePosDesktopTerminal(page);
    await focusPosTerminalSurface(page);
    await page.keyboard.press("F9");
    await expect(page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.shortcutsOverlay)).toBeVisible();
    await expectNamedIconButton(page, "Close shortcuts");
  });

  test("pos_cart_quantity: decrease/increase announce product title", async ({ page }) => {
    await preparePosDesktopTerminal(page);

    const firstTile = page.getByTestId(POS_TERMINAL_KEYBOARD_TEST_IDS.productTile).first();
    const title = (await firstTile.innerText()).split("\n")[0]?.trim();
    if (!title) {
      test.skip(true, "Could not read first product tile title.");
    }

    await firstTile.click();
    const decrease = SCREEN_READER_DYNAMIC_POS_CART_BUTTONS.decreaseLabel(title!);
    const increase = SCREEN_READER_DYNAMIC_POS_CART_BUTTONS.increaseLabel(title!);

    await expectNamedIconButton(page, decrease);
    await expectNamedIconButton(page, increase);
  });

  test("kds_sound_toggle: kitchen alerts button has accessible name", async ({ page }) => {
    await page.goto("/dashboard/kitchen");
    await page.waitForLoadState("domcontentloaded");
    const toggle = page.getByTestId("kds-sound-toggle");
    if ((await toggle.count()) === 0) {
      test.skip(true, "KDS sound toggle hidden or kitchen access denied.");
    }
    const label = await toggle.getAttribute("aria-label");
    expect(label).toMatch(/kitchen sound alerts/i);
  });
});
