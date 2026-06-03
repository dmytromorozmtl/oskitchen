import { describe, expect, it } from "vitest";

import {
  QR_ORDERING_PAGE_TEST_ID,
  QR_SCAN_GUEST_KITCHEN_E2E_POLICY_ID,
  QR_SCAN_KITCHEN_ORDER_STATUS,
  isQrScanDeepLinkPath,
  qrScanGuestKitchenTicketTestId,
} from "@/lib/qr/qr-scan-guest-kitchen-e2e-policy";
import { publicQrOrderPath } from "@/lib/qr/qr-order-meta";
import { publicTableSelfServicePath } from "@/lib/qr/table-self-service";

describe("QR scan → guest order → kitchen lifecycle (QA-18)", () => {
  it("exports scan E2E selectors and ticket testid", () => {
    expect(QR_SCAN_GUEST_KITCHEN_E2E_POLICY_ID).toBe("qr-scan-guest-kitchen-e2e-v1");
    expect(QR_ORDERING_PAGE_TEST_ID).toBe("qr-ordering-page");
    expect(QR_SCAN_KITCHEN_ORDER_STATUS).toBe("IN_PRODUCTION");
    expect(qrScanGuestKitchenTicketTestId("abc")).toBe("kds-ticket-abc");
  });

  it("distinguishes scanned deep link from self-service query entry", () => {
    const scanPath = publicQrOrderPath("demo-store", "12");
    const selfServicePath = publicTableSelfServicePath("demo-store", "12");
    expect(scanPath).toBe("/q/demo-store/12");
    expect(selfServicePath).toContain("/q/table?");
    expect(isQrScanDeepLinkPath(scanPath)).toBe(true);
    expect(isQrScanDeepLinkPath(selfServicePath)).toBe(false);
  });

  it("accepts encoded table labels in scan paths", () => {
    expect(isQrScanDeepLinkPath(publicQrOrderPath("my-cafe", "Patio A"))).toBe(true);
  });
});
