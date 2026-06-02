import { expect, test } from "@playwright/test";

/**
 * Offline card payments — PCI-safe queue panel and API auth.
 */
test.describe("offline card payments", () => {
  test("sync API requires authentication", async ({ request }) => {
    const res = await request.post("/api/pos/offline-card/sync");
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("POS terminal shows offline card sync panel when authed", async ({ page }) => {
    await page.goto("/dashboard/pos/terminal");
    if (page.url().includes("/login")) {
      test.skip(true, "No authed session for POS terminal");
    }
    await expect(page.getByTestId("offline-card-sync-panel")).toBeVisible();
    await expect(page.getByText(/PCI-safe/i)).toBeVisible();
  });
});
