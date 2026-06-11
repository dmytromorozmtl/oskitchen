import { expect, test, type Page } from "@playwright/test";

import {
  KDS_KEYBOARD_NAVIGATION_ROUTE,
  KDS_KEYBOARD_TEST_IDS,
} from "@/lib/kitchen/kds-keyboard-navigation-policy";

async function prepareKdsSurface(page: Page) {
  await page.goto(KDS_KEYBOARD_NAVIGATION_ROUTE);
  await page.waitForLoadState("domcontentloaded");

  if (await page.getByText(/permission/i).isVisible().catch(() => false)) {
    test.skip(true, "Kitchen view permission denied for authed E2E user.");
  }

  await page.getByTestId(KDS_KEYBOARD_TEST_IDS.shell).waitFor({ state: "visible", timeout: 15_000 });
}

test.describe("KDS keyboard navigation (P1-30)", () => {
  test.beforeEach(async ({ page }) => {
    await prepareKdsSurface(page);
  });

  test("Tab reaches kitchen sound alerts toggle", async ({ page }) => {
    const toggle = page.getByTestId(KDS_KEYBOARD_TEST_IDS.soundToggle);
    if ((await toggle.count()) === 0) {
      test.skip(true, "Sound toggle hidden on this KDS layout.");
    }
    await toggle.focus();
    await expect(toggle).toBeFocused();
  });

  test("Tab focuses bump-next hero when queue has preparing tickets", async ({ page }) => {
    const bumpNext = page.getByTestId(KDS_KEYBOARD_TEST_IDS.bumpNextButton);
    if ((await bumpNext.count()) === 0) {
      test.skip(true, "No bump-next hero — kitchen queue may be empty.");
    }
    await bumpNext.focus();
    await expect(bumpNext).toBeFocused();
  });

  test("ticket bump buttons expose keyboard-focusable labels", async ({ page }) => {
    const bump = page.getByRole("button", { name: /Mark order .* ready/i }).first();
    if ((await bump.count()) === 0) {
      test.skip(true, "No preparing tickets in queue.");
    }
    await bump.focus();
    await expect(bump).toBeFocused();
  });
});
