/**
 * Blueprint P2-45 — Delivery routing optimization (Olo parity).
 *
 * minimize delivery time · driver tracking widget · dispatch optimization
 *
 * @see docs/delivery-routing-optimization-p2-45.md
 */

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_POLICY_ID =
  "delivery-routing-optimization-p2-45-v1" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_DOC =
  "docs/delivery-routing-optimization-p2-45.md" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_ARTIFACT =
  "artifacts/delivery-routing-optimization-p2-45-registry.json" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_OPTIMIZE_ROUTE =
  "/dashboard/routes/optimize" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTES_ROUTE = "/dashboard/routes" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_DISPATCH_PANEL =
  "components/dashboard/routes/dispatch-optimization-panel.tsx" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_DRIVER_WIDGET =
  "components/dashboard/routes/driver-tracking-widget.tsx" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_OPTIMIZATION_SERVICE =
  "services/delivery/delivery-dispatch-optimization-service.ts" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_TRACKING_SERVICE =
  "services/delivery/delivery-routing-optimization-p2-45-service.ts" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTES_PAGE =
  "app/dashboard/routes/page.tsx" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_WIDGET_TEST_ID = "driver-tracking-widget" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTE_ROW_TEST_ID =
  "driver-tracking-route-row" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_AUDIT_SCRIPT =
  "scripts/audit-delivery-routing-optimization-p2-45.ts" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_NPM_SCRIPT =
  "audit:delivery-routing-optimization-p2-45" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_CHECK_NPM_SCRIPT =
  "check:delivery-routing-optimization-p2-45" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_UNIT_TEST =
  "tests/unit/delivery-routing-optimization-p2-45.test.ts" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_FLOW_STEPS = [
  "optimize_stop_order",
  "minimize_drive_time",
  "track_driver_progress",
  "driver_handoff",
] as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_HONESTY_MARKERS = [
  "Olo parity",
  "minimize delivery time",
  "driver tracking",
  "heuristic",
] as const;

export const DELIVERY_ROUTING_OPTIMIZATION_P2_45_WIRING_PATHS = [
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_DOC,
  "lib/delivery/delivery-routing-optimization-p2-45-audit.ts",
  "lib/delivery/delivery-routing-optimization-p2-45-measurement.ts",
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_TRACKING_SERVICE,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_DRIVER_WIDGET,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_UNIT_TEST,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_ARTIFACT,
] as const;
