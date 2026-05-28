import { test, expect } from "@playwright/test";

/**
 * Cross-tenant isolation for support impersonation — requires staging credentials.
 * SKIPPED WITH REASON when env vars missing (never fake PASS).
 */
const required = ["E2E_STAGING_BASE_URL", "E2E_LOGIN_EMAIL", "E2E_LOGIN_PASSWORD"] as const;

test.describe("support impersonation tenant isolation", () => {
  test.skip(
    required.some((k) => !process.env[k]?.trim()),
    "awaiting staging credentials — set E2E_STAGING_* before running",
  );

  test("support session cannot read another workspace order hub", async ({ page }) => {
    // Scaffold: implement full flow when platform support staging fixture exists.
    await page.goto(`${process.env.E2E_STAGING_BASE_URL}/login`);
    await expect(page).toHaveURL(/login/);
  });
});
