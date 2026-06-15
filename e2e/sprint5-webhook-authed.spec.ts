import { expect, test } from "@playwright/test";

/**
 * Sprint 5 — webhook delivery log (Settings → publish page → delivered/failed row).
 *
 * Full delivery test needs a reachable HTTPS webhook (e.g. webhook.site) in E2E_PAGE_PUBLISH_WEBHOOK_URL.
 */
test.describe("Sprint 5 webhook log (authed)", () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim(),
      "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD",
    );
  });

  test("settings shows webhook log card when URL is configured", async ({ page }) => {
    await page.goto("/dashboard/storefront/settings");
    await expect(page.getByRole("heading", { name: /storefront settings/i })).toBeVisible({
      timeout: 60_000,
    });

    const logCard = page.getByRole("heading", { name: /page publish webhook log/i });
    const webhookField = page.getByLabel(/page publish webhook/i);

    if ((await logCard.count()) > 0) {
      await expect(logCard).toBeVisible();
      await expect(page.getByText(/storefront\.page\.published/i)).toBeVisible();
      return;
    }

    const externalUrl = process.env.E2E_PAGE_PUBLISH_WEBHOOK_URL?.trim();
    test.skip(!externalUrl, "Set page publish webhook URL in Settings or E2E_PAGE_PUBLISH_WEBHOOK_URL");

    await expect(webhookField).toBeVisible();
    await webhookField.fill(externalUrl);
    await page.getByRole("button", { name: /save team permissions/i }).click();
    await expect(page.getByRole("heading", { name: /page publish webhook log/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("publish page creates a delivery log row", async ({ page }) => {
    const webhookUrl = process.env.E2E_PAGE_PUBLISH_WEBHOOK_URL?.trim();
    test.skip(!webhookUrl, "Set E2E_PAGE_PUBLISH_WEBHOOK_URL (https) for end-to-end webhook test");

    await page.goto("/dashboard/storefront/settings");
    const webhookField = page.getByLabel(/page publish webhook/i);
    if ((await webhookField.count()) > 0) {
      await webhookField.fill(webhookUrl);
      await page.getByRole("button", { name: /save team permissions/i }).click();
    }

    await page.goto("/dashboard/storefront/pages");
    const editLink = page.locator('a[href*="/dashboard/storefront/pages/"]').first();
    test.skip((await editLink.count()) === 0, "No storefront pages to publish");
    await editLink.click();

    const publishBtn = page.getByRole("button", { name: /publish/i }).first();
    test.skip((await publishBtn.count()) === 0, "No publish control on page editor");
    await publishBtn.click();

    await page.goto("/dashboard/storefront/settings");
    await expect(page.getByRole("heading", { name: /page publish webhook log/i })).toBeVisible({
      timeout: 60_000,
    });
    await expect(
      page.getByText(/delivered|failed|pending/i).first(),
    ).toBeVisible({ timeout: 45_000 });
  });
});
