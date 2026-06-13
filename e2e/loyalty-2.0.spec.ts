import { expect, test } from "@playwright/test";

test.describe("loyalty 2.0", () => {
  test("program builder page renders when authed", async ({ page }) => {
    await page.goto("/dashboard/loyalty/program-builder");
    await expect(
      page.getByRole("heading", { name: /loyalty 2\.0 program builder/i }),
    ).toBeVisible();
    await expect(page.getByText(/silver/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /preview earn/i })).toBeVisible();
  });
});
