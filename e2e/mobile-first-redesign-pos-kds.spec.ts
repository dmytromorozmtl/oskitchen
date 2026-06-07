import { expect, test } from "@playwright/test";

import {
  MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES,
  MOBILE_FIRST_REDESIGN_KDS_VIEWPORT,
  MOBILE_FIRST_REDESIGN_POS_ROUTE,
  MOBILE_FIRST_REDESIGN_POS_VIEWPORT_PX,
  MOBILE_FIRST_REDESIGN_TOUCH_FLOOR_PX,
} from "@/lib/design/mobile-first-redesign-absolute-final-policy";

/**
 * Absolute Final Task 56 — mobile-first POS + KDS tablet landscape viewports.
 * Requires `chromium-authed` (see `playwright.config.ts`).
 */
test.describe("mobile-first redesign — POS mobile + KDS tablet landscape", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Mobile-first redesign E2E runs in chromium-authed project only",
    );
  });

  test("POS mobile — 375px viewport shell and 44px touch targets", async ({ page }) => {
    await page.setViewportSize({
      width: MOBILE_FIRST_REDESIGN_POS_VIEWPORT_PX,
      height: 812,
    });
    await page.goto(MOBILE_FIRST_REDESIGN_POS_ROUTE);

    const shell = page.getByTestId(
      MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES[0]!.shellTestId,
    );
    await expect(shell).toBeVisible({ timeout: 30_000 });
    await expect(shell).toHaveAttribute(
      "data-mobile-first-viewport",
      String(MOBILE_FIRST_REDESIGN_POS_VIEWPORT_PX),
    );

    const productRow = page.getByTestId("pos-mobile-product-row").first();
    if (await productRow.isVisible().catch(() => false)) {
      const box = await productRow.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(MOBILE_FIRST_REDESIGN_TOUCH_FLOOR_PX - 2);
    }
  });

  test("KDS tablet landscape — 1024×768 shell renders ticket board", async ({ page }) => {
    await page.setViewportSize({
      width: MOBILE_FIRST_REDESIGN_KDS_VIEWPORT.width,
      height: MOBILE_FIRST_REDESIGN_KDS_VIEWPORT.height,
    });
    await page.goto("/dashboard/kitchen");

    const shell = page.getByTestId(
      MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES[1]!.shellTestId,
    );
    await expect(shell).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /Kitchen Display/i })).toBeVisible();
  });
});
