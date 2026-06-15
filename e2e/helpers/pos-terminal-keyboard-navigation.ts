import { test, type Page } from "@playwright/test";

import { POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE } from "@/lib/pos/pos-terminal-keyboard-navigation-policy";

export async function preparePosDesktopTerminal(page: Page): Promise<void> {
  await page.goto(POS_TERMINAL_KEYBOARD_NAVIGATION_ROUTE);

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

  await page.getByTestId("pos-product-search").waitFor({ state: "visible", timeout: 15_000 });
}

/** Blur inputs so number-key shortcuts are not suppressed. */
export async function focusPosTerminalSurface(page: Page): Promise<void> {
  await page.locator("body").click({ position: { x: 8, y: 8 } });
}
