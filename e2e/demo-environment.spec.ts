import { expect, test } from "@playwright/test";

/**
 * Guest demo environment — requires SUPABASE_SERVICE_ROLE_KEY and running app.
 * Skips in CI when demo mutations are blocked (production without DEMO_MODE_ENABLED).
 */
test.describe("demo environment", () => {
  test("demo landing shows launch hero", async ({ page }) => {
    await page.goto("/demo");
    await expect(
      page.getByRole("heading", { name: /see os kitchen in action/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /launch demo/i }).first()).toBeVisible();
    await expect(page.getByText(/no signup/i).first()).toBeVisible();
  });

  test("launch demo redirects through auth when service role available", async ({ page }) => {
    test.skip(
      !process.env.SUPABASE_SERVICE_ROLE_KEY,
      "SUPABASE_SERVICE_ROLE_KEY required for guest demo launch",
    );

    await page.goto("/demo");
    const launch = page.getByRole("button", { name: /^launch demo$/i }).first();
    await launch.click();

    await page.waitForURL(
      (url) =>
        url.pathname.includes("/dashboard") ||
        url.pathname.includes("/auth/callback") ||
        url.hostname.includes("supabase"),
      { timeout: 120_000 },
    );

    if (page.url().includes("/dashboard")) {
      await expect(page.getByText(/free demo workspace|upgrade to real account/i).first()).toBeVisible({
        timeout: 60_000,
      });
      await page.goto("/dashboard/order-hub");
      await expect(page.getByRole("heading", { name: /^order hub$/i })).toBeVisible({
        timeout: 30_000,
      });
    }
  });

  test("demo expired page offers upgrade", async ({ page }) => {
    await page.goto("/demo/expired");
    await expect(page.getByRole("heading", { name: /demo session ended/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /upgrade to real account/i })).toBeVisible();
  });
});
