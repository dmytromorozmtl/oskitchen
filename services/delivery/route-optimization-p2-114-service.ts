import {
  buildRouteOptimizationDemoReport,
  buildRouteOptimizationReport,
  type RouteOptimizationReport,
} from "@/lib/delivery/route-optimization-p2-114-operations";
import { ROUTE_OPTIMIZATION_P2_114_POLICY_ID } from "@/lib/delivery/route-optimization-p2-114-policy";
import { loadDeliveryDispatchOptimizationModel } from "@/services/delivery/delivery-dispatch-optimization-service";
import { isGoogleRoutesConfigured } from "@/services/delivery/route-optimization-service";

export type RouteOptimizationSnapshot = {
  policyId: typeof ROUTE_OPTIMIZATION_P2_114_POLICY_ID;
  mode: "live" | "demo";
  googleRoutesConfigured: boolean;
  pendingDispatchCount: number;
  routeCount: number;
  primaryRoute: RouteOptimizationReport;
  analyzedAt: string;
};

export async function loadRouteOptimizationSnapshot(
  userId: string,
): Promise<RouteOptimizationSnapshot> {
  try {
    const model = await loadDeliveryDispatchOptimizationModel(userId);
    const top = model.routes[0];

    if (top) {
      const primaryRoute = buildRouteOptimizationReport({
        routeId: top.routeId,
        routeTitle: top.routeTitle,
        stops: top.optimizedStopIds.map((stopId, index) => {
          const seq = top.currentStopIds.indexOf(stopId);
          return {
            stopId,
            orderId: `ord-${stopId}`,
            customerName: `Stop ${index + 1}`,
            lat: 40.75 + index * 0.01,
            lng: -73.98 - index * 0.01,
            sequence: seq >= 0 ? seq + 1 : index + 1,
          };
        }),
        googleConfigured: model.googleRoutesConfigured,
        driverLabel: "Assigned from dispatch",
      });

      return {
        policyId: ROUTE_OPTIMIZATION_P2_114_POLICY_ID,
        mode: "live",
        googleRoutesConfigured: model.googleRoutesConfigured,
        pendingDispatchCount: model.pendingDispatchCount,
        routeCount: model.routes.length,
        primaryRoute: {
          ...primaryRoute,
          currentDistanceKm: top.currentDistanceKm,
          optimizedDistanceKm: top.optimizedDistanceKm,
          distanceSavedKm: top.distanceSavedKm,
          method: top.method,
          googleConfigured: top.googleConfigured,
        },
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const demo = buildRouteOptimizationDemoReport();

  return {
    policyId: ROUTE_OPTIMIZATION_P2_114_POLICY_ID,
    mode: "demo",
    googleRoutesConfigured: isGoogleRoutesConfigured(),
    pendingDispatchCount: 0,
    routeCount: 1,
    primaryRoute: demo,
    analyzedAt: new Date().toISOString(),
  };
}
