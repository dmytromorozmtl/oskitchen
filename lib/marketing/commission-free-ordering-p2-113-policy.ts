/**
 * Blueprint P2-113 — Commission-free ordering messaging (storefront + Stripe).
 *
 * @see docs/commission-free-ordering-messaging.md
 * @see app/dashboard/marketing/commission-free-ordering/page.tsx
 */

export const COMMISSION_FREE_ORDERING_P2_113_POLICY_ID =
  "commission-free-ordering-p2-113-v1" as const;

export const COMMISSION_FREE_ORDERING_P2_113_DOC =
  "docs/commission-free-ordering-messaging.md" as const;

export const COMMISSION_FREE_ORDERING_P2_113_LEGACY_STRIPE =
  "lib/storefront/stripe-readiness.ts" as const;

export const COMMISSION_FREE_ORDERING_P2_113_LEGACY_PAYMENT =
  "services/storefront/storefront-payment-service.ts" as const;

export const COMMISSION_FREE_ORDERING_P2_113_LEGACY_ORDERING =
  "app/dashboard/storefront/ordering/page.tsx" as const;

export const COMMISSION_FREE_ORDERING_P2_113_LEGACY_OWN_CHANNEL =
  "lib/marketing/own-your-channel-upsell-content.ts" as const;

export const COMMISSION_FREE_ORDERING_P2_113_CONTENT_PATH =
  "lib/marketing/commission-free-ordering-p2-113-content.ts" as const;

export const COMMISSION_FREE_ORDERING_P2_113_OPERATIONS_PATH =
  "lib/marketing/commission-free-ordering-p2-113-operations.ts" as const;

export const COMMISSION_FREE_ORDERING_P2_113_SERVICE_PATH =
  "services/marketing/commission-free-ordering-p2-113-service.ts" as const;

export const COMMISSION_FREE_ORDERING_P2_113_COMPONENT =
  "components/marketing/commission-free-ordering-panel.tsx" as const;

export const COMMISSION_FREE_ORDERING_P2_113_PAGE =
  "app/dashboard/marketing/commission-free-ordering/page.tsx" as const;

export const COMMISSION_FREE_ORDERING_P2_113_ROUTE =
  "/dashboard/marketing/commission-free-ordering" as const;

export const COMMISSION_FREE_ORDERING_P2_113_STOREFRONT_ROUTE =
  "/dashboard/storefront/ordering" as const;

export const COMMISSION_FREE_ORDERING_P2_113_OWN_CHANNEL_ROUTE = "/own-your-channel" as const;

export const COMMISSION_FREE_ORDERING_P2_113_MESSAGE_COUNT = 3 as const;

export const COMMISSION_FREE_ORDERING_P2_113_TEST_IDS = [
  "commission-free-ordering",
  "commission-free-storefront",
  "commission-free-stripe",
  "commission-free-compare",
] as const;

export const COMMISSION_FREE_ORDERING_P2_113_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const COMMISSION_FREE_ORDERING_P2_113_AUDIT_SCRIPT =
  "scripts/audit-commission-free-ordering-p2-113.ts" as const;

export const COMMISSION_FREE_ORDERING_P2_113_NPM_SCRIPT =
  "audit:commission-free-ordering-p2-113" as const;

export const COMMISSION_FREE_ORDERING_P2_113_UNIT_TEST =
  "tests/unit/commission-free-ordering-p2-113.test.ts" as const;

export const COMMISSION_FREE_ORDERING_P2_113_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const COMMISSION_FREE_ORDERING_P2_113_WIRING_PATHS = [
  COMMISSION_FREE_ORDERING_P2_113_DOC,
  COMMISSION_FREE_ORDERING_P2_113_CONTENT_PATH,
  COMMISSION_FREE_ORDERING_P2_113_OPERATIONS_PATH,
  COMMISSION_FREE_ORDERING_P2_113_SERVICE_PATH,
  COMMISSION_FREE_ORDERING_P2_113_COMPONENT,
  COMMISSION_FREE_ORDERING_P2_113_PAGE,
  "lib/marketing/commission-free-ordering-p2-113-policy.ts",
  "lib/marketing/commission-free-ordering-p2-113-audit.ts",
  COMMISSION_FREE_ORDERING_P2_113_UNIT_TEST,
  COMMISSION_FREE_ORDERING_P2_113_LEGACY_STRIPE,
  COMMISSION_FREE_ORDERING_P2_113_LEGACY_PAYMENT,
  COMMISSION_FREE_ORDERING_P2_113_LEGACY_ORDERING,
  COMMISSION_FREE_ORDERING_P2_113_LEGACY_OWN_CHANNEL,
] as const;
