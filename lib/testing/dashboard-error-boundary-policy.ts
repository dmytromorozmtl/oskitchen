/**
 * Absolute Final Task 18 — top-20 pilot-critical dashboard error boundaries.
 */

export const DASHBOARD_ERROR_BOUNDARY_POLICY_ID =
  "absolute-final-dashboard-error-boundary-v1" as const;

/** Top-20 pilot-critical dashboard routes (P0 audit + Task 4). */
export const CRITICAL_DASHBOARD_ERROR_ROUTES = [
  "app/dashboard/today/error.tsx",
  "app/dashboard/marketplace/error.tsx",
  "app/dashboard/pos/terminal/error.tsx",
  "app/dashboard/kitchen/error.tsx",
  "app/dashboard/command-center/error.tsx",
  "app/dashboard/analytics/suite/error.tsx",
  "app/dashboard/ai/co-pilot/error.tsx",
  "app/dashboard/enterprise/multi-location/error.tsx",
  "app/dashboard/roles/owner/error.tsx",
  "app/dashboard/menus/error.tsx",
  "app/dashboard/quick-start/error.tsx",
  "app/dashboard/qr-codes/error.tsx",
  "app/dashboard/today/profit/error.tsx",
  "app/dashboard/enterprise/multi-brand/error.tsx",
  "app/dashboard/enterprise/commissary/error.tsx",
  "app/dashboard/catering/error.tsx",
  "app/dashboard/meal-prep/error.tsx",
  "app/dashboard/inventory/invoice-scanner/error.tsx",
  "app/dashboard/finance/bank-import/error.tsx",
  "app/dashboard/loyalty/program-builder/error.tsx",
] as const;

export const CRITICAL_DASHBOARD_ERROR_ROUTE_COUNT =
  CRITICAL_DASHBOARD_ERROR_ROUTES.length;

export const DASHBOARD_ERROR_BOUNDARY_UNIT_TESTS = [
  "tests/unit/critical-dashboard-error-boundaries.test.ts",
  "tests/unit/dashboard-error-boundary-render.test.ts",
] as const;

export const DASHBOARD_ERROR_BOUNDARY_CI_SCRIPTS = [
  "test:ci:dashboard-error-boundaries",
] as const;

export function dashboardErrorModulePath(routeFile: string): string {
  return `@/${routeFile.replace(/\.tsx$/, "")}`;
}
