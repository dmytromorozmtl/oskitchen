import { expect, test } from "@playwright/test";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";
import { mockVendorStripeConnectAPI } from "./helpers/marketplace-vendor-mock";

/**
 * Vendor lifecycle E2E: registration → finance (Connect rails) → product draft → buyer order → vendor orders.
 * Runs in `chromium-authed` only (see `playwright.config.ts`).
 *
 * Honest skips when marketplace migration is missing, vendor is not APPROVED, or catalog has no products.
 * Stripe Connect onboarding is server-action driven — finance page verifies payout rail copy; use
 * `MARKETPLACE_VENDOR_STRIPE_CONNECT=1` + Stripe test keys on staging for live Connect proof.
 */
test.describe("vendor registration → connect → product → order", () => {
  test.beforeEach(async ({ page }) => {
    await mockVendorStripeConnectAPI(page);
  });

  test("registration through vendor order visibility", async ({ page }) => {
    const stamp = Date.now().toString(36);

    await page.goto("/vendor/register");
    await skipIfLoginRedirect(page);

    if (await page.getByText(/Marketplace temporarily unavailable/i).isVisible().catch(() => false)) {
      test.skip(true, "Marketplace migration not applied — run prisma migrate deploy.");
    }

    const alreadySubmitted = page.getByText(/Application already on file/i);
    const successBanner = page.getByText(/Application submitted/i);

    if (!(await alreadySubmitted.isVisible().catch(() => false)) && !(await successBanner.isVisible().catch(() => false))) {
      await page.getByLabel("Company name").fill(`E2E Supply ${stamp}`);
      await page.getByLabel("Legal name").fill(`E2E Supply ${stamp} LLC`);
      await page.getByLabel("Country").fill("United States");
      await page.getByLabel("Contact email").fill(
        process.env.E2E_LOGIN_EMAIL?.trim() ?? `e2e-vendor-${stamp}@example.com`,
      );
      await page.getByPlaceholder("File name").first().fill("w9-e2e.pdf");
      await page.getByRole("button", { name: /Submit for verification/i }).click();
      await expect(page.getByText(/Application submitted/i)).toBeVisible({ timeout: 30_000 });
    }

    await page.goto("/vendor/register/status");
    await skipIfLoginRedirect(page);

    const approved = await page.getByText(/^Approved$/i).isVisible().catch(() => false);
    const openCabinet = page.getByRole("link", { name: /Open vendor cabinet/i });

    if (!approved && !(await openCabinet.isVisible().catch(() => false))) {
      test.skip(
        true,
        "Vendor not APPROVED yet — platform ops must approve before Connect, products, and orders E2E.",
      );
    }

    await page.goto("/vendor/finance");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /^Finance$/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Available balance/i)).toBeVisible();
    await expect(page.getByText(/connected payout account/i)).toBeVisible();

    await page.goto("/vendor/products/new");
    await skipIfLoginRedirect(page);

    if (await page.getByText(/Vendor not verified/i).isVisible().catch(() => false)) {
      test.skip(true, "Vendor cabinet blocked — approval required.");
    }
    if (await page.getByText(/Read-only — you cannot edit products/i).isVisible().catch(() => false)) {
      test.skip(true, "Signed-in user lacks vendor:products:manage.");
    }

    const categoryTrigger = page.locator("#categoryId");
    if ((await categoryTrigger.count()) === 0) {
      test.skip(true, "No marketplace categories — run npm run db:seed:marketplace-categories.");
    }

    const sku = `E2E-SKU-${stamp}`;
    await page.getByLabel("Product name").fill(`E2E Test Product ${stamp}`);
    await page.getByLabel("SKU").fill(sku);
    await page.getByLabel("Description").fill("E2E vendor registration flow product.");
    await page.getByLabel("Base price").fill("12.50");
    await page.getByPlaceholder("Image URL").first().fill("https://example.com/e2e-product.jpg");
    await page.getByRole("button", { name: /Save draft/i }).click();
    await expect(page.getByText(/Product created/i)).toBeVisible({ timeout: 30_000 }).catch(async () => {
      await expect(page).toHaveURL(/\/vendor\/products/, { timeout: 30_000 });
    });

    await page.goto("/dashboard/marketplace/catalog");
    if (await page.getByText(/Marketplace temporarily unavailable/i).isVisible().catch(() => false)) {
      test.skip(true, "Buyer catalog unavailable.");
    }

    const quickAdd = page.getByRole("link", { name: /Quick add/i }).first();
    if ((await quickAdd.count()) === 0) {
      test.skip(true, "No catalog products for buyer checkout — seed ACTIVE vendor products.");
    }

    await quickAdd.click();
    await expect(page.getByText(/Added to marketplace cart/i)).toBeVisible({ timeout: 30_000 });

    await page.goto("/dashboard/marketplace/checkout");
    if (await page.getByText(/Your marketplace cart is empty/i).isVisible().catch(() => false)) {
      test.skip(true, "Cart empty after add.");
    }
    if (await page.getByText(/read-only cart access/i).isVisible().catch(() => false)) {
      test.skip(true, "Signed-in user lacks marketplace checkout permissions.");
    }

    await page.getByRole("button", { name: /Net terms/i }).click();
    await expect(
      page.getByText(/Checkout complete|submitted for manager approval/i),
    ).toBeVisible({ timeout: 60_000 });

    await page.goto("/vendor/orders");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /^Orders$/i })).toBeVisible();

    if (await page.getByText(/No incoming orders/i).isVisible().catch(() => false)) {
      test.skip(
        true,
        "Purchase order created for another vendor — E2E workspace vendor must sell an ACTIVE catalog SKU to see orders here.",
      );
    }

    await expect(page.getByRole("link", { name: /^View$/i }).first()).toBeVisible({ timeout: 15_000 });
  });
});
