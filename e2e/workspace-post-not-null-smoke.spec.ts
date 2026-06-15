import { expect, test } from "@playwright/test";

/**
 * Post-NOT NULL + workspace-only scope smoke (authenticated).
 * Maps to docs/SMOKE_POST_NOT_NULL_CHECKLIST.md items 1–6.
 *
 * Requires E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD and running app (see e2e/auth.setup.ts).
 */
test.describe("workspace post-NOT NULL smoke", () => {
  test("today command center loads with KPIs", async ({ page }) => {
    await page.goto("/dashboard/today");
    const todayHeading = page.getByRole("heading", { name: /Today in /i });
    const commandCenterHeading = page.getByRole("heading", { name: /^Today$/i });
    await expect(todayHeading.or(commandCenterHeading).first()).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/access restricted|forbidden/i)).not.toBeVisible();
  });

  test("orders list loads", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page).toHaveURL(/\/dashboard\/orders/);
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/access restricted|forbidden/i)).not.toBeVisible();
  });

  test("orders detail route responds when list has rows", async ({ page }) => {
    await page.goto("/dashboard/orders");
    const firstOrderLink = page.locator('a[href^="/dashboard/orders/"]').first();
    const hasOrder = await firstOrderLink.isVisible().catch(() => false);
    if (!hasOrder) {
      test.skip(true, "No orders in workspace — seed data or create one order for full smoke");
      return;
    }
    await firstOrderLink.click();
    await expect(page).toHaveURL(/\/dashboard\/orders\/.+/);
    await expect(page.getByText(/access restricted|forbidden/i)).not.toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("menu center loads", async ({ page }) => {
    await page.goto("/dashboard/menus");
    await expect(page).toHaveURL(/\/dashboard\/menus/);
    await expect(page.getByRole("heading", { name: /menus/i }).first()).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText(/access restricted|forbidden/i)).not.toBeVisible();
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test("POS terminal loads", async ({ page }) => {
    await page.goto("/dashboard/pos/terminal");
    await expect(page.getByRole("heading", { name: /^POS Terminal$/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/access restricted|forbidden/i)).not.toBeVisible();
  });
});

test.describe("storefront public smoke", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("storefront slug responds without 5xx", async ({ page }) => {
    const slug = process.env.E2E_STOREFRONT_SLUG?.trim() || "demo";
    const res = await page.goto(`/s/${slug}`);
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
});
