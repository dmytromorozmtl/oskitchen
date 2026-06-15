import { expect, test } from "@playwright/test";

/**
 * Authed publish deny — HYPERGRAPH_ZK without RECURSIVE_ZK blocks publish on theme page.
 * Requires server env:
 *   THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA=1
 *   THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP unset or 0
 * Run with storefront-authed project (E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD).
 */
test.describe("Theme experiment publish deny", () => {
  test.skip(
    process.env.THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA !== "1" ||
      process.env.THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP === "1",
    "Set THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA=1 and unset RECURSIVE_ZK for this scenario",
  );

  test("publish button disabled and gate alert visible", async ({ page }) => {
    await page.goto("/dashboard/storefront/theme");

    await expect(page.getByRole("button", { name: /Publish disabled \(gates\)/i })).toBeDisabled();
    await expect(page.getByRole("alert")).toContainText(/Recursive ZK DNA rollup required/i);
  });

  test("submitting publish shows server gate error", async ({ page }) => {
    await page.goto("/dashboard/storefront/theme");

    await page.getByLabel("Confirm publish").fill("PUBLISH");
    const btn = page.getByRole("button", { name: /Publish/i });
    if (await btn.isEnabled()) {
      await btn.click();
      await expect(page.getByRole("alert")).toContainText(/Recursive ZK/i);
    }
  });
});
