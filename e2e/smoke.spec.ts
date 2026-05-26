import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("help center loads", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByText("Help center")).toBeVisible();
  });

  test("demo hub loads", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("auth gate", () => {
  test("dashboard redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
