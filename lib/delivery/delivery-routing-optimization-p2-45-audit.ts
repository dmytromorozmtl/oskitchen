import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  estimateDeliveryMinutesRemaining,
  computeRouteCompletionPct,
} from "@/lib/delivery/delivery-routing-optimization-p2-45-measurement";
import {
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_DISPATCH_PANEL,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_DOC,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_DRIVER_WIDGET,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_FLOW_STEPS,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_HONESTY_MARKERS,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_OPTIMIZE_ROUTE,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_OPTIMIZATION_SERVICE,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_POLICY_ID,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTE_ROW_TEST_ID,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTES_PAGE,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTES_ROUTE,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_TRACKING_SERVICE,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_WIDGET_TEST_ID,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_WIRING_PATHS,
} from "@/lib/delivery/delivery-routing-optimization-p2-45-policy";

export type DeliveryRoutingOptimizationP2_45AuditSummary = {
  policyId: typeof DELIVERY_ROUTING_OPTIMIZATION_P2_45_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  dispatchPanelWired: boolean;
  trackingServiceWired: boolean;
  driverWidgetWired: boolean;
  routesPageWired: boolean;
  goldenEtaOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditDeliveryRoutingOptimizationP2_45(
  root = process.cwd(),
): DeliveryRoutingOptimizationP2_45AuditSummary {
  const wiringComplete = DELIVERY_ROUTING_OPTIMIZATION_P2_45_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_DOC))) {
    const source = readFileSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_DOC), "utf8").toLowerCase();
    docWired =
      source.includes(DELIVERY_ROUTING_OPTIMIZATION_P2_45_OPTIMIZE_ROUTE.toLowerCase()) &&
      source.includes("olo parity") &&
      source.includes("driver tracking");
  }

  let dispatchPanelWired = false;
  if (existsSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_DISPATCH_PANEL))) {
    const source = readFileSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_DISPATCH_PANEL), "utf8");
    dispatchPanelWired =
      source.includes("dispatch-optimization-panel") &&
      source.includes("Apply optimized order");
  }

  let trackingServiceWired = false;
  if (existsSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_TRACKING_SERVICE))) {
    const source = readFileSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_TRACKING_SERVICE), "utf8");
    trackingServiceWired = source.includes("loadDriverTrackingWidgetModel");
  }

  let driverWidgetWired = false;
  if (existsSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_DRIVER_WIDGET))) {
    const source = readFileSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_DRIVER_WIDGET), "utf8");
    driverWidgetWired =
      source.includes(DELIVERY_ROUTING_OPTIMIZATION_P2_45_WIDGET_TEST_ID) &&
      source.includes(DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTE_ROW_TEST_ID);
  }

  let routesPageWired = false;
  if (existsSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTES_PAGE))) {
    const source = readFileSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTES_PAGE), "utf8");
    routesPageWired =
      source.includes("DriverTrackingWidget") &&
      source.includes("loadDriverTrackingWidgetModel");
  }

  const optimizationServiceWired =
    existsSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_OPTIMIZATION_SERVICE)) &&
    readFileSync(join(root, DELIVERY_ROUTING_OPTIMIZATION_P2_45_OPTIMIZATION_SERVICE), "utf8").includes(
      "loadDeliveryDispatchOptimizationModel",
    );

  const eta = estimateDeliveryMinutesRemaining({ distanceKm: 10, pendingStops: 3 });
  const goldenEtaOk = eta > 0 && computeRouteCompletionPct(2, 5) === 40;

  const combined = [DELIVERY_ROUTING_OPTIMIZATION_P2_45_DOC, DELIVERY_ROUTING_OPTIMIZATION_P2_45_DRIVER_WIDGET]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = DELIVERY_ROUTING_OPTIMIZATION_P2_45_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    dispatchPanelWired &&
    trackingServiceWired &&
    driverWidgetWired &&
    routesPageWired &&
    optimizationServiceWired &&
    goldenEtaOk &&
    honestyMarkersPresent &&
    DELIVERY_ROUTING_OPTIMIZATION_P2_45_FLOW_STEPS.length === 4;

  return {
    policyId: DELIVERY_ROUTING_OPTIMIZATION_P2_45_POLICY_ID,
    wiringComplete,
    docWired,
    dispatchPanelWired,
    trackingServiceWired,
    driverWidgetWired,
    routesPageWired,
    goldenEtaOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatDeliveryRoutingOptimizationP2_45AuditLines(
  summary: DeliveryRoutingOptimizationP2_45AuditSummary,
): string[] {
  return [
    `Delivery routing optimization audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${DELIVERY_ROUTING_OPTIMIZATION_P2_45_DOC})`,
    `Dispatch panel: ${summary.dispatchPanelWired ? "wired" : "missing"}`,
    `Tracking service: ${summary.trackingServiceWired ? "wired" : "missing"}`,
    `Driver widget: ${summary.driverWidgetWired ? "wired" : "missing"}`,
    `Routes page: ${summary.routesPageWired ? "yes" : "no"} (${DELIVERY_ROUTING_OPTIMIZATION_P2_45_ROUTES_ROUTE})`,
    `Golden ETA math: ${summary.goldenEtaOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
