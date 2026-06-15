import {
  ROUTE_OPTIMIZATION_P2_114_CAPABILITY_COUNT,
  ROUTE_OPTIMIZATION_P2_114_OPTIMIZE_ROUTE,
  ROUTE_OPTIMIZATION_P2_114_PLANNER_ROUTE,
  ROUTE_OPTIMIZATION_P2_114_ROUTE,
} from "@/lib/delivery/route-optimization-p2-114-policy";

export const ROUTE_OPTIMIZATION_P2_114_EYEBROW =
  "Route optimization · driver delivery routing" as const;

export const ROUTE_OPTIMIZATION_P2_114_HEADLINE =
  "Optimize stop order and assign efficient driver routes" as const;

export const ROUTE_OPTIMIZATION_P2_114_SUBLINE =
  "Three delivery routing capabilities — stop reordering, driver assignment preview, and distance savings estimate. BETA: verify against live traffic and driver shifts — typical directional routing, not certified logistics audit." as const;

export const ROUTE_OPTIMIZATION_P2_114_CAPABILITIES = [
  {
    id: "stop-order",
    label: "Stop order optimization",
    description:
      "Reorder delivery stops via nearest-neighbor heuristic or Google Routes API when configured.",
    module: "services/delivery/route-optimization-service.ts",
    route: ROUTE_OPTIMIZATION_P2_114_OPTIMIZE_ROUTE,
  },
  {
    id: "driver-assign",
    label: "Driver route assignment",
    description:
      "Preview optimized route for a driver shift — apply reorder from dispatch optimization panel.",
    module: "services/delivery/delivery-dispatch-optimization-service.ts",
    route: ROUTE_OPTIMIZATION_P2_114_ROUTE,
  },
  {
    id: "savings",
    label: "Distance & time savings",
    description:
      "Compare current vs optimized route distance — directional km saved before driver dispatch.",
    module: "lib/delivery/delivery-dispatch-optimization-policy.ts",
    route: ROUTE_OPTIMIZATION_P2_114_PLANNER_ROUTE,
  },
] as const;

export const ROUTE_OPTIMIZATION_P2_114_OPERATOR_LINKS = [
  { label: "Route planner", href: ROUTE_OPTIMIZATION_P2_114_PLANNER_ROUTE },
  { label: "Dispatch optimize", href: ROUTE_OPTIMIZATION_P2_114_OPTIMIZE_ROUTE },
  { label: "Fleet map", href: "/dashboard/routes/fleet" },
] as const;

export { ROUTE_OPTIMIZATION_P2_114_CAPABILITY_COUNT, ROUTE_OPTIMIZATION_P2_114_ROUTE };
