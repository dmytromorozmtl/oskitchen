import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

import {
  STOREFRONT_CHECKOUT_KDS_TICKET_VISIBLE_MS,
  STOREFRONT_INTERNAL_ORDER_ID_TEST_ID,
  defaultStorefrontE2ESlug,
  storefrontKdsTicketTestId,
} from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

import { assertKdsKitchenReady } from "./kds-kitchen-ready";
import {
  ensureStorefrontDevServer,
  skipStorefrontCheckoutIfTurnstileEnabled,
  skipStorefrontCheckoutKdsAuthedIfNotReady,
} from "./storefront-checkout-kds-ready";

export type StorefrontCartProduct = {
  id: string;
  canAddToCart?: boolean;
};

export async function loadStorefrontCartProduct(
  request: APIRequestContext,
  slug = defaultStorefrontE2ESlug(),
): Promise<StorefrontCartProduct> {
  const catalogRes = await request.get(`/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`);
  if (catalogRes.status() === 404) {
    test.skip(true, "Storefront not published on dev server.");
  }
  expect(catalogRes.status()).toBe(200);
  const catalog = await catalogRes.json();
  const product = catalog.catalog?.products?.find(
    (p: StorefrontCartProduct) => p.canAddToCart !== false,
  );
  if (!product) test.skip(true, "No addable products in catalog.");
  return product;
}

export async function seedStorefrontCart(
  request: APIRequestContext,
  productId: string,
  slug = defaultStorefrontE2ESlug(),
): Promise<void> {
  const cartGet = await request.get(`/api/storefront/cart?storeSlug=${encodeURIComponent(slug)}`);
  if (cartGet.status() !== 200) test.skip(true, "Cart API unavailable.");
  const cartData = await cartGet.json();

  const patchRes = await request.patch("/api/storefront/cart", {
    data: {
      storeSlug: slug,
      clientPriceVersion: cartData.cart?.priceVersion,
      lineDelta: { productId, delta: 1 },
      merge: true,
    },
  });
  expect(patchRes.status()).toBe(200);
}

export async function completeStorefrontPayLaterCheckout(
  page: Page,
  slug = defaultStorefrontE2ESlug(),
): Promise<string> {
  await page.goto(`/s/${slug}/checkout`);
  await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({ timeout: 20_000 });

  const email = `e2e-storefront-kds-${Date.now()}@example.com`;
  await page.getByLabel(/name/i).first().fill("E2E Storefront KDS");
  await page.getByLabel(/email/i).fill(email);
  const phone = page.getByLabel(/phone/i);
  if (await phone.isVisible()) await phone.fill("5550100399");

  const pickupDate = page.locator('input[name="pickupDate"]');
  if (await pickupDate.isVisible()) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    await pickupDate.fill(d.toISOString().slice(0, 10));
  }

  const terms = page.getByRole("checkbox").first();
  if (await terms.isVisible()) await terms.check();

  const payLater = page.getByText(/pay later/i).first();
  if (await payLater.isVisible()) await payLater.click();

  await page.getByRole("button", { name: /place|submit|order/i }).click();

  await expect(page).toHaveURL(new RegExp(`/s/${slug}/order/`), { timeout: 45_000 });
  await expect(page.getByText(/thanks|kitchen has your request/i).first()).toBeVisible({
    timeout: 15_000,
  });

  const internalOrder = page.getByTestId(STOREFRONT_INTERNAL_ORDER_ID_TEST_ID);
  await expect(internalOrder).toBeVisible({ timeout: 15_000 });
  const orderId = await internalOrder.getAttribute("data-order-id");
  if (!orderId) {
    throw new Error("Storefront confirmation missing internal order id");
  }
  return orderId;
}

export async function assertStorefrontOrderOnKds(
  kitchenPage: Page,
  orderId: string,
): Promise<void> {
  await kitchenPage.goto("/dashboard/kitchen");
  await assertKdsKitchenReady(kitchenPage);

  const ticket = kitchenPage.getByTestId(storefrontKdsTicketTestId(orderId));
  await expect(ticket).toBeVisible({ timeout: STOREFRONT_CHECKOUT_KDS_TICKET_VISIBLE_MS });
}

export {
  assertKdsKitchenReady,
  ensureStorefrontDevServer,
  skipStorefrontCheckoutIfTurnstileEnabled,
  skipStorefrontCheckoutKdsAuthedIfNotReady,
};
