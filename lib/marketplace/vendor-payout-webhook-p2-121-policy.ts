/**
 * Blueprint P2-121 — Vendor payout webhook (Stripe Connect flow).
 *
 * @see docs/vendor-payout-webhook.md
 * @see app/dashboard/marketplace/vendor-payout-webhook/page.tsx
 */

export const VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID = "vendor-payout-webhook-p2-121-v1" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_DOC = "docs/vendor-payout-webhook.md" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_STRIPE_CONNECT =
  "services/marketplace/stripe-connect-service.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_WEBHOOK_ROUTE =
  "app/api/marketplace/stripe-connect/webhook/route.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_CONNECT_CONFIG =
  "lib/marketplace/stripe-connect-config.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_FINANCE =
  "services/marketplace/vendor-finance-service.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_API =
  "services/marketplace/vendor-api-service.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_INSTANT_PAYOUTS =
  "services/marketplace/instant-payouts-service.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_CONTENT_PATH =
  "lib/marketplace/vendor-payout-webhook-p2-121-content.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_OPERATIONS_PATH =
  "lib/marketplace/vendor-payout-webhook-p2-121-operations.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_SERVICE_PATH =
  "services/marketplace/vendor-payout-webhook-p2-121-service.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_COMPONENT =
  "components/marketplace/vendor-payout-webhook-panel.tsx" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_PAGE =
  "app/dashboard/marketplace/vendor-payout-webhook/page.tsx" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_ROUTE =
  "/dashboard/marketplace/vendor-payout-webhook" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_WEBHOOK_ROUTE =
  "/api/marketplace/stripe-connect/webhook" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_VENDOR_FINANCE_ROUTE = "/vendor/finance" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITY_COUNT = 4 as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_TEST_IDS = [
  "vendor-payout-webhook",
  "vendor-payout-connect-onboarding",
  "vendor-payout-payment-capture",
  "vendor-payout-transfer",
  "vendor-payout-webhook-events",
] as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_AUDIT_SCRIPT =
  "scripts/audit-vendor-payout-webhook-p2-121.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_NPM_SCRIPT = "audit:vendor-payout-webhook-p2-121" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_UNIT_TEST =
  "tests/unit/vendor-payout-webhook-p2-121.test.ts" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const VENDOR_PAYOUT_WEBHOOK_P2_121_WIRING_PATHS = [
  VENDOR_PAYOUT_WEBHOOK_P2_121_DOC,
  VENDOR_PAYOUT_WEBHOOK_P2_121_CONTENT_PATH,
  VENDOR_PAYOUT_WEBHOOK_P2_121_OPERATIONS_PATH,
  VENDOR_PAYOUT_WEBHOOK_P2_121_SERVICE_PATH,
  VENDOR_PAYOUT_WEBHOOK_P2_121_COMPONENT,
  VENDOR_PAYOUT_WEBHOOK_P2_121_PAGE,
  "lib/marketplace/vendor-payout-webhook-p2-121-policy.ts",
  "lib/marketplace/vendor-payout-webhook-p2-121-audit.ts",
  VENDOR_PAYOUT_WEBHOOK_P2_121_UNIT_TEST,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_STRIPE_CONNECT,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_WEBHOOK_ROUTE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_CONNECT_CONFIG,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_FINANCE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_VENDOR_API,
  VENDOR_PAYOUT_WEBHOOK_P2_121_LEGACY_INSTANT_PAYOUTS,
] as const;
