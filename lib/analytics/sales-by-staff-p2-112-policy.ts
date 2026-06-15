/**
 * Blueprint P2-112 — Sales-by-staff analytics (sales by server, avg check per shift).
 *
 * @see docs/sales-by-staff-analytics.md
 * @see app/dashboard/analytics/sales-by-staff/page.tsx
 */

export const SALES_BY_STAFF_P2_112_POLICY_ID = "sales-by-staff-p2-112-v1" as const;

export const SALES_BY_STAFF_P2_112_DOC = "docs/sales-by-staff-analytics.md" as const;

export const SALES_BY_STAFF_P2_112_LEGACY_CHECKOUT =
  "services/pos/pos-checkout-service.ts" as const;

export const SALES_BY_STAFF_P2_112_LEGACY_SHIFT =
  "services/pos/pos-shift-service.ts" as const;

export const SALES_BY_STAFF_P2_112_LEGACY_CLOSEOUT =
  "lib/pos/pos-shift-closeout-math.ts" as const;

export const SALES_BY_STAFF_P2_112_CONTENT_PATH =
  "lib/analytics/sales-by-staff-p2-112-content.ts" as const;

export const SALES_BY_STAFF_P2_112_OPERATIONS_PATH =
  "lib/analytics/sales-by-staff-p2-112-operations.ts" as const;

export const SALES_BY_STAFF_P2_112_SERVICE_PATH =
  "services/analytics/sales-by-staff-p2-112-service.ts" as const;

export const SALES_BY_STAFF_P2_112_COMPONENT =
  "components/analytics/sales-by-staff-panel.tsx" as const;

export const SALES_BY_STAFF_P2_112_PAGE =
  "app/dashboard/analytics/sales-by-staff/page.tsx" as const;

export const SALES_BY_STAFF_P2_112_ROUTE = "/dashboard/analytics/sales-by-staff" as const;

export const SALES_BY_STAFF_P2_112_POS_ROUTE = "/dashboard/pos/terminal" as const;

export const SALES_BY_STAFF_P2_112_CAPABILITY_COUNT = 3 as const;

export const SALES_BY_STAFF_P2_112_TEST_IDS = [
  "sales-by-staff",
  "sales-by-staff-server-sales",
  "sales-by-staff-avg-check",
  "sales-by-staff-leaderboard",
] as const;

export const SALES_BY_STAFF_P2_112_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const SALES_BY_STAFF_P2_112_AUDIT_SCRIPT =
  "scripts/audit-sales-by-staff-p2-112.ts" as const;

export const SALES_BY_STAFF_P2_112_NPM_SCRIPT = "audit:sales-by-staff-p2-112" as const;

export const SALES_BY_STAFF_P2_112_UNIT_TEST =
  "tests/unit/sales-by-staff-p2-112.test.ts" as const;

export const SALES_BY_STAFF_P2_112_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const SALES_BY_STAFF_P2_112_WIRING_PATHS = [
  SALES_BY_STAFF_P2_112_DOC,
  SALES_BY_STAFF_P2_112_CONTENT_PATH,
  SALES_BY_STAFF_P2_112_OPERATIONS_PATH,
  SALES_BY_STAFF_P2_112_SERVICE_PATH,
  SALES_BY_STAFF_P2_112_COMPONENT,
  SALES_BY_STAFF_P2_112_PAGE,
  "lib/analytics/sales-by-staff-p2-112-policy.ts",
  "lib/analytics/sales-by-staff-p2-112-audit.ts",
  SALES_BY_STAFF_P2_112_UNIT_TEST,
  SALES_BY_STAFF_P2_112_LEGACY_CHECKOUT,
  SALES_BY_STAFF_P2_112_LEGACY_SHIFT,
  SALES_BY_STAFF_P2_112_LEGACY_CLOSEOUT,
] as const;
