/**
 * Blueprint P2-101 — Allergen tracking (regulatory registry, recipe rollup, inventory linkage).
 *
 * @see docs/allergen-tracking.md
 * @see app/dashboard/inventory/allergen-tracking/page.tsx
 */

export const ALLERGEN_TRACKING_P2_101_POLICY_ID = "allergen-tracking-p2-101-v1" as const;

export const ALLERGEN_TRACKING_P2_101_DOC = "docs/allergen-tracking.md" as const;

export const ALLERGEN_TRACKING_P2_101_LEGACY_POLICY = "lib/nutrition/allergen-registry.ts" as const;

export const ALLERGEN_TRACKING_P2_101_CONTENT_PATH =
  "lib/inventory/allergen-tracking-p2-101-content.ts" as const;

export const ALLERGEN_TRACKING_P2_101_OPERATIONS_PATH =
  "lib/inventory/allergen-tracking-p2-101-operations.ts" as const;

export const ALLERGEN_TRACKING_P2_101_SERVICE_PATH =
  "services/inventory/allergen-tracking-p2-101-service.ts" as const;

export const ALLERGEN_TRACKING_P2_101_COMPONENT =
  "components/inventory/allergen-tracking-panel.tsx" as const;

export const ALLERGEN_TRACKING_P2_101_PAGE = "app/dashboard/inventory/allergen-tracking/page.tsx" as const;

export const ALLERGEN_TRACKING_P2_101_ROUTE = "/dashboard/inventory/allergen-tracking" as const;

export const ALLERGEN_TRACKING_P2_101_PROFILES_ROUTE = "/dashboard/menus/allergens" as const;

export const ALLERGEN_TRACKING_P2_101_CAPABILITY_COUNT = 3 as const;

export const ALLERGEN_TRACKING_P2_101_TEST_IDS = [
  "allergen-tracking",
  "allergen-regulatory-registry",
  "allergen-recipe-rollup",
  "allergen-inventory-linkage",
] as const;

export const ALLERGEN_TRACKING_P2_101_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "not certified",
  "operators must",
  "jurisdiction",
] as const;

export const ALLERGEN_TRACKING_P2_101_AUDIT_SCRIPT =
  "scripts/audit-allergen-tracking-p2-101.ts" as const;

export const ALLERGEN_TRACKING_P2_101_NPM_SCRIPT = "audit:allergen-tracking-p2-101" as const;

export const ALLERGEN_TRACKING_P2_101_UNIT_TEST =
  "tests/unit/allergen-tracking-p2-101.test.ts" as const;

export const ALLERGEN_TRACKING_P2_101_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const ALLERGEN_TRACKING_P2_101_WIRING_PATHS = [
  ALLERGEN_TRACKING_P2_101_DOC,
  ALLERGEN_TRACKING_P2_101_CONTENT_PATH,
  ALLERGEN_TRACKING_P2_101_OPERATIONS_PATH,
  ALLERGEN_TRACKING_P2_101_SERVICE_PATH,
  ALLERGEN_TRACKING_P2_101_COMPONENT,
  ALLERGEN_TRACKING_P2_101_PAGE,
  "lib/inventory/allergen-tracking-p2-101-policy.ts",
  "lib/inventory/allergen-tracking-p2-101-audit.ts",
  "services/allergen/allergen-service.ts",
  "actions/allergen-profile.ts",
  ALLERGEN_TRACKING_P2_101_UNIT_TEST,
  ALLERGEN_TRACKING_P2_101_LEGACY_POLICY,
] as const;
