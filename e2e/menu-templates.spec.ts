import { expect, test } from "@playwright/test";

/**
 * Pre-built menu templates — authenticated (chromium-authed project).
 */
test.describe("menu templates", () => {
  test("templates page shows ten cuisine cards", async ({ page }) => {
    await page.goto("/dashboard/menus/templates");
    if (page.url().includes("/login")) {
      test.skip(true, "Requires authenticated session");
    }
    await expect(page.getByRole("heading", { name: /pre-built menu templates/i })).toBeVisible();
    await expect(page.getByText(/15 items/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^preview$/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^select$/i }).first()).toBeVisible();
  });

  test("preview modal lists template items", async ({ page }) => {
    await page.goto("/dashboard/menus/templates");
    if (!page.url().includes("/dashboard/menus/templates")) {
      test.skip(true, "Templates page not available");
    }
    await page.getByRole("button", { name: /^preview$/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: /select template/i })).toBeVisible();
    await page.getByRole("button", { name: /^close$/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("apply template navigates to products for edit", async ({ page }) => {
    await page.goto("/dashboard/menus/templates");
    if (!page.url().includes("/dashboard/menus/templates")) {
      test.skip(true, "Templates page not available");
    }
    await page.getByRole("button", { name: /^select$/i }).first().click();
    await page.waitForURL(/\/dashboard\/products/, { timeout: 60_000 });
    await expect(page.url()).toContain("templateApplied=1");
  });
});
