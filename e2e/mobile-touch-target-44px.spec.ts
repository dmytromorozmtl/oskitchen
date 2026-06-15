import { expect, test, type Page } from "@playwright/test";

import { preparePosDesktopTerminal } from "@/e2e/helpers/pos-terminal-keyboard-navigation";
import { expectLocatorMeetsTouchTargetFloor } from "@/e2e/helpers/touch-target-assertions";
import {
  MOBILE_TOUCH_TARGET_DASHBOARD_SURFACES,
  MOBILE_TOUCH_TARGET_FLOOR_PX,
  MOBILE_TOUCH_TARGET_POS_SURFACES,
  MOBILE_TOUCH_TARGET_VIEWPORT,
} from "@/lib/accessibility/mobile-touch-target-44px-policy";
import {
  posTerminalDecreaseQuantityLabel,
  posTerminalIncreaseQuantityLabel,
} from "@/lib/pos/pos-terminal-icon-button-labels";

/**
 * Absolute Final Task 49 — validate interactive targets meet 44×44 CSS px at 375px viewport.
 */
function resolveSurfaceLocator(
  page: Page,
  surface: (typeof MOBILE_TOUCH_TARGET_DASHBOARD_SURFACES)[number],
) {
  if (surface.kind === "testid" && surface.testId) {
    return page.getByTestId(surface.testId);
  }
  return page.getByRole(surface.role ?? "button", { name: surface.name, exact: true });
}

test.describe("mobile touch targets — 44px floor", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_TOUCH_TARGET_VIEWPORT);
  });

  for (const surface of MOBILE_TOUCH_TARGET_DASHBOARD_SURFACES) {
    test(`${surface.id} on ${surface.route}`, async ({ page }) => {
      await page.goto(surface.route);
      await page.waitForLoadState("domcontentloaded");
      await expectLocatorMeetsTouchTargetFloor(resolveSurfaceLocator(page, surface), {
        label: surface.id,
        floorPx: MOBILE_TOUCH_TARGET_FLOOR_PX,
      });
    });
  }

  for (const surface of MOBILE_TOUCH_TARGET_POS_SURFACES) {
    test(`${surface.id} on POS terminal`, async ({ page }) => {
      await preparePosDesktopTerminal(page);
      const locator =
        surface.kind === "testid" && surface.testId
          ? page.getByTestId(surface.testId)
          : page.getByRole(surface.role ?? "button", { name: surface.name, exact: true });

      if (surface.id === "pos_complete_sale") {
        await page.getByTestId("pos-product-tile").first().click();
      }

      await expect(locator.first()).toBeVisible();
      await expectLocatorMeetsTouchTargetFloor(locator, {
        label: surface.id,
        floorPx: MOBILE_TOUCH_TARGET_FLOOR_PX,
      });
    });
  }

  test("pos_cart_quantity_controls meet 44px after add", async ({ page }) => {
    await preparePosDesktopTerminal(page);
    const firstTile = page.getByTestId("pos-product-tile").first();
    const title = (await firstTile.innerText()).split("\n")[0]?.trim();
    if (!title) {
      test.skip(true, "Could not read first product tile title.");
    }

    await firstTile.click();
    await expectLocatorMeetsTouchTargetFloor(
      page.getByRole("button", { name: posTerminalDecreaseQuantityLabel(title!), exact: true }),
      { label: "pos_cart_decrease", floorPx: MOBILE_TOUCH_TARGET_FLOOR_PX },
    );
    await expectLocatorMeetsTouchTargetFloor(
      page.getByRole("button", { name: posTerminalIncreaseQuantityLabel(title!), exact: true }),
      { label: "pos_cart_increase", floorPx: MOBILE_TOUCH_TARGET_FLOOR_PX },
    );
  });
});
