/**
 * Blueprint P3-147 — Delivery orchestration (Olo parity baseline).
 *
 * @see docs/delivery-orchestration-olo.md
 */

export const DELIVERY_ORCHESTRATION_P3_147_POLICY_ID =
  "delivery-orchestration-p3-147-v1" as const;

export const DELIVERY_ORCHESTRATION_P3_147_DOC = "docs/delivery-orchestration-olo.md" as const;

export const DELIVERY_ORCHESTRATION_P3_147_ARTIFACT =
  "artifacts/delivery-orchestration-olo-registry.json" as const;

export const DELIVERY_ORCHESTRATION_P3_147_AUDIT_SCRIPT =
  "scripts/audit-delivery-orchestration-p3-147.ts" as const;

export const DELIVERY_ORCHESTRATION_P3_147_NPM_SCRIPT =
  "audit:delivery-orchestration-p3-147" as const;

export const DELIVERY_ORCHESTRATION_P3_147_UNIT_TEST =
  "tests/unit/delivery-orchestration-p3-147.test.ts" as const;

export const DELIVERY_ORCHESTRATION_P3_147_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const DELIVERY_ORCHESTRATION_P3_147_COMPETITOR = "olo" as const;

export const DELIVERY_ORCHESTRATION_P3_147_POSITIONING_LINE =
  "Own your storefront and kitchen — not Olo dispatch network." as const;

export const DELIVERY_ORCHESTRATION_P3_147_HEADLINE =
  "Delivery orchestration — Olo parity baseline" as const;

export const DELIVERY_ORCHESTRATION_P3_147_ROUTE =
  "/dashboard/delivery/orchestration" as const;

export const DELIVERY_ORCHESTRATION_P3_147_ORDER_HUB_ROUTE = "/dashboard/order-hub" as const;

export const DELIVERY_ORCHESTRATION_P3_147_IMPLEMENTATION_REF =
  "route-optimization-p2-114-v1" as const;

export const DELIVERY_ORCHESTRATION_P3_147_SECONDARY_REF =
  "delivery-dispatch-optimization-absolute-final-v1" as const;

export const DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_COUNT = 6 as const;

export const DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS = [
  "order_hub",
  "dispatch_optimize",
  "route_optimization",
  "route_planner",
  "driver_tracking",
  "third_party_dispatch",
] as const;

export type DeliveryOrchestrationCapabilityId =
  (typeof DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS)[number];

export const DELIVERY_ORCHESTRATION_P3_147_TEST_IDS = [
  "delivery-orchestration-olo",
  "delivery-orchestration-order-hub",
  "delivery-orchestration-dispatch",
  "delivery-orchestration-routes",
  "delivery-orchestration-planner",
  "delivery-orchestration-fleet",
  "delivery-orchestration-third-party",
] as const;

export const DELIVERY_ORCHESTRATION_P3_147_COMPONENT =
  "components/delivery/delivery-orchestration-panel.tsx" as const;

export const DELIVERY_ORCHESTRATION_P3_147_PAGE =
  "app/dashboard/delivery/orchestration/page.tsx" as const;

export const DELIVERY_ORCHESTRATION_P3_147_LEGACY_DISPATCH =
  "lib/delivery/delivery-dispatch-optimization-policy.ts" as const;

export const DELIVERY_ORCHESTRATION_P3_147_LEGACY_ORDER_HUB =
  "app/dashboard/order-hub/page.tsx" as const;

export const DELIVERY_ORCHESTRATION_P3_147_RELATED_DOCS = [
  "docs/competitor-battle-cards/olo.md",
  "docs/route-optimization-engine.md",
  "lib/delivery/delivery-dispatch-optimization-policy.ts",
  "lib/delivery/route-optimization-p2-114-policy.ts",
  "components/delivery/route-optimization-panel.tsx",
  "components/dashboard/routes/dispatch-optimization-panel.tsx",
] as const;

export const DELIVERY_ORCHESTRATION_P3_147_HONESTY_MARKERS = [
  "not affiliated",
  "0 signed LOIs",
  "BETA",
  "baseline",
  "verify",
] as const;

export const DELIVERY_ORCHESTRATION_P3_147_WIRING_PATHS = [
  DELIVERY_ORCHESTRATION_P3_147_DOC,
  "lib/delivery/delivery-orchestration-p3-147-policy.ts",
  "lib/delivery/delivery-orchestration-p3-147-content.ts",
  "lib/delivery/delivery-orchestration-p3-147-operations.ts",
  "lib/delivery/delivery-orchestration-p3-147-audit.ts",
  DELIVERY_ORCHESTRATION_P3_147_ARTIFACT,
  DELIVERY_ORCHESTRATION_P3_147_UNIT_TEST,
  DELIVERY_ORCHESTRATION_P3_147_COMPONENT,
  DELIVERY_ORCHESTRATION_P3_147_PAGE,
  DELIVERY_ORCHESTRATION_P3_147_LEGACY_DISPATCH,
  DELIVERY_ORCHESTRATION_P3_147_LEGACY_ORDER_HUB,
  "lib/delivery/route-optimization-p2-114-policy.ts",
] as const;
