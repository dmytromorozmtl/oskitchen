import { test, expect } from "@playwright/test";

test.describe("help center order hub", () => {
  test("order hub help article loads", async ({ page }) => {
    await page.goto("/help/order-hub");
    await expect(page.getByRole("heading", { name: "Order Hub" })).toBeVisible();
    await expect(page.getByText(/unified queue/i)).toBeVisible();
  });
});
