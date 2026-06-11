/**
 * Blueprint P1-22 — All dashboard page routes must have error.tsx using ErrorBoundaryTemplate.
 */

export const DASHBOARD_ERROR_BOUNDARIES_BLUEPRINT_POLICY_ID =
  "dashboard-error-boundaries-blueprint-v1" as const;

export const DASHBOARD_ERROR_BOUNDARY_TEMPLATE =
  "components/dashboard/error-boundary-template.tsx" as const;

export const DASHBOARD_ERROR_BOUNDARIES_SCAFFOLD_SCRIPT =
  "scripts/scaffold-dashboard-error-boundaries.ts" as const;

export const DASHBOARD_ERROR_BOUNDARIES_AUDIT_SCRIPT =
  "scripts/audit-dashboard-error-boundaries.ts" as const;

export const DASHBOARD_ERROR_BOUNDARIES_UNIT_TEST =
  "tests/unit/dashboard-error-boundaries-blueprint.test.ts" as const;

export const DASHBOARD_ERROR_BOUNDARIES_CI_NPM_SCRIPT =
  "test:ci:dashboard-error-boundaries-blueprint" as const;

export const DASHBOARD_ERROR_BOUNDARIES_AUDIT_ARTIFACT =
  "artifacts/dashboard-error-boundaries-audit.json" as const;

export const DASHBOARD_ERROR_BOUNDARY_ROUTE_FILE = "error.tsx" as const;

export const DASHBOARD_ERROR_BOUNDARY_SOURCE_MARKER = "ErrorBoundaryTemplate" as const;
