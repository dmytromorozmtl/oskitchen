/**
 * Blueprint P2-32 — QR scan → storefront menu → checkout → KDS E2E.
 *
 * scan → menu → checkout → order in KDS
 *
 * @see e2e/qr-scan-storefront-kds-e2e.spec.ts
 * @see e2e/helpers/qr-scan-storefront-kds-e2e-flow.ts
 * @see lib/qr/qr-scan-guest-kitchen-e2e-policy.ts — QR-only path (no storefront checkout)
 * @see lib/storefront/storefront-checkout-kds-e2e-policy.ts — storefront checkout → KDS
 */

import { publicQrOrderPath } from "@/lib/qr/qr-order-meta";
import { QR_ORDERING_PAGE_TEST_ID } from "@/lib/qr/qr-scan-guest-kitchen-e2e-policy";

export const QR_SCAN_STOREFRONT_KDS_E2E_POLICY_ID =
  "qr-scan-storefront-kds-e2e-p2-32-v1" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_SPEC =
  "e2e/qr-scan-storefront-kds-e2e.spec.ts" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_FLOW_HELPER =
  "e2e/helpers/qr-scan-storefront-kds-e2e-flow.ts" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_READY_HELPER =
  "e2e/helpers/qr-scan-storefront-kds-e2e-ready.ts" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_AUDIT_SCRIPT =
  "scripts/audit-qr-scan-storefront-kds-e2e.ts" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_NPM_SCRIPT =
  "audit:qr-scan-storefront-kds-e2e" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_UNIT_TEST =
  "tests/unit/qr-scan-storefront-kds-e2e.test.ts" as const;

export const QR_SCAN_STOREFRONT_KDS_E2E_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export { QR_ORDERING_PAGE_TEST_ID };

export const QR_SCAN_STOREFRONT_KDS_TICKET_VISIBLE_MS = 15_000 as const;

export const QR_SCAN_DEFAULT_TABLE_ROUTE_ID = "12" as const;

export const QR_SCAN_STOREFRONT_KDS_FLOW_STEPS = [
  "scan_qr_entry",
  "storefront_menu",
  "storefront_checkout",
  "webhook_event_persisted",
  "kitchen_task_linked",
  "verify_kds",
] as const;

export type QrScanStorefrontKdsE2EFlowStep =
  (typeof QR_SCAN_STOREFRONT_KDS_FLOW_STEPS)[number];

export function defaultQrScanStorefrontSlug(): string {
  return (
    process.env.E2E_QR_STORE_SLUG?.trim() ||
    process.env.E2E_STOREFRONT_SLUG?.trim() ||
    process.env.E2E_STORE_SLUG?.trim() ||
    "demo-store"
  );
}

export function defaultQrScanTableRouteId(): string {
  return process.env.E2E_QR_TABLE_ROUTE_ID?.trim() || QR_SCAN_DEFAULT_TABLE_ROUTE_ID;
}

export function qrScanEntryPath(
  storeSlug = defaultQrScanStorefrontSlug(),
  tableRouteId = defaultQrScanTableRouteId(),
): string {
  return publicQrOrderPath(storeSlug, tableRouteId);
}

export function storefrontMenuPath(storeSlug = defaultQrScanStorefrontSlug()): string {
  return `/s/${storeSlug}/menu`;
}

export function storefrontCheckoutPath(storeSlug = defaultQrScanStorefrontSlug()): string {
  return `/s/${storeSlug}/checkout`;
}

export function hasQrScanStorefrontKdsE2ECredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isQrScanStorefrontKdsE2EEnabled(): boolean {
  return process.env.E2E_QR_SCAN_STOREFRONT_KDS?.trim() === "true";
}

export function isQrScanStorefrontKdsKdsGateEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_KDS_V1_CERTIFIED === "true"
  );
}
