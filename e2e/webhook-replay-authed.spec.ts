import { expect, test } from "@playwright/test";

/**
 * Authenticated webhook replay UI smoke (chromium-authed project only).
 */
test.describe("webhook replay UI (authed)", () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim(),
      "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD",
    );
  });

  test("sales channels webhooks page loads replay affordance when events exist", async ({
    page,
  }) => {
    await page.goto("/dashboard/sales-channels/webhooks");
    await expect(page.getByRole("heading", { name: /webhook/i })).toBeVisible({
      timeout: 60_000,
    });

    const replayButton = page.getByRole("button", { name: /request replay/i }).first();
    if ((await replayButton.count()) === 0) {
      test.skip(true, "No webhook events in tenant — ingest a signed delivery first");
    }
    await expect(replayButton).toBeVisible();
  });
});
