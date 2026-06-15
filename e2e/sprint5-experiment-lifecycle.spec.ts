import { expect, test } from "@playwright/test";

const THEME_ARM_COOKIE = "kos_ab_theme";

/**
 * Sprint 5 — experiment lifecycle (authed owner via `storefront-authed` project).
 *
 * Requires in .env or shell:
 *   E2E_LOGIN_EMAIL, E2E_LOGIN_PASSWORD
 *   E2E_STORE_SLUG (optional, for cookie test)
 *
 * Run:
 *   E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... npm run test:e2e:sprint5-lifecycle
 */
test.describe("Sprint 5 experiment lifecycle", () => {
  test("advanced shows edge sync job history table", async ({ page }) => {
    await page.goto("/dashboard/storefront/advanced");
    await expect(page.getByText("Edge sync job history")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });

  test("storefront clears experiment cookie when experiment disabled", async ({ page, context }) => {
    const slug = process.env.E2E_STORE_SLUG?.trim();
    test.skip(!slug, "Set E2E_STORE_SLUG");

    await page.goto(`/s/${slug}/menu`);
    await page.waitForLoadState("networkidle");

    const hadArm = (await context.cookies()).some((c) => c.name === THEME_ARM_COOKIE);
    test.skip(!hadArm, "Experiment not active — enable on Advanced first");

    await page.goto("/dashboard/storefront/advanced");
    const enableCheckbox = page.getByRole("checkbox", { name: /enable experiment/i });
    if (await enableCheckbox.isChecked()) {
      await enableCheckbox.uncheck();
      await page.getByRole("button", { name: /save experiment/i }).click();
      await page.waitForTimeout(1500);
    }

    await page.goto(`/s/${slug}/menu`);
    await page.waitForLoadState("networkidle");
    const cookies = await context.cookies();
    const armAfter = cookies.find((c) => c.name === THEME_ARM_COOKIE)?.value;
    expect(armAfter === undefined || armAfter === "").toBeTruthy();
  });
});
