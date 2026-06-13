import { expect, test } from "@playwright/test";

/**
 * Voice ordering — webhook smoke + authed settings (chromium-authed).
 */
test.describe("voice ordering", () => {
  test("voice API rejects missing secret", async ({ request }) => {
    const res = await request.post("/api/voice/alexa", {
      data: {
        ownerUserId: "00000000-0000-4000-8000-000000000001",
        utterance: "add latte to table 1",
      },
    });
    expect(res.status()).toBe(401);
  });

  test("settings voice page shows program copy when authed", async ({ page }) => {
    await page.goto("/dashboard/settings/voice");
    await expect(page.getByRole("heading", { name: /voice ordering/i })).toBeVisible();
    await expect(page.getByTestId("voice-enabled-switch")).toBeVisible();
    await expect(page.getByText(/Alexa and Google Home/i)).toBeVisible();
  });
});
