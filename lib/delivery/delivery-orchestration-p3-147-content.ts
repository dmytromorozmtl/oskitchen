import {
  DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_COUNT,
  DELIVERY_ORCHESTRATION_P3_147_ORDER_HUB_ROUTE,
  DELIVERY_ORCHESTRATION_P3_147_ROUTE,
  type DeliveryOrchestrationCapabilityId,
} from "@/lib/delivery/delivery-orchestration-p3-147-policy";

export const DELIVERY_ORCHESTRATION_P3_147_EYEBROW =
  "Olo parity · delivery orchestration" as const;

export const DELIVERY_ORCHESTRATION_P3_147_SUBLINE =
  "Six orchestration surfaces — order hub ingest, dispatch optimization, route planner, fleet tracking, and delivery proof. BETA baseline — verify live channel smokes before claiming Olo dispatch parity." as const;

export type DeliveryOrchestrationCapability = {
  id: DeliveryOrchestrationCapabilityId;
  label: string;
  route: string;
  testId: string;
  oloTypical: string;
  osKitchenStatus: string;
};

export const DELIVERY_ORCHESTRATION_P3_147_CAPABILITIES: readonly DeliveryOrchestrationCapability[] =
  [
    {
      id: "order_hub",
      label: "Order hub ingest",
      route: DELIVERY_ORCHESTRATION_P3_147_ORDER_HUB_ROUTE,
      testId: "delivery-orchestration-order-hub",
      oloTypical: "Aggregator order ingest + dispatch queue",
      osKitchenStatus: "shipped",
    },
    {
      id: "dispatch_optimize",
      label: "Dispatch optimize",
      route: "/dashboard/routes/optimize",
      testId: "delivery-orchestration-dispatch",
      oloTypical: "Network dispatch optimization",
      osKitchenStatus: "shipped",
    },
    {
      id: "route_optimization",
      label: "Route optimization",
      route: "/dashboard/delivery/route-optimization",
      testId: "delivery-orchestration-routes",
      oloTypical: "Driver route sequencing",
      osKitchenStatus: "shipped",
    },
    {
      id: "route_planner",
      label: "Route planner",
      route: "/dashboard/routes/planner",
      testId: "delivery-orchestration-planner",
      oloTypical: "Shift route planning",
      osKitchenStatus: "shipped",
    },
    {
      id: "driver_tracking",
      label: "Fleet tracking",
      route: "/dashboard/routes/fleet",
      testId: "delivery-orchestration-fleet",
      oloTypical: "Live driver GPS network",
      osKitchenStatus: "shipped",
    },
    {
      id: "third_party_dispatch",
      label: "Third-party dispatch",
      route: "/dashboard/integrations",
      testId: "delivery-orchestration-third-party",
      oloTypical: "Aggregator dispatch network (Uber/DoorDash)",
      osKitchenStatus: "BETA",
    },
  ] as const;

export function assertDeliveryOrchestrationCapabilityCount(): boolean {
  return (
    DELIVERY_ORCHESTRATION_P3_147_CAPABILITIES.length ===
    DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_COUNT
  );
}

export const DELIVERY_ORCHESTRATION_P3_147_OPERATOR_LINKS = [
  { label: "Orchestration hub", href: DELIVERY_ORCHESTRATION_P3_147_ROUTE },
  { label: "Order hub", href: DELIVERY_ORCHESTRATION_P3_147_ORDER_HUB_ROUTE },
  { label: "Integration Health", href: "/dashboard/integration-health" },
] as const;
