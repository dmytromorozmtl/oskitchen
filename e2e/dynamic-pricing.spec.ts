import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

test.describe("dynamic pricing", () => {
  test("page shows panel and toggle", async ({ page }) => {
    await page.goto("/dashboard/menu/dynamic-pricing");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /AI-powered dynamic pricing/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("dynamic-pricing-panel")).toBeVisible();
    await expect(page.getByTestId("dynamic-pricing-toggle")).toBeVisible();
  });

  test("API returns dashboard shape", async ({ page }) => {
    await page.goto("/dashboard/today");
    await skipIfLoginRedirect(page);
    const res = await page.request.get("/api/ai/dynamic-pricing");
    if (res.status() === 401) {
      test.skip(true, "API requires auth cookie");
    }
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      suggestions: unknown[];
      summary: { itemsScanned: number };
      honestyNote: string;
    };
    expect(Array.isArray(json.suggestions)).toBe(true);
    expect(typeof json.summary.itemsScanned).toBe("number");
    expect(json.honestyNote.length).toBeGreaterThan(10);
  });
});
