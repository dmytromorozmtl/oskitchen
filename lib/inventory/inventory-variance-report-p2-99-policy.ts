/**
 * Blueprint P2-99 — Inventory variance report (expected vs actual, theft/spoilage, waste).
 *
 * @see docs/inventory-variance-report.md
 * @see app/dashboard/inventory/variance-report/page.tsx
 */

export const INVENTORY_VARIANCE_REPORT_P2_99_POLICY_ID =
  "inventory-variance-report-p2-99-v1" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_DOC = "docs/inventory-variance-report.md" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_LEGACY_POLICY =
  "services/inventory/count-service.ts" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_CONTENT_PATH =
  "lib/inventory/inventory-variance-report-p2-99-content.ts" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_OPERATIONS_PATH =
  "lib/inventory/inventory-variance-report-p2-99-operations.ts" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_SERVICE_PATH =
  "services/inventory/inventory-variance-report-p2-99-service.ts" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_COMPONENT =
  "components/inventory/inventory-variance-report-panel.tsx" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_PAGE =
  "app/dashboard/inventory/variance-report/page.tsx" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_ROUTE = "/dashboard/inventory/variance-report" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_MANAGER_ROUTE =
  "/dashboard/inventory/manager" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_COUNTS_ROUTE = "/dashboard/inventory/counts" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_CAPABILITY_COUNT = 3 as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_TEST_IDS = [
  "inventory-variance-report",
  "inventory-variance-expected-actual",
  "inventory-variance-theft-spoilage",
  "inventory-variance-waste-tracking",
] as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_AUDIT_SCRIPT =
  "scripts/audit-inventory-variance-report-p2-99.ts" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_NPM_SCRIPT =
  "audit:inventory-variance-report-p2-99" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_UNIT_TEST =
  "tests/unit/inventory-variance-report-p2-99.test.ts" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const INVENTORY_VARIANCE_REPORT_P2_99_WIRING_PATHS = [
  INVENTORY_VARIANCE_REPORT_P2_99_DOC,
  INVENTORY_VARIANCE_REPORT_P2_99_CONTENT_PATH,
  INVENTORY_VARIANCE_REPORT_P2_99_OPERATIONS_PATH,
  INVENTORY_VARIANCE_REPORT_P2_99_SERVICE_PATH,
  INVENTORY_VARIANCE_REPORT_P2_99_COMPONENT,
  INVENTORY_VARIANCE_REPORT_P2_99_PAGE,
  "lib/inventory/inventory-variance-report-p2-99-policy.ts",
  "lib/inventory/inventory-variance-report-p2-99-audit.ts",
  "lib/inventory/format-count-variance.ts",
  "lib/ai/inventory-manager-builders.ts",
  "services/ai/inventory-manager.ts",
  INVENTORY_VARIANCE_REPORT_P2_99_UNIT_TEST,
  INVENTORY_VARIANCE_REPORT_P2_99_LEGACY_POLICY,
] as const;
