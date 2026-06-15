import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditRouteOptimizationP2_114,
  formatRouteOptimizationP2_114AuditLines,
} from "@/lib/delivery/route-optimization-p2-114-audit";
import { ROUTE_OPTIMIZATION_P2_114_CAPABILITIES } from "@/lib/delivery/route-optimization-p2-114-content";
import {
  buildRouteOptimizationDemoReport,
  estimateMinutesFromDistanceKm,
  hasRouteSavings,
  optimizeRouteStops,
  ROUTE_OPTIMIZATION_DEMO_STOPS,
} from "@/lib/delivery/route-optimization-p2-114-operations";
import {
  ROUTE_OPTIMIZATION_P2_114_CAPABILITY_COUNT,
  ROUTE_OPTIMIZATION_P2_114_CI_WORKFLOW,
  ROUTE_OPTIMIZATION_P2_114_DOC,
  ROUTE_OPTIMIZATION_P2_114_NPM_SCRIPT,
  ROUTE_OPTIMIZATION_P2_114_POLICY_ID,
  ROUTE_OPTIMIZATION_P2_114_ROUTE,
  ROUTE_OPTIMIZATION_P2_114_UNIT_TEST,
} from "@/lib/delivery/route-optimization-p2-114-policy";

const ROOT = process.cwd();

describe("Route optimization (P2-114)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(ROUTE_OPTIMIZATION_P2_114_POLICY_ID).toBe("route-optimization-p2-114-v1");
    expect(ROUTE_OPTIMIZATION_P2_114_ROUTE).toBe("/dashboard/delivery/route-optimization");
    expect(ROUTE_OPTIMIZATION_P2_114_CAPABILITY_COUNT).toBe(3);
    expect(ROUTE_OPTIMIZATION_P2_114_CAPABILITIES).toHaveLength(3);
  });

  it("passes full route optimization audit", () => {
    const summary = auditRouteOptimizationP2_114(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyRoutesLinked).toBe(true);
    expect(summary.legacyDispatchLinked).toBe(true);
    expect(summary.legacyPolicyLinked).toBe(true);
    expect(summary.legacyPanelLinked).toBe(true);
    expect(summary.legacyOptimizePageLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("optimizes demo stop order", () => {
    const { ordered, method } = optimizeRouteStops(ROUTE_OPTIMIZATION_DEMO_STOPS, {
      lat: 40.758,
      lng: -73.9855,
    });
    expect(ordered.length).toBe(ROUTE_OPTIMIZATION_DEMO_STOPS.length);
    expect(method).toBe("nearest_neighbor");
  });

  it("estimates minutes from distance", () => {
    const minutes = estimateMinutesFromDistanceKm(5.6);
    expect(minutes).toBeGreaterThan(0);
  });

  it("builds demo route optimization report with savings", () => {
    const report = buildRouteOptimizationDemoReport();
    expect(report.stopCount).toBe(5);
    expect(report.optimizedStopIds.length).toBe(5);
    expect(report.driverLabel).toContain("demo");
    expect(hasRouteSavings(report)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[ROUTE_OPTIMIZATION_P2_114_NPM_SCRIPT]).toContain(
      "audit-route-optimization-p2-114.ts",
    );
    expect(pkg.scripts["test:ci:route-optimization-p2-114"]).toContain(
      ROUTE_OPTIMIZATION_P2_114_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, ROUTE_OPTIMIZATION_P2_114_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(ROUTE_OPTIMIZATION_P2_114_NPM_SCRIPT);

    expect(existsSync(join(ROOT, ROUTE_OPTIMIZATION_P2_114_DOC))).toBe(true);
    expect(
      formatRouteOptimizationP2_114AuditLines(auditRouteOptimizationP2_114(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
