import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test.describe("real-time profit dashboard", () => {
  test("profit page loads mobile layout", async ({ page }) => {
    await page.goto("/dashboard/today/profit");
    if (page.url().includes("/login")) {
      test.skip(true, "Requires authenticated session");
    }
    await expect(page.getByTestId("real-time-profit-dashboard")).toBeVisible();
    await expect(page.getByTestId("profit-total")).toBeVisible();
    await expect(page.getByTestId("profit-margin-gauge")).toBeVisible();
    await expect(page.getByTestId("profit-hourly-chart")).toBeVisible();
  });

  test("profit API returns snapshot shape", async ({ page }) => {
    await page.goto("/dashboard/today");
    if (page.url().includes("/login")) {
      test.skip(true, "Requires authenticated session");
    }
    const res = await page.request.get("/api/analytics/real-time-profit");
    if (res.status() === 401) {
      test.skip(true, "API requires auth cookie");
    }
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { marginPercent: number; refreshSeconds: number };
    expect(typeof json.marginPercent).toBe("number");
    expect(json.refreshSeconds).toBe(60);
  });

  test("alerts section visible when present", async ({ page }) => {
    await page.goto("/dashboard/today/profit");
    if (!page.url().includes("/dashboard/today/profit")) {
      test.skip(true, "Profit page unavailable");
    }
    const alerts = page.getByTestId("profit-alerts");
    if (await alerts.count()) {
      await expect(alerts.first()).toBeVisible();
    }
  });
});
