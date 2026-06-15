/**
 * Blueprint P2-120 — Marketplace trust system.
 *
 * @see docs/marketplace-trust-system.md
 * @see app/dashboard/marketplace/trust/page.tsx
 */

export const MARKETPLACE_TRUST_P2_120_POLICY_ID = "marketplace-trust-p2-120-v1" as const;

export const MARKETPLACE_TRUST_P2_120_DOC = "docs/marketplace-trust-system.md" as const;

export const MARKETPLACE_TRUST_P2_120_LEGACY_VENDOR_MODERATION =
  "services/marketplace/platform-vendor-moderation-service.ts" as const;

export const MARKETPLACE_TRUST_P2_120_LEGACY_VENDORS =
  "services/marketplace/marketplace-vendors-service.ts" as const;

export const MARKETPLACE_TRUST_P2_120_LEGACY_QUALITY =
  "services/marketplace/quality-scoring.ts" as const;

export const MARKETPLACE_TRUST_P2_120_LEGACY_DISPUTES =
  "services/marketplace/platform-dispute-resolution-service.ts" as const;

export const MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST =
  "lib/marketplace/marketplace-checkout-trust-policy.ts" as const;

export const MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST_COMPONENT =
  "components/marketplace/marketplace-checkout-trust-strip.tsx" as const;

export const MARKETPLACE_TRUST_P2_120_CONTENT_PATH =
  "lib/marketplace/marketplace-trust-p2-120-content.ts" as const;

export const MARKETPLACE_TRUST_P2_120_OPERATIONS_PATH =
  "lib/marketplace/marketplace-trust-p2-120-operations.ts" as const;

export const MARKETPLACE_TRUST_P2_120_SERVICE_PATH =
  "services/marketplace/marketplace-trust-p2-120-service.ts" as const;

export const MARKETPLACE_TRUST_P2_120_COMPONENT =
  "components/marketplace/marketplace-trust-panel.tsx" as const;

export const MARKETPLACE_TRUST_P2_120_PAGE =
  "app/dashboard/marketplace/trust/page.tsx" as const;

export const MARKETPLACE_TRUST_P2_120_ROUTE = "/dashboard/marketplace/trust" as const;

export const MARKETPLACE_TRUST_P2_120_VENDORS_ROUTE = "/dashboard/marketplace/vendors" as const;

export const MARKETPLACE_TRUST_P2_120_QUALITY_ROUTE = "/dashboard/marketplace/quality" as const;

export const MARKETPLACE_TRUST_P2_120_ORDERS_ROUTE = "/dashboard/marketplace/orders" as const;

export const MARKETPLACE_TRUST_P2_120_PUBLIC_TRUST_ROUTE = "/trust" as const;

export const MARKETPLACE_TRUST_P2_120_CAPABILITY_COUNT = 4 as const;

export const MARKETPLACE_TRUST_P2_120_TEST_IDS = [
  "marketplace-trust",
  "marketplace-trust-verified-badge",
  "marketplace-trust-sla",
  "marketplace-trust-reviews",
  "marketplace-trust-disputes",
] as const;

export const MARKETPLACE_TRUST_P2_120_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const MARKETPLACE_TRUST_P2_120_AUDIT_SCRIPT =
  "scripts/audit-marketplace-trust-p2-120.ts" as const;

export const MARKETPLACE_TRUST_P2_120_NPM_SCRIPT = "audit:marketplace-trust-p2-120" as const;

export const MARKETPLACE_TRUST_P2_120_UNIT_TEST =
  "tests/unit/marketplace-trust-p2-120.test.ts" as const;

export const MARKETPLACE_TRUST_P2_120_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const MARKETPLACE_TRUST_P2_120_WIRING_PATHS = [
  MARKETPLACE_TRUST_P2_120_DOC,
  MARKETPLACE_TRUST_P2_120_CONTENT_PATH,
  MARKETPLACE_TRUST_P2_120_OPERATIONS_PATH,
  MARKETPLACE_TRUST_P2_120_SERVICE_PATH,
  MARKETPLACE_TRUST_P2_120_COMPONENT,
  MARKETPLACE_TRUST_P2_120_PAGE,
  "lib/marketplace/marketplace-trust-p2-120-policy.ts",
  "lib/marketplace/marketplace-trust-p2-120-audit.ts",
  MARKETPLACE_TRUST_P2_120_UNIT_TEST,
  MARKETPLACE_TRUST_P2_120_LEGACY_VENDOR_MODERATION,
  MARKETPLACE_TRUST_P2_120_LEGACY_VENDORS,
  MARKETPLACE_TRUST_P2_120_LEGACY_QUALITY,
  MARKETPLACE_TRUST_P2_120_LEGACY_DISPUTES,
  MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST,
  MARKETPLACE_TRUST_P2_120_LEGACY_CHECKOUT_TRUST_COMPONENT,
] as const;
