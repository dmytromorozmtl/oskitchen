/**
 * Blueprint P2-89 — Table service depth (split bills, merge, transfer, tabs, bar, banking, tips).
 *
 * @see docs/table-service-depth.md
 * @see app/dashboard/pos/table-service/page.tsx
 */

export const TABLE_SERVICE_DEPTH_POLICY_ID = "table-service-depth-p2-89-v1" as const;

export const TABLE_SERVICE_DEPTH_DOC = "docs/table-service-depth.md" as const;

export const TABLE_SERVICE_DEPTH_LEGACY_DOC = "docs/BILL_SPLITTING.md" as const;

export const TABLE_SERVICE_DEPTH_CONTENT_PATH =
  "lib/pos/table-service-depth-content.ts" as const;

export const TABLE_SERVICE_DEPTH_OPERATIONS_PATH =
  "lib/pos/table-service-depth-operations.ts" as const;

export const TABLE_SERVICE_DEPTH_SERVICE_PATH =
  "services/pos/table-service-depth-service.ts" as const;

export const TABLE_SERVICE_DEPTH_COMPONENT =
  "components/pos/table-service-depth-panel.tsx" as const;

export const TABLE_SERVICE_DEPTH_PAGE = "app/dashboard/pos/table-service/page.tsx" as const;

export const TABLE_SERVICE_DEPTH_ROUTE = "/dashboard/pos/table-service" as const;

export const TABLE_SERVICE_DEPTH_CAPABILITY_COUNT = 7 as const;

export const TABLE_SERVICE_DEPTH_TEST_IDS = [
  "table-service-depth",
  "table-service-split-bills",
  "table-service-merge-tables",
  "table-service-transfer-seats",
  "table-service-tabs",
  "table-service-bar-mode",
  "table-service-server-banking",
  "table-service-tips-reconciliation",
] as const;

export const TABLE_SERVICE_DEPTH_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "not production-ready",
  "guidance",
  "typical",
] as const;

export const TABLE_SERVICE_DEPTH_AUDIT_SCRIPT = "scripts/audit-table-service-depth.ts" as const;

export const TABLE_SERVICE_DEPTH_NPM_SCRIPT = "audit:table-service-depth" as const;

export const TABLE_SERVICE_DEPTH_UNIT_TEST = "tests/unit/table-service-depth.test.ts" as const;

export const TABLE_SERVICE_DEPTH_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const TABLE_SERVICE_DEPTH_WIRING_PATHS = [
  TABLE_SERVICE_DEPTH_DOC,
  TABLE_SERVICE_DEPTH_CONTENT_PATH,
  TABLE_SERVICE_DEPTH_OPERATIONS_PATH,
  TABLE_SERVICE_DEPTH_SERVICE_PATH,
  TABLE_SERVICE_DEPTH_COMPONENT,
  TABLE_SERVICE_DEPTH_PAGE,
  "lib/pos/table-service-depth-policy.ts",
  "lib/pos/table-service-depth-audit.ts",
  "actions/pos/table-service-depth.ts",
  "lib/pos/bill-splitting.ts",
  "services/pos/tab-service.ts",
  TABLE_SERVICE_DEPTH_UNIT_TEST,
  TABLE_SERVICE_DEPTH_LEGACY_DOC,
] as const;
