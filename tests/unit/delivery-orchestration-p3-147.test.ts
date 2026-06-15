import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDeliveryOrchestrationP3_147,
  formatDeliveryOrchestrationP3_147AuditLines,
} from "@/lib/delivery/delivery-orchestration-p3-147-audit";
import { assertDeliveryOrchestrationCapabilityCount } from "@/lib/delivery/delivery-orchestration-p3-147-content";
import {
  loadDeliveryOrchestrationOloRegistry,
  validateDeliveryOrchestrationOloRegistry,
} from "@/lib/delivery/delivery-orchestration-p3-147-operations";
import {
  DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_COUNT,
  DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS,
  DELIVERY_ORCHESTRATION_P3_147_CI_WORKFLOW,
  DELIVERY_ORCHESTRATION_P3_147_COMPETITOR,
  DELIVERY_ORCHESTRATION_P3_147_DOC,
  DELIVERY_ORCHESTRATION_P3_147_HEADLINE,
  DELIVERY_ORCHESTRATION_P3_147_IMPLEMENTATION_REF,
  DELIVERY_ORCHESTRATION_P3_147_NPM_SCRIPT,
  DELIVERY_ORCHESTRATION_P3_147_ORDER_HUB_ROUTE,
  DELIVERY_ORCHESTRATION_P3_147_POLICY_ID,
  DELIVERY_ORCHESTRATION_P3_147_POSITIONING_LINE,
  DELIVERY_ORCHESTRATION_P3_147_ROUTE,
  DELIVERY_ORCHESTRATION_P3_147_UNIT_TEST,
} from "@/lib/delivery/delivery-orchestration-p3-147-policy";

const ROOT = process.cwd();

describe("Delivery orchestration Olo (P3-147)", () => {
  it("locks policy id, Olo competitor, and 6 orchestration capabilities", () => {
    expect(DELIVERY_ORCHESTRATION_P3_147_POLICY_ID).toBe("delivery-orchestration-p3-147-v1");
    expect(DELIVERY_ORCHESTRATION_P3_147_COMPETITOR).toBe("olo");
    expect(DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_COUNT).toBe(6);
    expect(DELIVERY_ORCHESTRATION_P3_147_ROUTE).toBe("/dashboard/delivery/orchestration");
    expect(DELIVERY_ORCHESTRATION_P3_147_ORDER_HUB_ROUTE).toBe("/dashboard/order-hub");
    expect(DELIVERY_ORCHESTRATION_P3_147_IMPLEMENTATION_REF).toBe("route-optimization-p2-114-v1");
    expect(DELIVERY_ORCHESTRATION_P3_147_POSITIONING_LINE).toBe(
      "Own your storefront and kitchen — not Olo dispatch network.",
    );
    expect(DELIVERY_ORCHESTRATION_P3_147_HEADLINE).toBe(
      "Delivery orchestration — Olo parity baseline",
    );
    expect(DELIVERY_ORCHESTRATION_P3_147_CAPABILITY_IDS).toEqual([
      "order_hub",
      "dispatch_optimize",
      "route_optimization",
      "route_planner",
      "driver_tracking",
      "third_party_dispatch",
    ]);
    expect(assertDeliveryOrchestrationCapabilityCount()).toBe(true);
  });

  it("validates registry with zero active pilots", () => {
    const registry = loadDeliveryOrchestrationOloRegistry(ROOT);
    const validation = validateDeliveryOrchestrationOloRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroActivePilots).toBe(true);
    expect(registry.activePilotCount).toBe(0);
    expect(registry.capabilities).toHaveLength(6);
  });

  it("passes full delivery orchestration Olo audit", () => {
    const summary = auditDeliveryOrchestrationP3_147(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.routeOptimizationAuditPassed).toBe(true);
    expect(summary.legacyDispatchWiringPassed).toBe(true);
    expect(summary.liveOrchestrationWiringPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.capabilitiesDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, DELIVERY_ORCHESTRATION_P3_147_DOC))).toBe(true);
    expect(existsSync(join(ROOT, DELIVERY_ORCHESTRATION_P3_147_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DELIVERY_ORCHESTRATION_P3_147_NPM_SCRIPT]).toContain(
      "audit-delivery-orchestration-p3-147.ts",
    );
    expect(pkg.scripts?.["test:ci:delivery-orchestration-p3-147"]).toContain(
      DELIVERY_ORCHESTRATION_P3_147_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, DELIVERY_ORCHESTRATION_P3_147_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:delivery-orchestration-p3-147");
  });

  it("formats audit lines", () => {
    const summary = auditDeliveryOrchestrationP3_147(ROOT);
    const lines = formatDeliveryOrchestrationP3_147AuditLines(summary);
    expect(lines.some((line) => line.includes(DELIVERY_ORCHESTRATION_P3_147_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
