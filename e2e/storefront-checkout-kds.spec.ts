import { expect, test } from "@playwright/test";

import {
  STOREFRONT_CHECKOUT_KDS_E2E_POLICY_ID,
  STOREFRONT_CHECKOUT_KDS_ORDER_STATUS,
  isKdsEligibleOrderStatus,
  storefrontKdsTicketTestId,
} from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

import {
  assertStorefrontOrderOnKds,
  completeStorefrontPayLaterCheckout,
  defaultStorefrontE2ESlug,
  ensureStorefrontDevServer,
  loadStorefrontCartProduct,
  seedStorefrontCart,
  skipStorefrontCheckoutIfTurnstileEnabled,
  skipStorefrontCheckoutKdsAuthedIfNotReady,
} from "./helpers/storefront-checkout-kds-flow";

/**
 * Storefront checkout → KDS ticket E2E — guest pay-later preorder → kitchen display within 15s.
 *
 * @see e2e/storefront-checkout-pay-later.spec.ts
 * @see e2e/kds-staging.spec.ts
 * @see e2e/qr-guest-order-kitchen.spec.ts
 */

const kdsGateEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.ENABLE_KDS_V1_CERTIFIED === "true";

test.describe("storefront checkout kds policy", () => {
  test("exports ticket SLA and eligibility contract", () => {
    expect(STOREFRONT_CHECKOUT_KDS_E2E_POLICY_ID).toBe("storefront-checkout-kds-e2e-v1");
    expect(STOREFRONT_CHECKOUT_KDS_ORDER_STATUS).toBe("CONFIRMED");
    expect(isKdsEligibleOrderStatus("CONFIRMED")).toBe(true);
    expect(isKdsEligibleOrderStatus("COMPLETED")).toBe(false);
    expect(storefrontKdsTicketTestId("ord-1")).toBe("kds-ticket-ord-1");
  });
});

test.describe("storefront checkout menu (chromium)", () => {
  test.beforeAll(() => {
    skipStorefrontCheckoutIfTurnstileEnabled();
  });

  test.beforeEach(async ({ request }) => {
    await ensureStorefrontDevServer(request);
  });

  test("published storefront menu loads for checkout path", async ({ page, request }) => {
    const slug = defaultStorefrontE2ESlug();
    const menuRes = await request.get(`/s/${slug}/menu`);
    if (menuRes.status() === 404) test.skip(true, "Storefront not published.");

    await page.goto(`/s/${slug}/menu`);
    await expect(page.getByRole("heading", { name: /menu/i })).toBeVisible({ timeout: 20_000 });
  });
});

test.describe("storefront checkout kds ticket (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Storefront→KDS workflow runs in chromium-authed project only",
    );
    test.skip(
      !kdsGateEnabled,
      "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
    skipStorefrontCheckoutIfTurnstileEnabled();
    skipStorefrontCheckoutKdsAuthedIfNotReady();
  });

  test("guest pay-later checkout appears on kitchen display within 15s", async ({
    page,
    browser,
    request,
  }) => {
    await ensureStorefrontDevServer(request);
    const slug = defaultStorefrontE2ESlug();
    const product = await loadStorefrontCartProduct(request, slug);
    await seedStorefrontCart(request, product.id, slug);

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    try {
      const orderId = await completeStorefrontPayLaterCheckout(guestPage, slug);
      await assertStorefrontOrderOnKds(page, orderId);
    } finally {
      await guestContext.close();
    }
  });
});
