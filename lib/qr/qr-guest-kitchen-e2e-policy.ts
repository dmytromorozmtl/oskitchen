/**
 * QR guest order → kitchen ticket E2E policy (QA-12 / DEV-17).
 *
 * @see e2e/qr-guest-order-kitchen.spec.ts
 * @see services/qr/qr-ordering-service.ts — processQROrder → IN_PRODUCTION
 */

export const QR_GUEST_KITCHEN_E2E_POLICY_ID = "qr-guest-kitchen-e2e-v1" as const;

/** KDS ticket must render within this window after guest submits. */
export const QR_GUEST_KITCHEN_TICKET_VISIBLE_MS = 15_000 as const;

export const QR_GUEST_KDS_TABLE_BADGE_TEST_ID = "kds-qr-table-badge" as const;

export function qrGuestKdsTicketTestId(orderId: string): string {
  return `kds-ticket-${orderId}`;
}

export const QR_GUEST_KITCHEN_ORDER_STATUS = "IN_PRODUCTION" as const;

export const QR_GUEST_KITCHEN_CREATION_SOURCE = "qr_table" as const;
