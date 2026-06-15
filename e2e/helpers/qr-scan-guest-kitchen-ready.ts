import { test } from "@playwright/test";

import {
  QR_SCAN_STORE_SLUG,
  QR_SCAN_TABLE_ROUTE_ID,
} from "@/lib/qr/qr-scan-guest-kitchen-e2e-policy";
import { publicQrOrderPath } from "@/lib/qr/qr-order-meta";

export function qrScanGuestUrl(): string {
  return publicQrOrderPath(QR_SCAN_STORE_SLUG, QR_SCAN_TABLE_ROUTE_ID);
}

export function skipQrScanGuestKitchenIfNotReady(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "QR scan→guest→kitchen E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
