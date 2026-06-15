/**
 * Blueprint P2-116 — Vendor onboarding portal (catalog, tiers, zones, cutoff, MOQ).
 *
 * @see docs/vendor-onboarding-portal.md
 * @see app/dashboard/marketplace/vendor-onboarding/page.tsx
 */

export const VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID =
  "vendor-onboarding-portal-p2-116-v1" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_DOC =
  "docs/vendor-onboarding-portal.md" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_REGISTRATION =
  "services/marketplace/vendor-registration-service.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS =
  "services/marketplace/vendor-settings-service.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS_TYPES =
  "lib/marketplace/vendor-settings-types.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD =
  "lib/marketplace/vendor-dashboard-onboarding-wizard-policy.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD_COMPONENT =
  "components/marketplace/vendor-dashboard-onboarding-wizard.tsx" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_PRODUCTS =
  "services/marketplace/vendor-products-service.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_CONTENT_PATH =
  "lib/marketplace/vendor-onboarding-portal-p2-116-content.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_OPERATIONS_PATH =
  "lib/marketplace/vendor-onboarding-portal-p2-116-operations.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_SERVICE_PATH =
  "services/marketplace/vendor-onboarding-portal-p2-116-service.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_COMPONENT =
  "components/marketplace/vendor-onboarding-portal-panel.tsx" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_PAGE =
  "app/dashboard/marketplace/vendor-onboarding/page.tsx" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_ROUTE =
  "/dashboard/marketplace/vendor-onboarding" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_VENDOR_ROUTE = "/vendor" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITY_COUNT = 5 as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_TEST_IDS = [
  "vendor-onboarding-portal",
  "vendor-onboarding-catalog",
  "vendor-onboarding-pricing",
  "vendor-onboarding-zones",
  "vendor-onboarding-cutoff",
  "vendor-onboarding-moq",
] as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_AUDIT_SCRIPT =
  "scripts/audit-vendor-onboarding-portal-p2-116.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_NPM_SCRIPT =
  "audit:vendor-onboarding-portal-p2-116" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_UNIT_TEST =
  "tests/unit/vendor-onboarding-portal-p2-116.test.ts" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const VENDOR_ONBOARDING_PORTAL_P2_116_WIRING_PATHS = [
  VENDOR_ONBOARDING_PORTAL_P2_116_DOC,
  VENDOR_ONBOARDING_PORTAL_P2_116_CONTENT_PATH,
  VENDOR_ONBOARDING_PORTAL_P2_116_OPERATIONS_PATH,
  VENDOR_ONBOARDING_PORTAL_P2_116_SERVICE_PATH,
  VENDOR_ONBOARDING_PORTAL_P2_116_COMPONENT,
  VENDOR_ONBOARDING_PORTAL_P2_116_PAGE,
  "lib/marketplace/vendor-onboarding-portal-p2-116-policy.ts",
  "lib/marketplace/vendor-onboarding-portal-p2-116-audit.ts",
  VENDOR_ONBOARDING_PORTAL_P2_116_UNIT_TEST,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_REGISTRATION,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_SETTINGS_TYPES,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_WIZARD_COMPONENT,
  VENDOR_ONBOARDING_PORTAL_P2_116_LEGACY_PRODUCTS,
] as const;
