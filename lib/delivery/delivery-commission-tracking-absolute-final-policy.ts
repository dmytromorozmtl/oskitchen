/**
 * Absolute Final Task 73 — commission tracking per delivery order.
 *
 * @see app/dashboard/analytics/delivery-commissions/page.tsx
 * @see services/delivery/delivery-commission-tracking-service.ts
 */

export const DELIVERY_COMMISSION_TRACKING_ABSOLUTE_FINAL_POLICY_ID =
  "delivery-commission-tracking-absolute-final-v1" as const;

export const DELIVERY_COMMISSION_TRACKING_ROUTE =
  "/dashboard/analytics/delivery-commissions" as const;

export const DELIVERY_COMMISSION_TRACKING_PAGE_PATH =
  "app/dashboard/analytics/delivery-commissions/page.tsx" as const;

export const DELIVERY_COMMISSION_TRACKING_PANEL_PATH =
  "components/dashboard/analytics/delivery-commission-panel.tsx" as const;

export const DELIVERY_COMMISSION_TRACKING_SERVICE_PATH =
  "services/delivery/delivery-commission-tracking-service.ts" as const;

/** Marketplace providers tracked for per-order commission rollups. */
export const DELIVERY_COMMISSION_PROVIDERS = [
  "DOORDASH",
  "UBER_EATS",
  "GRUBHUB",
  "UBER_DIRECT",
] as const;

export type DeliveryCommissionProvider = (typeof DELIVERY_COMMISSION_PROVIDERS)[number];

export const DELIVERY_COMMISSION_PROVIDER_LABEL: Record<DeliveryCommissionProvider, string> = {
  DOORDASH: "DoorDash",
  UBER_EATS: "Uber Eats",
  GRUBHUB: "Grubhub",
  UBER_DIRECT: "Uber Direct",
};

/**
 * Directional benchmark commission rates when the channel payload does not report fees.
 * Operators should reconcile against marketplace settlement statements.
 */
export const DELIVERY_COMMISSION_BENCHMARK_RATE_PCT: Record<DeliveryCommissionProvider, number> = {
  DOORDASH: 25,
  UBER_EATS: 25,
  GRUBHUB: 20,
  UBER_DIRECT: 15,
};

export const DELIVERY_COMMISSION_HONESTY_MARKERS = [
  "estimated benchmark",
  "settlement statement",
  "reported by channel",
  "not a tax invoice",
] as const;

export const DELIVERY_COMMISSION_TRACKING_WIRING_PATHS = [
  DELIVERY_COMMISSION_TRACKING_PAGE_PATH,
  DELIVERY_COMMISSION_TRACKING_PANEL_PATH,
  DELIVERY_COMMISSION_TRACKING_SERVICE_PATH,
  "lib/delivery/delivery-commission-tracking-absolute-final-policy.ts",
  "lib/delivery/delivery-commission-metrics.ts",
  "lib/delivery/delivery-commission-tracking-audit.ts",
  "tests/unit/delivery-commission-tracking-absolute-final.test.ts",
] as const;

export const DELIVERY_COMMISSION_TRACKING_UNIT_TEST =
  "tests/unit/delivery-commission-tracking-absolute-final.test.ts" as const;

export const DELIVERY_COMMISSION_TRACKING_CI_SCRIPTS = [
  "test:ci:delivery-commission-tracking",
  "test:ci:delivery-commission-tracking:cert",
] as const;
