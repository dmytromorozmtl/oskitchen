/**
 * Blueprint P1-47 — Storefront publish → order → KDS E2E (storefront flow).
 *
 * @see e2e/storefront-publish-order-kds.spec.ts
 * @see e2e/storefront-checkout-kds.spec.ts
 * @see lib/storefront/storefront-checkout-kds-e2e-policy.ts
 */

export {
  defaultStorefrontE2ESlug,
  STOREFRONT_CHECKOUT_KDS_TICKET_VISIBLE_MS,
  STOREFRONT_INTERNAL_ORDER_ID_TEST_ID,
  storefrontKdsTicketTestId,
} from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

export const STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID =
  "storefront-publish-order-kds-e2e-v1" as const;

export const STOREFRONT_ADMIN_PATH = "/dashboard/storefront" as const;
export const STOREFRONT_THEME_PATH = "/dashboard/storefront/theme" as const;
export const STOREFRONT_LAUNCH_PATH = "/dashboard/storefront/launch" as const;
export const KDS_KITCHEN_PATH = "/dashboard/kitchen" as const;

export const STOREFRONT_PUBLISH_PANEL_TEST_ID = "storefront-publish-panel" as const;
export const STOREFRONT_PUBLISHED_CHECKBOX_TEST_ID = "storefront-published-checkbox" as const;
export const STOREFRONT_ENABLED_CHECKBOX_TEST_ID = "storefront-enabled-checkbox" as const;
export const STOREFRONT_SAVE_BTN_TEST_ID = "storefront-save-btn" as const;

export const STOREFRONT_PUBLISH_ORDER_KDS_VISIBLE_MS = 60_000 as const;

export const STOREFRONT_PUBLISH_ORDER_KDS_E2E_SPEC =
  "e2e/storefront-publish-order-kds.spec.ts" as const;
export const STOREFRONT_PUBLISH_ORDER_KDS_FLOW_HELPER =
  "e2e/helpers/storefront-publish-order-kds-flow.ts" as const;
export const STOREFRONT_PUBLISH_ORDER_KDS_READY_HELPER =
  "e2e/helpers/storefront-publish-order-kds-ready.ts" as const;
export const STOREFRONT_PUBLISH_ORDER_KDS_AUDIT_SCRIPT =
  "scripts/audit-storefront-publish-order-kds-e2e.ts" as const;
export const STOREFRONT_PUBLISH_ORDER_KDS_NPM_SCRIPT =
  "audit:storefront-publish-order-kds-e2e" as const;
export const STOREFRONT_PUBLISH_ORDER_KDS_UNIT_TEST =
  "tests/unit/storefront-publish-order-kds-e2e.test.ts" as const;
export const STOREFRONT_PUBLISH_ORDER_KDS_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS = [
  "publish_storefront",
  "verify_public_menu",
  "guest_order",
  "verify_kds",
] as const;

export type StorefrontPublishOrderKdsFlowStep =
  (typeof STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS)[number];

export function storefrontMenuPath(slug: string): string {
  return `/s/${slug}/menu`;
}

export function storefrontCheckoutPath(slug: string): string {
  return `/s/${slug}/checkout`;
}

export function storefrontCatalogApiPath(slug: string): string {
  return `/api/storefront/catalog?storeSlug=${encodeURIComponent(slug)}`;
}

export function hasStorefrontPublishOrderKdsCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isStorefrontPublishOrderKdsE2EEnabled(): boolean {
  return process.env.E2E_STOREFRONT_PUBLISH_E2E?.trim() === "true";
}

export function isStorefrontPublishOrderKdsKdsGateEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_KDS_V1_CERTIFIED === "true"
  );
}
