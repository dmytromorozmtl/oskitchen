import { expect, test } from "@playwright/test";

test.describe("Platform access", () => {
  test("unauthenticated visitor cannot stay on /platform (redirected to login)", async ({ page }) => {
    await page.goto("/platform", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
  });

  test("regular tenant user cannot access /platform when logged in", async ({ page }) => {
    const email = process.env.E2E_LOGIN_EMAIL;
    const password = process.env.E2E_LOGIN_PASSWORD;
    test.skip(!email || !password, "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD for authenticated denial test");

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 });

    await page.goto("/platform", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/^\/platform\/?$/);
  });
});
