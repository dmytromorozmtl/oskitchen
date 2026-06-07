import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildRouteOptimization,
  DELIVERY_DISPATCH_OPTIMIZATION_POLICY_ID,
  DELIVERY_DISPATCH_OPTIMIZATION_ROUTE,
  haversineKm,
  optimizeDispatchStopOrder,
  scoreDispatchPriority,
  type DispatchStopCandidate,
} from "@/lib/delivery/delivery-dispatch-optimization-policy";

const ROOT = process.cwd();

function stop(
  id: string,
  seq: number,
  lat: number | null,
  lng: number | null,
  windowMinutesFromNow?: number,
): DispatchStopCandidate {
  return {
    stopId: id,
    orderId: `order-${id}`,
    customerName: `Guest ${id}`,
    sequence: seq,
    lat,
    lng,
    address: `${id} Main St`,
    windowEnd: windowMinutesFromNow
      ? new Date(Date.now() + windowMinutesFromNow * 60_000)
      : null,
    priorityScore: scoreDispatchPriority({
      windowEnd: windowMinutesFromNow
        ? new Date(Date.now() + windowMinutesFromNow * 60_000)
        : null,
      sequence: seq,
    }),
  };
}

describe("delivery dispatch optimization (Absolute Final Task 43)", () => {
  it("locks policy id and optimize route", () => {
    expect(DELIVERY_DISPATCH_OPTIMIZATION_POLICY_ID).toBe(
      "delivery-dispatch-optimization-absolute-final-v1",
    );
    expect(DELIVERY_DISPATCH_OPTIMIZATION_ROUTE).toBe("/dashboard/routes/optimize");
  });

  it("computes haversine distance between coordinates", () => {
    const km = haversineKm({ lat: 43.65, lng: -79.38 }, { lat: 43.7, lng: -79.4 });
    expect(km).toBeGreaterThan(0);
    expect(km).toBeLessThan(20);
  });

  it("optimizes geo stops with nearest-neighbor heuristic", () => {
    const stops = [
      stop("a", 0, 43.65, -79.38),
      stop("b", 1, 43.651, -79.381),
      stop("c", 2, 43.7, -79.45),
    ];
    const { ordered, method } = optimizeDispatchStopOrder(stops);
    expect(method).toBe("nearest_neighbor");
    expect(ordered.map((s) => s.stopId)).toHaveLength(3);
  });

  it("falls back to window priority without coordinates", () => {
    const stops = [
      stop("a", 0, null, null, 120),
      stop("b", 1, null, null, 30),
      stop("c", 2, null, null, 60),
    ];
    const { ordered, method } = optimizeDispatchStopOrder(stops);
    expect(method).toBe("window_priority");
    expect(ordered[0]?.stopId).toBe("b");
  });

  it("builds route optimization with distance savings", () => {
    const candidates = [
      stop("a", 0, 43.65, -79.38),
      stop("b", 1, 43.651, -79.381),
      stop("c", 2, 43.7, -79.45),
    ];
    const { ordered } = optimizeDispatchStopOrder(candidates);
    const result = buildRouteOptimization({
      routeId: "route-1",
      routeTitle: "Lunch route",
      stops: candidates,
      optimizedStopIds: ordered.map((s) => s.stopId),
      method: "nearest_neighbor",
      googleConfigured: false,
    });
    expect(result.stopCount).toBe(3);
    expect(result.optimizedStopIds).toHaveLength(3);
  });

  it("wires dispatch optimization panel into optimize page", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/routes/optimize/page.tsx"), "utf8");
    expect(page).toContain("DispatchOptimizationPanel");
    expect(page).toContain("loadDeliveryDispatchOptimizationModel");
  });

  it("applies optimized stop order in route service", () => {
    const service = readFileSync(join(ROOT, "services/routes/route-service.ts"), "utf8");
    expect(service).toContain("applyOptimizedStopOrder");
    expect(service).toContain("dispatch_optimization");
  });

  it("exposes apply dispatch optimization action", () => {
    const actions = readFileSync(join(ROOT, "actions/delivery-route.ts"), "utf8");
    expect(actions).toContain("applyDispatchOptimizationAction");
    expect(actions).toContain("applyDispatchOptimizationFormAction");
  });
});
