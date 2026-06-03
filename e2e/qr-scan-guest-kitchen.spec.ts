import { expect, test } from "@playwright/test";

import {
  QR_SCAN_GUEST_KITCHEN_E2E_POLICY_ID,
  QR_SCAN_KITCHEN_CREATION_CHANNEL,
  isQrScanDeepLinkPath,
  qrScanGuestKitchenTicketTestId,
} from "@/lib/qr/qr-scan-guest-kitchen-e2e-policy";
import { publicQrOrderPath } from "@/lib/qr/qr-order-meta";
import { publicTableSelfServicePath } from "@/lib/qr/table-self-service";

import {
  assertQrScanOrderOnKds,
  placeQrScanGuestOrder,
} from "./helpers/qr-scan-guest-kitchen-flow";
import { qrScanGuestUrl, skipQrScanGuestKitchenIfNotReady } from "./helpers/qr-scan-guest-kitchen-ready";

/**
 * QR scan → guest order → kitchen E2E.
 *
 * Scanned table URL `/q/{store}/{table}` → dark menu → place order → KDS ticket + table badge.
 *
 * @see e2e/qr-guest-order-kitchen.spec.ts — table self-service query URL variant (QA-12)
 * @see e2e/qr-ordering.spec.ts — public menu shell smoke
 */

const kdsGateEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.ENABLE_KDS_V1_CERTIFIED === "true";

test.describe("qr scan guest kitchen policy", () => {
  test("exports scan deep link vs self-service URL contract", () => {
    expect(QR_SCAN_GUEST_KITCHEN_E2E_POLICY_ID).toBe("qr-scan-guest-kitchen-e2e-v1");
    expect(publicQrOrderPath("demo-store", "12")).toBe("/q/demo-store/12");
    expect(publicTableSelfServicePath("demo-store", "12")).toBe(
      "/q/table?store=demo-store&table=12",
    );
    expect(isQrScanDeepLinkPath("/q/demo-store/12")).toBe(true);
    expect(isQrScanDeepLinkPath("/q/table?store=demo-store&table=12")).toBe(false);
    expect(qrScanGuestKitchenTicketTestId("ord-1")).toBe("kds-ticket-ord-1");
    expect(QR_SCAN_KITCHEN_CREATION_CHANNEL).toBe("table_qr");
    expect(qrScanGuestUrl()).toBe("/q/demo-store/12");
  });
});

test.describe("qr scan guest menu (chromium)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("scanned QR URL loads dark menu shell or skips", async ({ page }) => {
    await page.goto(qrScanGuestUrl());
    await expect(
      page
        .getByTestId("qr-ordering-page")
        .or(page.getByRole("heading", { name: /not found|menu unavailable/i })),
    ).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("qr scan guest kitchen ticket (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "QR scan→kitchen workflow runs in chromium-authed project only",
    );
    test.skip(
      !kdsGateEnabled,
      "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
    skipQrScanGuestKitchenIfNotReady();
  });

  test("scanned QR order appears on kitchen display within 15s with table badge", async ({
    page,
    browser,
  }) => {
    const guestContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const guestPage = await guestContext.newPage();

    try {
      const orderId = await placeQrScanGuestOrder(guestPage);
      await assertQrScanOrderOnKds(page, orderId);
    } finally {
      await guestContext.close();
    }
  });
});
