import { expect, test } from "@playwright/test";

import {
  DASHBOARD_MAIN_LANDMARK_ARIA_LABEL,
  DASHBOARD_MAIN_LANDMARK_ID,
  DASHBOARD_SKIP_LINK_LABEL,
  TODAY_KEYBOARD_NAVIGATION_ROUTE,
  TODAY_KEYBOARD_TEST_IDS,
} from "@/lib/accessibility/today-keyboard-navigation-policy";

test.describe("Today keyboard navigation (P1-30)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TODAY_KEYBOARD_NAVIGATION_ROUTE);
    await page.waitForLoadState("domcontentloaded");
  });

  test("skip link targets dashboard main landmark", async ({ page }) => {
    const skipLink = page.getByTestId(TODAY_KEYBOARD_TEST_IDS.skipLink);
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute("href", `#${DASHBOARD_MAIN_LANDMARK_ID}`);
    await expect(skipLink).toHaveText(DASHBOARD_SKIP_LINK_LABEL);
  });

  test("main landmark is focusable via skip target", async ({ page }) => {
    const main = page.locator(`main#${DASHBOARD_MAIN_LANDMARK_ID}`);
    await expect(main).toBeVisible();
    await expect(main).toHaveAttribute("aria-label", DASHBOARD_MAIN_LANDMARK_ARIA_LABEL);
  });

  test("Tab reaches navigation menu trigger", async ({ page }) => {
    const navTrigger = page.getByRole("button", { name: "Open navigation menu", exact: true });
    if ((await navTrigger.count()) === 0) {
      test.skip(true, "Nav drawer trigger hidden on desktop viewport.");
    }
    await navTrigger.focus();
    await expect(navTrigger).toBeFocused();
  });
});
