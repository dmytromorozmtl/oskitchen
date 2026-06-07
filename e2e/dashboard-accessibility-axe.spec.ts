import { expect, test, type Page } from "@playwright/test";

import { analyzeSeriousA11yViolations } from "@/lib/accessibility/axe-playwright-analyze";
import { E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES } from "@/lib/accessibility/e2e-accessibility-axe-policy";

/**
 * Absolute Final Task 46 — axe-core WCAG 2.1 AA gate on 10 authed dashboard pages.
 * Runs in `chromium-authed` (session from `e2e/auth.setup.ts`).
 */
async function expectDashboardSurfaceReady(page: Page) {
  await expect(page.locator("body")).not.toContainText(/Something went wrong/i);
  await expect(page.locator("body")).not.toContainText(
    /An error occurred in the Server Components render/i,
  );
}

test.describe("accessibility — dashboard axe-core (10 pages)", () => {
  for (const path of E2E_ACCESSIBILITY_AXE_DASHBOARD_ROUTES) {
    test(`axe: ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");
      await expectDashboardSurfaceReady(page);

      const serious = await analyzeSeriousA11yViolations(page);
      if (serious.length > 0) {
        console.log(JSON.stringify(serious, null, 2));
      }

      expect(serious, `a11y violations on ${path}`).toEqual([]);
    });
  }
});
