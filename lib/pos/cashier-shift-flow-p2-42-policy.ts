/**
 * Blueprint P2-42 — Cashier shift flow (Square parity).
 *
 * open → assign drawer → cash count → close → report
 *
 * @see docs/cashier-shift-flow-p2-42.md
 */

export const CASHIER_SHIFT_FLOW_P2_42_POLICY_ID = "cashier-shift-flow-p2-42-v1" as const;

export const CASHIER_SHIFT_FLOW_P2_42_DOC = "docs/cashier-shift-flow-p2-42.md" as const;

export const CASHIER_SHIFT_FLOW_P2_42_ARTIFACT =
  "artifacts/cashier-shift-flow-p2-42-registry.json" as const;

export const CASHIER_SHIFT_FLOW_P2_42_ROUTE = "/dashboard/pos/cash" as const;

export const CASHIER_SHIFT_FLOW_P2_42_SHIFTS_ROUTE = "/dashboard/pos/shifts" as const;

export const CASHIER_SHIFT_FLOW_P2_42_CASH_CLIENT =
  "components/pos/pos-cash-management-client.tsx" as const;

export const CASHIER_SHIFT_FLOW_P2_42_CASH_PAGE = "app/dashboard/pos/cash/page.tsx" as const;

export const CASHIER_SHIFT_FLOW_P2_42_SHIFT_SERVICE = "services/pos/pos-shift-service.ts" as const;

export const CASHIER_SHIFT_FLOW_P2_42_COUNT_SERVICE =
  "services/pos/pos-cash-count-service.ts" as const;

export const CASHIER_SHIFT_FLOW_P2_42_EXPORT_ROUTE = "app/api/pos/shifts/export/route.ts" as const;

export const CASHIER_SHIFT_FLOW_P2_42_ROOT_TEST_ID = "pos-cash-management-root" as const;

export const CASHIER_SHIFT_FLOW_P2_42_ASSIGN_DRAWER_TEST_ID = "pos-cash-assign-drawer" as const;

export const CASHIER_SHIFT_FLOW_P2_42_FLOW_LINK_TEST_ID = "cashier-shift-flow-link" as const;

export const CASHIER_SHIFT_FLOW_P2_42_AUDIT_SCRIPT =
  "scripts/audit-cashier-shift-flow-p2-42.ts" as const;

export const CASHIER_SHIFT_FLOW_P2_42_NPM_SCRIPT = "audit:cashier-shift-flow-p2-42" as const;

export const CASHIER_SHIFT_FLOW_P2_42_CHECK_NPM_SCRIPT = "check:cashier-shift-flow-p2-42" as const;

export const CASHIER_SHIFT_FLOW_P2_42_UNIT_TEST =
  "tests/unit/cashier-shift-flow-p2-42.test.ts" as const;

export const CASHIER_SHIFT_FLOW_P2_42_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const CASHIER_SHIFT_FLOW_P2_42_FLOW_STEPS = [
  "open_shift",
  "assign_drawer",
  "cash_count",
  "close_shift",
  "shift_report",
] as const;

export const CASHIER_SHIFT_FLOW_P2_42_HONESTY_MARKERS = [
  "Square parity",
  "assign drawer",
  "cash count",
  "close",
  "report",
] as const;

export const CASHIER_SHIFT_FLOW_P2_42_WIRING_PATHS = [
  CASHIER_SHIFT_FLOW_P2_42_DOC,
  "lib/pos/cashier-shift-flow-p2-42-audit.ts",
  "lib/pos/pos-cash-management.ts",
  CASHIER_SHIFT_FLOW_P2_42_CASH_CLIENT,
  CASHIER_SHIFT_FLOW_P2_42_SHIFT_SERVICE,
  CASHIER_SHIFT_FLOW_P2_42_COUNT_SERVICE,
  CASHIER_SHIFT_FLOW_P2_42_UNIT_TEST,
  CASHIER_SHIFT_FLOW_P2_42_ARTIFACT,
] as const;
