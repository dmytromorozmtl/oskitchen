import { test, expect } from "@playwright/test";

test.describe("ghost kitchen vertical", () => {
  test.skip(!process.env.E2E_SESSION_COOKIE, "Set E2E_SESSION_COOKIE for authed vertical flows");

  test("brands command center reachable", async ({ page }) => {
    await page.goto("/dashboard/brands/command-center");
    await expect(page.locator("body")).toContainText(/brand/i);
  });
});
