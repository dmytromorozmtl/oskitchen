import { expect, test } from "@playwright/test";

import {
  QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID,
  QR_SCAN_STOREFRONT_KDS_FLOW_STEPS,
  defaultQrScanStorefrontSlug,
  defaultQrScanTableRouteId,
  isQrScanStorefrontKdsKdsGateEnabled,
  qrScanEntryPath,
  storefrontCheckoutPath,
  storefrontMenuPath,
} from "@/lib/qa/qr-scan-storefront-kds-e2e-policy";

import {
  QR_SCAN_STOREFRONT_KDS_FLOW_STEPS as FLOW_STEPS,
  runQrScanStorefrontKdsGuestFlow,
  assertQrScanStorefrontOrderOnKds,
} from "./helpers/qr-scan-storefront-kds-e2e-flow";
import {
  ensureStorefrontDevServer,
  skipStorefrontCheckoutIfTurnstileEnabled,
} from "./helpers/storefront-checkout-kds-flow";
import {
  skipQrScanStorefrontKdsIfGateDisabled,
  skipQrScanStorefrontKdsIfNotAuthed,
  skipQrScanStorefrontKdsIfTurnstileEnabled,
} from "./helpers/qr-scan-storefront-kds-e2e-ready";

/**
 * QR scan → storefront menu → checkout → KDS ticket E2E.
 *
 * @see e2e/qr-scan-guest-kitchen.spec.ts — QR-only order API path
 * @see e2e/storefront-checkout-kds.spec.ts — storefront checkout without QR entry
 */

test.describe("qr scan storefront kds e2e policy", () => {
  test("exports four-step scan menu checkout kds flow", () => {
    expect(QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID).toBe("qr-scan-storefront-kds-e2e-p2-32-v1");
    expect(QR_SCAN_STOREFRONT_KDS_FLOW_STEPS).toEqual([
      "scan_qr_entry",
      "storefront_menu",
      "storefront_checkout",
      "verify_kds",
    ]);
    const slug = "demo-store";
    expect(qrScanEntryPath(slug, "12")).toBe("/q/demo-store/12");
    expect(storefrontMenuPath(slug)).toBe("/s/demo-store/menu");
    expect(storefrontCheckoutPath(slug)).toBe("/s/demo-store/checkout");
    expect(defaultQrScanStorefrontSlug()).toBeTruthy();
    expect(defaultQrScanTableRouteId()).toBe("12");
  });
});

test.describe("qr scan storefront menu (chromium)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeAll(() => {
    skipStorefrontCheckoutIfTurnstileEnabled();
  });

  test.beforeEach(async ({ request }) => {
    await ensureStorefrontDevServer(request);
  });

  test("scanned QR URL then storefront menu path resolves or skips", async ({ page, request }) => {
    const slug = defaultQrScanStorefrontSlug();
    await page.goto(qrScanEntryPath(slug));
    await expect(
      page
        .getByTestId("qr-ordering-page")
        .or(page.getByRole("heading", { name: /not found|menu unavailable/i })),
    ).toBeVisible({ timeout: 15_000 });

    const menuRes = await request.get(`/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`);
    if (menuRes.status() === 404) test.skip(true, "Storefront not published.");

    await page.goto(storefrontMenuPath(slug));
    await expect(page.getByRole("heading", { name: /menu/i })).toBeVisible({ timeout: 20_000 });
  });
});

test.describe("qr scan storefront kds ticket (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "QR scan→storefront→KDS runs in chromium-authed project only",
    );
    test.skip(
      !isQrScanStorefrontKdsKdsGateEnabled(),
      "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
    skipQrScanStorefrontKdsIfGateDisabled();
    skipQrScanStorefrontKdsIfNotAuthed();
    skipQrScanStorefrontKdsIfTurnstileEnabled();
  });

  test("scanned QR storefront checkout appears on kitchen display within 15s", async ({
    page,
    browser,
    request,
  }) => {
    await ensureStorefrontDevServer(request);
    const guestContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const guestPage = await guestContext.newPage();

    try {
      const { orderId, steps } = await runQrScanStorefrontKdsGuestFlow(guestPage, request);
      expect(steps).toEqual(FLOW_STEPS.slice(0, 3));
      await assertQrScanStorefrontOrderOnKds(page, orderId);
    } finally {
      await guestContext.close();
    }
  });
});
