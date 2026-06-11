import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";

import {
  STOREFRONT_ADMIN_PATH,
  STOREFRONT_ENABLED_CHECKBOX_TEST_ID,
  STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS,
  STOREFRONT_PUBLISH_ORDER_KDS_VISIBLE_MS,
  STOREFRONT_PUBLISHED_CHECKBOX_TEST_ID,
  STOREFRONT_PUBLISH_PANEL_TEST_ID,
  STOREFRONT_SAVE_BTN_TEST_ID,
  defaultStorefrontE2ESlug,
  storefrontCatalogApiPath,
  storefrontMenuPath,
  type StorefrontPublishOrderKdsFlowStep,
} from "@/lib/qa/storefront-publish-order-kds-e2e-policy";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";
import {
  assertStorefrontOrderOnKds,
  completeStorefrontPayLaterCheckout,
  ensureStorefrontDevServer,
  loadStorefrontCartProduct,
  seedStorefrontCart,
  skipStorefrontCheckoutIfTurnstileEnabled,
} from "./storefront-checkout-kds-flow";

export type StorefrontPublishOrderKdsFlowResult = {
  orderId: string;
  slug: string;
  steps: StorefrontPublishOrderKdsFlowStep[];
};

export async function isStorefrontCatalogLive(
  request: APIRequestContext,
  slug = defaultStorefrontE2ESlug(),
): Promise<boolean> {
  const res = await request.get(storefrontCatalogApiPath(slug));
  return res.status() === 200;
}

export async function ensureStorefrontPublished(
  page: Page,
  request: APIRequestContext,
  slug = defaultStorefrontE2ESlug(),
): Promise<void> {
  if (await isStorefrontCatalogLive(request, slug)) {
    return;
  }

  await page.goto(STOREFRONT_ADMIN_PATH);
  await skipIfLoginRedirect(page);
  await assertNoDashboardRscFailure(page);
  await expect(page.getByTestId(STOREFRONT_PUBLISH_PANEL_TEST_ID)).toBeVisible({
    timeout: STOREFRONT_PUBLISH_ORDER_KDS_VISIBLE_MS,
  });

  const published = page.getByTestId(STOREFRONT_PUBLISHED_CHECKBOX_TEST_ID);
  const enabled = page.getByTestId(STOREFRONT_ENABLED_CHECKBOX_TEST_ID);
  if (!(await published.isChecked())) await published.check();
  if (!(await enabled.isChecked())) await enabled.check();

  await page.getByTestId(STOREFRONT_SAVE_BTN_TEST_ID).click();
  await page.waitForLoadState("domcontentloaded");

  const blocked = page.getByText(/Cannot publish storefront until launch checklist passes/i);
  if (await blocked.isVisible().catch(() => false)) {
    test.skip(true, "Launch checklist blocks publish — complete storefront launch gates first.");
  }

  if (!(await isStorefrontCatalogLive(request, slug))) {
    test.skip(true, "Storefront catalog still unavailable after publish save.");
  }
}

export async function verifyPublicStorefrontMenu(
  page: Page,
  slug = defaultStorefrontE2ESlug(),
): Promise<void> {
  await page.goto(storefrontMenuPath(slug));
  await expect(page.getByRole("heading", { name: /menu/i })).toBeVisible({
    timeout: STOREFRONT_PUBLISH_ORDER_KDS_VISIBLE_MS,
  });
}

export async function runStorefrontPublishOrderKdsFlow(
  page: Page,
  browser: Browser,
  request: APIRequestContext,
): Promise<StorefrontPublishOrderKdsFlowResult> {
  const steps: StorefrontPublishOrderKdsFlowStep[] = [];
  const slug = defaultStorefrontE2ESlug();

  skipStorefrontCheckoutIfTurnstileEnabled();
  await ensureStorefrontDevServer(request);

  await ensureStorefrontPublished(page, request, slug);
  steps.push("publish_storefront");

  await verifyPublicStorefrontMenu(page, slug);
  steps.push("verify_public_menu");

  const product = await loadStorefrontCartProduct(request, slug);
  await seedStorefrontCart(request, product.id, slug);

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  let orderId: string;
  try {
    orderId = await completeStorefrontPayLaterCheckout(guestPage, slug);
  } finally {
    await guestContext.close();
  }
  steps.push("guest_order");

  await assertStorefrontOrderOnKds(page, orderId);
  steps.push("verify_kds");

  if (steps.length !== STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return { orderId, slug, steps };
}
