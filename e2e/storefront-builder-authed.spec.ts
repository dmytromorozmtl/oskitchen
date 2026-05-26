import { expect, test } from "@playwright/test";

/**
 * Authenticated storefront builder flows (requires setup project + E2E_LOGIN_*).
 */
test.describe("Storefront builder (authed)", () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim(),
      "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD for dashboard builder E2E",
    );
  });

  test("navigation DnD and save navigation", async ({ page }) => {
    await page.goto("/dashboard/storefront/builder");
    await expect(page.getByRole("heading", { name: /storefront builder/i })).toBeVisible({ timeout: 60_000 });

    const dragHandles = page.getByRole("button", { name: /drag to reorder/i });
    const count = await dragHandles.count();
    test.skip(count < 2, "Need at least two nav items to test reorder");

    const box0 = await dragHandles.nth(0).boundingBox();
    const box1 = await dragHandles.nth(1).boundingBox();
    if (!box0 || !box1) test.skip();

    await page.mouse.move(box0.x + box0.width / 2, box0.y + box0.height / 2);
    await page.mouse.down();
    await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height + 32, { steps: 10 });
    await page.mouse.up();

    await page.getByRole("button", { name: /save navigation/i }).click();
    await expect(page.getByRole("button", { name: /save navigation/i })).toBeEnabled({ timeout: 20_000 });
  });

  test("theme preset compare panel visible", async ({ page }) => {
    await page.goto("/dashboard/storefront/theme");
    await expect(page.getByText(/compare before apply/i)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("button", { name: /apply preset/i })).toBeVisible();
  });

  test("page section reorder via down control", async ({ page }) => {
    await page.goto("/dashboard/storefront/pages");
    const editLink = page.locator('a[href*="/dashboard/storefront/pages/"]').first();
    test.skip((await editLink.count()) === 0, "No pages to edit");
    await editLink.click();
    await expect(page.getByRole("heading", { name: /edit page/i })).toBeVisible({ timeout: 30_000 });

    const downBtn = page.getByRole("button", { name: /^down$/i }).first();
    test.skip((await downBtn.count()) === 0, "Need sections with Down control");
    await downBtn.click();
  });
});
