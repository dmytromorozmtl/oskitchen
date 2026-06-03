import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("benchmark premium", () => {
  test("premium page shows reports and subscribe CTA", async ({ page }) => {
    await page.goto("/dashboard/analytics/benchmarks/premium");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Benchmark Network 2\.0/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("benchmark-premium-panel")).toBeVisible();
    await expect(page.getByTestId("benchmark-premium-trial")).toBeVisible();
  });

  test("free benchmarks link to premium", async ({ page }) => {
    await page.goto("/dashboard/analytics/benchmarks");
    await skipIfLoginRedirect(page);
    await expect(page.getByTestId("benchmark-premium-link")).toBeVisible({ timeout: 15_000 });
  });
});
