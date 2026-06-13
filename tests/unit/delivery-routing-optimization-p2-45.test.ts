import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDeliveryRoutingOptimizationP2_45,
  formatDeliveryRoutingOptimizationP2_45AuditLines,
} from "@/lib/delivery/delivery-routing-optimization-p2-45-audit";
import {
  computeRouteCompletionPct,
  estimateDeliveryMinutesRemaining,
  pendingStopCount,
} from "@/lib/delivery/delivery-routing-optimization-p2-45-measurement";
import {
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_AUDIT_SCRIPT,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_CHECK_NPM_SCRIPT,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_CI_WORKFLOW,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_DOC,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_FLOW_STEPS,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_NPM_SCRIPT,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_OPTIMIZE_ROUTE,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_POLICY_ID,
  DELIVERY_ROUTING_OPTIMIZATION_P2_45_UNIT_TEST,
} from "@/lib/delivery/delivery-routing-optimization-p2-45-policy";

const ROOT = process.cwd();

describe("Delivery routing optimization (P2-45)", () => {
  it("locks policy id and Olo parity flow steps", () => {
    expect(DELIVERY_ROUTING_OPTIMIZATION_P2_45_POLICY_ID).toBe(
      "delivery-routing-optimization-p2-45-v1",
    );
    expect(DELIVERY_ROUTING_OPTIMIZATION_P2_45_OPTIMIZE_ROUTE).toBe("/dashboard/routes/optimize");
    expect(DELIVERY_ROUTING_OPTIMIZATION_P2_45_FLOW_STEPS).toEqual([
      "optimize_stop_order",
      "minimize_drive_time",
      "track_driver_progress",
      "driver_handoff",
    ]);
  });

  it("estimates delivery ETA and route completion", () => {
    expect(computeRouteCompletionPct(3, 10)).toBe(30);
    expect(pendingStopCount(10, 3, 1)).toBe(6);
    const eta = estimateDeliveryMinutesRemaining({ distanceKm: 14, pendingStops: 4 });
    expect(eta).toBeGreaterThan(20);
  });

  it("passes full delivery routing optimization audit", () => {
    const summary = auditDeliveryRoutingOptimizationP2_45(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.dispatchPanelWired).toBe(true);
    expect(summary.trackingServiceWired).toBe(true);
    expect(summary.driverWidgetWired).toBe(true);
    expect(summary.routesPageWired).toBe(true);
    expect(summary.goldenEtaOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatDeliveryRoutingOptimizationP2_45AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, DELIVERY_ROUTING_OPTIMIZATION_P2_45_DOC))).toBe(true);
    expect(existsSync(join(ROOT, DELIVERY_ROUTING_OPTIMIZATION_P2_45_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, DELIVERY_ROUTING_OPTIMIZATION_P2_45_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DELIVERY_ROUTING_OPTIMIZATION_P2_45_NPM_SCRIPT]).toContain(
      "audit-delivery-routing-optimization-p2-45.ts",
    );
    expect(pkg.scripts?.[DELIVERY_ROUTING_OPTIMIZATION_P2_45_CHECK_NPM_SCRIPT]).toContain(
      DELIVERY_ROUTING_OPTIMIZATION_P2_45_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, DELIVERY_ROUTING_OPTIMIZATION_P2_45_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("delivery-routing-optimization-p2-45");
  });
});
