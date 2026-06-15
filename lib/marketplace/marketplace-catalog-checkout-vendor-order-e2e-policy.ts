/**
 * Marketplace catalog → checkout → vendor order E2E policy (QA-17).
 *
 * @see e2e/marketplace-catalog-checkout-vendor-order.spec.ts
 * @see services/marketplace/checkout-service.ts — one PO per vendor group
 * @see app/vendor/(cabinet)/orders/page.tsx
 */

export const MARKETPLACE_CATALOG_CHECKOUT_VENDOR_ORDER_E2E_POLICY_ID =
  "marketplace-catalog-checkout-vendor-order-e2e-v1" as const;

export const MARKETPLACE_CATALOG_PATH = "/dashboard/marketplace/catalog" as const;
export const MARKETPLACE_CHECKOUT_PATH = "/dashboard/marketplace/checkout" as const;
export const MARKETPLACE_BUYER_ORDERS_PATH = "/dashboard/marketplace/orders" as const;
export const VENDOR_ORDERS_PATH = "/vendor/orders" as const;

export const MARKETPLACE_CART_ADDED_MESSAGE = "Added to marketplace cart" as const;
export const MARKETPLACE_CHECKOUT_COMPLETE_PATTERN =
  /Checkout complete|submitted for manager approval/i;

export const MARKETPLACE_BUYER_ORDER_VIEW_LABEL = "View" as const;
export const MARKETPLACE_VENDOR_ORDER_MANAGE_LABEL = "Manage" as const;

export const VENDOR_ORDER_EMPTY_TITLE = "No incoming orders" as const;

/** Net-terms checkout fans out one vendor-facing PO per vendor cart group. */
export function vendorOrderFanoutCount(vendorGroupCount: number): number {
  return Math.max(0, vendorGroupCount);
}

export function vendorOrderPath(orderId: string): string {
  return `/vendor/orders/${orderId}`;
}

export function buyerOrderPath(orderId: string): string {
  return `/dashboard/marketplace/orders/${orderId}`;
}
