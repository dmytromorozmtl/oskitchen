/**
 * QR scan → guest order → kitchen E2E policy (QA-18).
 *
 * Scan entry uses encoded table URL `/q/{store}/{table}` (dark menu shell),
 * distinct from table self-service query URL `/q/table?store=…&table=…` (QA-12).
 *
 * @see e2e/qr-scan-guest-kitchen.spec.ts
 * @see components/qr/qr-ordering-client.tsx
 * @see lib/qr/qr-order-meta.ts — publicQrOrderPath
 */

export const QR_SCAN_GUEST_KITCHEN_E2E_POLICY_ID = "qr-scan-guest-kitchen-e2e-v1" as const;

export const QR_SCAN_GUEST_KITCHEN_TICKET_VISIBLE_MS = 15_000 as const;

export const QR_SCAN_STORE_SLUG = "demo-store" as const;
export const QR_SCAN_TABLE_ROUTE_ID = "12" as const;

export const QR_ORDERING_PAGE_TEST_ID = "qr-ordering-page" as const;
export const QR_OPEN_CART_TEST_ID = "qr-open-cart" as const;
export const QR_PLACE_ORDER_TEST_ID = "qr-place-order" as const;
export const QR_ORDER_CONFIRMATION_TEST_ID = "qr-order-confirmation" as const;

export const QR_GUEST_KDS_TABLE_BADGE_TEST_ID = "kds-qr-table-badge" as const;

export function qrScanGuestKitchenTicketTestId(orderId: string): string {
  return `kds-ticket-${orderId}`;
}

export function qrMenuItemTestId(productId: string): string {
  return `qr-menu-item-${productId}`;
}

/** True when path is a scanned table QR deep link (not self-service query form). */
export function isQrScanDeepLinkPath(pathname: string): boolean {
  return /^\/q\/[^/]+\/[^/]+$/.test(pathname) && !pathname.startsWith("/q/table");
}

export const QR_SCAN_KITCHEN_ORDER_STATUS = "IN_PRODUCTION" as const;

export const QR_SCAN_KITCHEN_CREATION_CHANNEL = "table_qr" as const;
