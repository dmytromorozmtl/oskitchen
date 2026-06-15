import { test, expect } from "@playwright/test";

/**
 * Lightweight CI smoke — no auth secrets required.
 * Run: `npx playwright test e2e/smoke.spec.ts e2e/ci-smoke.spec.ts`
 */
test.describe("CI smoke extensions", () => {
  test("storefront slug path responds (404 or 200)", async ({ page }) => {
    const slug = process.env.E2E_STOREFRONT_SLUG?.trim() || "demo";
    const res = await page.goto(`/s/${slug}`);
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("platform redirects unauthenticated users", async ({ page }) => {
    await page.goto("/platform/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
