/**
 * Storefront checkout → KDS ticket E2E policy (QA-14).
 *
 * @see e2e/storefront-checkout-kds.spec.ts
 * @see actions/storefront-order.ts — pay-later → CONFIRMED internal order
 * @see services/production/daily-queue-service.ts — KDS queue source
 */

export const STOREFRONT_CHECKOUT_KDS_E2E_POLICY_ID =
  "storefront-checkout-kds-e2e-v1" as const;

export const STOREFRONT_CHECKOUT_KDS_TICKET_VISIBLE_MS = 15_000 as const;

export const STOREFRONT_CHECKOUT_KDS_ORDER_STATUS = "CONFIRMED" as const;

export const STOREFRONT_CHECKOUT_KDS_CREATION_SOURCE = "STOREFRONT" as const;

export const STOREFRONT_INTERNAL_ORDER_ID_TEST_ID = "storefront-internal-order-id" as const;

export function storefrontKdsTicketTestId(orderId: string): string {
  return `kds-ticket-${orderId}`;
}

export function defaultStorefrontE2ESlug(): string {
  return (
    process.env.E2E_STOREFRONT_SLUG?.trim() ||
    process.env.E2E_STORE_SLUG?.trim() ||
    "hello"
  );
}

export const KDS_ELIGIBLE_ACTIVE_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "IN_PRODUCTION",
] as const;

export function isKdsEligibleOrderStatus(status: string): boolean {
  return (
    KDS_ELIGIBLE_ACTIVE_STATUSES.includes(status as (typeof KDS_ELIGIBLE_ACTIVE_STATUSES)[number]) &&
    status !== "CANCELLED" &&
    status !== "COMPLETED"
  );
}
