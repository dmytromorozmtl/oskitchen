import { expect, test } from "@playwright/test";

test.describe("public pricing self-serve", () => {
  test("shows four transparent plans with published prices", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("heading", { name: /plans that match real kitchens/i })).toBeVisible();
    await expect(page.getByTestId("pricing-plan-starter")).toContainText("$49");
    await expect(page.getByTestId("pricing-plan-pro")).toContainText("$79");
    await expect(page.getByTestId("pricing-plan-team")).toContainText("$199");
    await expect(page.getByTestId("pricing-plan-enterprise")).toContainText("$499");
  });

  test("self-serve CTAs link to signup with plan param", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByTestId("pricing-cta-starter")).toHaveAttribute("href", "/signup?plan=STARTER");
    await expect(page.getByTestId("pricing-cta-pro")).toHaveAttribute("href", "/signup?plan=PRO");
    await expect(page.getByTestId("pricing-cta-team")).toHaveAttribute("href", "/signup?plan=TEAM");
    await expect(page.getByTestId("pricing-cta-enterprise")).toHaveAttribute("href", "/book-demo");
  });

  test("shows universal trial benefits, compare table, and processing-fee FAQ", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByTestId("pricing-universal-benefits")).toBeVisible();
    await expect(page.getByText(/no credit card required/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /feature comparison/i })).toBeVisible();
    await expect(page.getByText(/what's not included/i)).toBeVisible();
    await expect(page.getByText(/most popular/i)).toBeVisible();
  });

  test("signup page reflects selected plan from pricing CTA", async ({ page }) => {
    await page.goto("/signup?plan=PRO");

    await expect(page.getByTestId("signup-selected-plan")).toContainText(/pro/i);
    await expect(page.getByTestId("signup-selected-plan")).toContainText(/\$79/);
  });
});
