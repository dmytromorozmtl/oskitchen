import { test } from "@playwright/test";

/**
 * QR guest → kitchen ticket staging prerequisites.
 *
 * Engine + public page tests always run. Full guest→KDS proof skips until
 * published storefront (`demo-store` + table `12`) and E2E auth exist.
 *
 * @see docs/qr-code-ordering-plan.md
 * @see e2e/kds-staging.spec.ts
 */

export const QR_GUEST_ORDER_STORE_SLUG = "demo-store";
export const QR_GUEST_ORDER_TABLE_ID = "12";

export function qrGuestTableUrl(basePath = "/q/table"): string {
  const params = new URLSearchParams({
    store: QR_GUEST_ORDER_STORE_SLUG,
    table: QR_GUEST_ORDER_TABLE_ID,
  });
  return `${basePath}?${params.toString()}`;
}

export function getQrGuestKitchenSkipReason(): string | null {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    return "QR guest→kitchen E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD";
  }
  return null;
}

export function skipQrGuestKitchenIfNotReady(): void {
  const reason = getQrGuestKitchenSkipReason();
  if (reason) test.skip(true, reason);
}
