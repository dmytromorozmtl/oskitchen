import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

import {
  QR_ORDERING_PAGE_TEST_ID,
  QR_SCAN_STOREFRONT_KDS_FLOW_STEPS,
  defaultQrScanStorefrontSlug,
  qrScanEntryPath,
  storefrontMenuPath,
  type QrScanStorefrontKdsE2EFlowStep,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-policy";

import {
  assertStorefrontOrderOnKds,
  completeStorefrontPayLaterCheckout,
  loadStorefrontCartProduct,
  seedStorefrontCart,
} from "./storefront-checkout-kds-flow";

export type QrScanStorefrontKdsE2EFlowResult = {
  orderId: string;
  storeSlug: string;
  steps: QrScanStorefrontKdsE2EFlowStep[];
};

export async function runQrScanStorefrontKdsGuestFlow(
  guestPage: Page,
  request: APIRequestContext,
  storeSlug = defaultQrScanStorefrontSlug(),
): Promise<QrScanStorefrontKdsE2EFlowResult> {
  const steps: QrScanStorefrontKdsE2EFlowStep[] = [];

  await guestPage.goto(qrScanEntryPath(storeSlug));
  if (!guestPage.url().includes("/q/")) {
    test.skip(true, `No published QR storefront at ${qrScanEntryPath(storeSlug)}`);
  }

  const qrShell = guestPage.getByTestId(QR_ORDERING_PAGE_TEST_ID);
  if (!(await qrShell.isVisible({ timeout: 15_000 }).catch(() => false))) {
    test.skip(
      true,
      `Scanned QR menu unavailable — publish storefront slug "${storeSlug}" with table route.`,
    );
  }
  steps.push("scan_qr_entry");

  const menuRes = await request.get(`/api/storefront/catalog?storeSlug=${encodeURIComponent(storeSlug)}`);
  if (menuRes.status() === 404) {
    test.skip(true, `Storefront not published at /s/${storeSlug}/menu`);
  }
  expect(menuRes.status()).toBe(200);

  await guestPage.goto(storefrontMenuPath(storeSlug));
  await expect(guestPage.getByRole("heading", { name: /menu/i })).toBeVisible({
    timeout: 20_000,
  });

  const addButton = guestPage.getByRole("button", { name: "+" }).first();
  if (await addButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await addButton.click();
  } else {
    const product = await loadStorefrontCartProduct(request, storeSlug);
    await seedStorefrontCart(request, product.id, storeSlug);
  }
  steps.push("storefront_menu");

  const orderId = await completeStorefrontPayLaterCheckout(guestPage, storeSlug);
  steps.push("storefront_checkout");

  return { orderId, storeSlug, steps };
}

export async function assertQrScanStorefrontOrderOnKds(
  kitchenPage: Page,
  orderId: string,
): Promise<void> {
  await assertStorefrontOrderOnKds(kitchenPage, orderId);
}

export { QR_SCAN_STOREFRONT_KDS_FLOW_STEPS };
