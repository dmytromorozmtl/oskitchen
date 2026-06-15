import { expect, test, type Page } from "@playwright/test";

/**
 * Authenticated smoke (runs in `chromium-authed` project only — see `playwright.config.ts`).
 *
 * Prerequisites: running app (`npm run dev` or `npm run start`), DB, and
 * `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` in the environment or in `.env` / `.env.local`
 * (loaded automatically when Playwright reads `playwright.config.ts`).
 *
 * Session is created once in `e2e/auth.setup.ts` and reused via `storageState`.
 *
 * @see docs/TESTING.md
 */
async function expectNoCriticalDashboardError(page: Page) {
  await expect(page.locator("body")).not.toContainText(/Something went wrong/i);
  await expect(page.locator("body")).not.toContainText(
    /An error occurred in the Server Components render/i,
  );
  await expect(page.locator("body")).not.toContainText(/POS terminal unavailable/i);
}

test.describe("dashboard authenticated smoke", () => {
  test("dashboard home shows today overview", async ({ page }) => {
    await page.goto("/dashboard");
    await expectNoCriticalDashboardError(page);
    await expect(page.getByRole("heading", { name: /Today in / })).toBeVisible();
  });

  test("order hub loads for signed-in user", async ({ page }) => {
    await page.goto("/dashboard/order-hub");
    await expectNoCriticalDashboardError(page);
    await expect(page.getByRole("heading", { name: /^Order hub$/i })).toBeVisible();
  });

  test("product mapping activity loads", async ({ page }) => {
    await page.goto("/dashboard/product-mapping/activity");
    await expectNoCriticalDashboardError(page);
    await expect(page.getByRole("heading", { name: /^Activity$/i })).toBeVisible();
  });

  test("billing surface loads without RSC errors", async ({ page }) => {
    await page.goto("/dashboard/billing");
    await expectNoCriticalDashboardError(page);
    await expect(page.getByRole("heading", { name: /^Billing$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Upgrade plan/i })).toBeVisible();
  });

  test("menu center loads without workspace regressions", async ({ page }) => {
    await page.goto("/dashboard/menus");
    await expectNoCriticalDashboardError(page);
    await expect(page.getByRole("link", { name: /^New menu$/i })).toBeVisible();
  });

  test("POS terminal surface loads", async ({ page }) => {
    await page.goto("/dashboard/pos/terminal");
    await expectNoCriticalDashboardError(page);
    await expect(page.getByRole("heading", { name: /^POS Terminal$/i })).toBeVisible();
  });
});
