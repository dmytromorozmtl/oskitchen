/**
 * Blueprint P2-114 — Route optimization engine (delivery routing for drivers).
 *
 * @see docs/route-optimization-engine.md
 * @see app/dashboard/delivery/route-optimization/page.tsx
 */

export const ROUTE_OPTIMIZATION_P2_114_POLICY_ID = "route-optimization-p2-114-v1" as const;

export const ROUTE_OPTIMIZATION_P2_114_DOC = "docs/route-optimization-engine.md" as const;

export const ROUTE_OPTIMIZATION_P2_114_LEGACY_ROUTES =
  "services/delivery/route-optimization-service.ts" as const;

export const ROUTE_OPTIMIZATION_P2_114_LEGACY_DISPATCH =
  "services/delivery/delivery-dispatch-optimization-service.ts" as const;

export const ROUTE_OPTIMIZATION_P2_114_LEGACY_POLICY =
  "lib/delivery/delivery-dispatch-optimization-policy.ts" as const;

export const ROUTE_OPTIMIZATION_P2_114_LEGACY_PANEL =
  "components/dashboard/routes/dispatch-optimization-panel.tsx" as const;

export const ROUTE_OPTIMIZATION_P2_114_LEGACY_OPTIMIZE_PAGE =
  "app/dashboard/routes/optimize/page.tsx" as const;

export const ROUTE_OPTIMIZATION_P2_114_CONTENT_PATH =
  "lib/delivery/route-optimization-p2-114-content.ts" as const;

export const ROUTE_OPTIMIZATION_P2_114_OPERATIONS_PATH =
  "lib/delivery/route-optimization-p2-114-operations.ts" as const;

export const ROUTE_OPTIMIZATION_P2_114_SERVICE_PATH =
  "services/delivery/route-optimization-p2-114-service.ts" as const;

export const ROUTE_OPTIMIZATION_P2_114_COMPONENT =
  "components/delivery/route-optimization-panel.tsx" as const;

export const ROUTE_OPTIMIZATION_P2_114_PAGE =
  "app/dashboard/delivery/route-optimization/page.tsx" as const;

export const ROUTE_OPTIMIZATION_P2_114_ROUTE =
  "/dashboard/delivery/route-optimization" as const;

export const ROUTE_OPTIMIZATION_P2_114_PLANNER_ROUTE = "/dashboard/routes/planner" as const;

export const ROUTE_OPTIMIZATION_P2_114_OPTIMIZE_ROUTE = "/dashboard/routes/optimize" as const;

export const ROUTE_OPTIMIZATION_P2_114_CAPABILITY_COUNT = 3 as const;

export const ROUTE_OPTIMIZATION_P2_114_TEST_IDS = [
  "route-optimization",
  "route-optimization-stops",
  "route-optimization-driver",
  "route-optimization-savings",
] as const;

export const ROUTE_OPTIMIZATION_P2_114_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const ROUTE_OPTIMIZATION_P2_114_AUDIT_SCRIPT =
  "scripts/audit-route-optimization-p2-114.ts" as const;

export const ROUTE_OPTIMIZATION_P2_114_NPM_SCRIPT = "audit:route-optimization-p2-114" as const;

export const ROUTE_OPTIMIZATION_P2_114_UNIT_TEST =
  "tests/unit/route-optimization-p2-114.test.ts" as const;

export const ROUTE_OPTIMIZATION_P2_114_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const ROUTE_OPTIMIZATION_P2_114_WIRING_PATHS = [
  ROUTE_OPTIMIZATION_P2_114_DOC,
  ROUTE_OPTIMIZATION_P2_114_CONTENT_PATH,
  ROUTE_OPTIMIZATION_P2_114_OPERATIONS_PATH,
  ROUTE_OPTIMIZATION_P2_114_SERVICE_PATH,
  ROUTE_OPTIMIZATION_P2_114_COMPONENT,
  ROUTE_OPTIMIZATION_P2_114_PAGE,
  "lib/delivery/route-optimization-p2-114-policy.ts",
  "lib/delivery/route-optimization-p2-114-audit.ts",
  ROUTE_OPTIMIZATION_P2_114_UNIT_TEST,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_ROUTES,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_DISPATCH,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_POLICY,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_PANEL,
  ROUTE_OPTIMIZATION_P2_114_LEGACY_OPTIMIZE_PAGE,
] as const;
