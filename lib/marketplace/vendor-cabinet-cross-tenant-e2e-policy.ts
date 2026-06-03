/**
 * Vendor cabinet cross-tenant isolation E2E policy (QA-24).
 *
 * Vendor A must not read vendor B purchase orders via cabinet pages or APIs.
 *
 * @see e2e/vendor-cabinet-cross-tenant.spec.ts
 * @see services/marketplace/vendor-orders-service.ts
 * @see lib/marketplace/vendor-page-access.tsx
 */

export const VENDOR_CABINET_CROSS_TENANT_E2E_POLICY_ID =
  "vendor-cabinet-cross-tenant-e2e-v1" as const;

export const VENDOR_DASHBOARD_PATH = "/vendor/dashboard" as const;
export const VENDOR_ORDERS_PATH = "/vendor/orders" as const;

export const VENDOR_ORDER_NOT_FOUND_HEADING = /^Page not found$/i;

export function vendorOrderDetailPath(orderId: string): string {
  return `/vendor/orders/${orderId}`;
}

export function vendorPackingSlipPath(orderId: string): string {
  return `/api/vendor/orders/${orderId}/packing-slip`;
}

export const VENDOR_CROSS_TENANT_FORBIDDEN_STATUSES = [403, 404] as const;

export function isVendorCrossTenantForbiddenStatus(status: number): boolean {
  return (VENDOR_CROSS_TENANT_FORBIDDEN_STATUSES as readonly number[]).includes(status);
}
