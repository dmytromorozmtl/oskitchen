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

  test("profit engine API returns 30s breakdown shape", async ({ page }) => {
    await page.goto("/dashboard/today");
    if (page.url().includes("/login")) {
      test.skip(true, "Requires authenticated session");
    }
    const res = await page.request.get("/api/analytics/profit-engine");
    if (res.status() === 401) {
      test.skip(true, "API requires auth cookie");
    }
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as {
      refreshSeconds: number;
      byTable: unknown[];
      byServer: unknown[];
      byChannel: unknown[];
      byOrder: unknown[];
      summary: { profit: number };
    };
    expect(json.refreshSeconds).toBe(30);
    expect(Array.isArray(json.byTable)).toBe(true);
    expect(Array.isArray(json.byServer)).toBe(true);
    expect(Array.isArray(json.byChannel)).toBe(true);
    expect(Array.isArray(json.byOrder)).toBe(true);
    expect(typeof json.summary.profit).toBe("number");
  });

  test("profit engine breakdown on profit page", async ({ page }) => {
    await page.goto("/dashboard/today/profit");
    if (page.url().includes("/login")) {
      test.skip(true, "Requires authenticated session");
    }
    await expect(page.getByTestId("profit-engine-breakdown")).toBeVisible();
    await expect(page.getByTestId("profit-engine-tab-table")).toBeVisible();
    await expect(page.getByTestId("profit-engine-rows")).toBeVisible();
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
