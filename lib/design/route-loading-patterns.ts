/**
 * DES-36 — canonical spinner route-loading patterns (complements DES-28 skeletons).
 *
 * @see lib/design/route-loading-audit-policy.ts
 * @see components/feedback/loading-state.tsx
 * @see components/dashboard/route-states.tsx
 */

export const ROUTE_LOADING_PATTERNS_POLICY_ID = "route-loading-patterns-des36-v1" as const;

export const ROUTE_LOADING_TEST_ID = "route-loading" as const;

export const ROUTE_LOADING_MIN_HEIGHT_CLASS = "min-h-[400px]" as const;

/** Spinner-based route loading.tsx files audited (DES-36). */
export const ROUTE_LOADING_CRITICAL_MODULES = [
  "components/feedback/loading-state.tsx",
  "components/dashboard/route-states.tsx",
  "components/dashboard/pilot-route-states.tsx",
  "app/dashboard/analytics/advanced/loading.tsx",
  "app/dashboard/food-safety/temperature/loading.tsx",
  "app/dashboard/reports/financial/pnl/loading.tsx",
] as const;

/**
 * Full-screen operator terminal spinner — exempt when documented.
 * Must include ROUTE_LOADING_EXCEPTION in source.
 */
export const ROUTE_LOADING_EXCEPTION_MODULES = [
  "app/dashboard/pos/terminal/loading.tsx",
] as const;

export const ROUTE_LOADING_EXCEPTION_MARKER = "ROUTE_LOADING_EXCEPTION" as const;

export const ROUTE_LOADING_IMPORT = "@/components/feedback/loading-state" as const;

export const ROUTE_LOADING_STATES_IMPORT = "@/components/dashboard/route-states" as const;

export const ROUTE_LOADING_PILOT_IMPORT = "@/components/dashboard/pilot-route-states" as const;

export const ROUTE_LOADING_PRIMITIVE_PATTERN =
  /LoadingState|RouteLoading|RouteLoadingSimple|PilotRouteLoading/;

export type RouteLoadingCriticalModule = (typeof ROUTE_LOADING_CRITICAL_MODULES)[number];
