/**
 * Blueprint P2-105 — Menu engineering (Stars / Plowhorses / Puzzles / Dogs matrix).
 *
 * @see docs/menu-engineering.md
 * @see app/dashboard/analytics/menu-engineering/page.tsx
 */

export const MENU_ENGINEERING_P2_105_POLICY_ID = "menu-engineering-p2-105-v1" as const;

export const MENU_ENGINEERING_P2_105_DOC = "docs/menu-engineering.md" as const;

export const MENU_ENGINEERING_P2_105_LEGACY_POLICY =
  "services/analytics/menu-engineering-service.ts" as const;

export const MENU_ENGINEERING_P2_105_LEGACY_PAGE =
  "app/dashboard/reports/menu-engineering/page.tsx" as const;

export const MENU_ENGINEERING_P2_105_CONTENT_PATH =
  "lib/analytics/menu-engineering-p2-105-content.ts" as const;

export const MENU_ENGINEERING_P2_105_OPERATIONS_PATH =
  "lib/analytics/menu-engineering-p2-105-operations.ts" as const;

export const MENU_ENGINEERING_P2_105_SERVICE_PATH =
  "services/analytics/menu-engineering-p2-105-service.ts" as const;

export const MENU_ENGINEERING_P2_105_COMPONENT =
  "components/analytics/menu-engineering-panel.tsx" as const;

export const MENU_ENGINEERING_P2_105_PAGE =
  "app/dashboard/analytics/menu-engineering/page.tsx" as const;

export const MENU_ENGINEERING_P2_105_ROUTE = "/dashboard/analytics/menu-engineering" as const;

export const MENU_ENGINEERING_P2_105_REPORTS_ROUTE =
  "/dashboard/reports/menu-engineering" as const;

export const MENU_ENGINEERING_P2_105_CAPABILITY_COUNT = 3 as const;

export const MENU_ENGINEERING_P2_105_TEST_IDS = [
  "menu-engineering",
  "menu-engineering-stars",
  "menu-engineering-plow-puzzle",
  "menu-engineering-dogs",
] as const;

export const MENU_ENGINEERING_P2_105_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const MENU_ENGINEERING_P2_105_AUDIT_SCRIPT =
  "scripts/audit-menu-engineering-p2-105.ts" as const;

export const MENU_ENGINEERING_P2_105_NPM_SCRIPT = "audit:menu-engineering-p2-105" as const;

export const MENU_ENGINEERING_P2_105_UNIT_TEST =
  "tests/unit/menu-engineering-p2-105.test.ts" as const;

export const MENU_ENGINEERING_P2_105_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const MENU_ENGINEERING_P2_105_WIRING_PATHS = [
  MENU_ENGINEERING_P2_105_DOC,
  MENU_ENGINEERING_P2_105_CONTENT_PATH,
  MENU_ENGINEERING_P2_105_OPERATIONS_PATH,
  MENU_ENGINEERING_P2_105_SERVICE_PATH,
  MENU_ENGINEERING_P2_105_COMPONENT,
  MENU_ENGINEERING_P2_105_PAGE,
  "lib/analytics/menu-engineering-p2-105-policy.ts",
  "lib/analytics/menu-engineering-p2-105-audit.ts",
  MENU_ENGINEERING_P2_105_UNIT_TEST,
  MENU_ENGINEERING_P2_105_LEGACY_POLICY,
  MENU_ENGINEERING_P2_105_LEGACY_PAGE,
] as const;
