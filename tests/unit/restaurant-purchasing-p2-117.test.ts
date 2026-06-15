import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditRestaurantPurchasingP2_117,
  formatRestaurantPurchasingP2_117AuditLines,
} from "@/lib/marketplace/restaurant-purchasing-p2-117-audit";
import { RESTAURANT_PURCHASING_P2_117_CAPABILITIES } from "@/lib/marketplace/restaurant-purchasing-p2-117-content";
import {
  buildCompareSuppliersBlock,
  buildRestaurantPurchasingDemoReport,
  computePurchasingReadinessScore,
  hasActivePurchasingWorkflow,
} from "@/lib/marketplace/restaurant-purchasing-p2-117-operations";
import {
  RESTAURANT_PURCHASING_P2_117_CAPABILITY_COUNT,
  RESTAURANT_PURCHASING_P2_117_CI_WORKFLOW,
  RESTAURANT_PURCHASING_P2_117_DOC,
  RESTAURANT_PURCHASING_P2_117_NPM_SCRIPT,
  RESTAURANT_PURCHASING_P2_117_POLICY_ID,
  RESTAURANT_PURCHASING_P2_117_ROUTE,
  RESTAURANT_PURCHASING_P2_117_UNIT_TEST,
} from "@/lib/marketplace/restaurant-purchasing-p2-117-policy";

const ROOT = process.cwd();

describe("Restaurant purchasing (P2-117)", () => {
  it("locks policy id, route, and five capabilities", () => {
    expect(RESTAURANT_PURCHASING_P2_117_POLICY_ID).toBe("restaurant-purchasing-p2-117-v1");
    expect(RESTAURANT_PURCHASING_P2_117_ROUTE).toBe(
      "/dashboard/marketplace/restaurant-purchasing",
    );
    expect(RESTAURANT_PURCHASING_P2_117_CAPABILITY_COUNT).toBe(5);
    expect(RESTAURANT_PURCHASING_P2_117_CAPABILITIES).toHaveLength(5);
  });

  it("passes full restaurant purchasing audit", () => {
    const summary = auditRestaurantPurchasingP2_117(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyCompareLinked).toBe(true);
    expect(summary.legacyRecurringLinked).toBe(true);
    expect(summary.legacyComparePageLinked).toBe(true);
    expect(summary.legacyDisputesLinked).toBe(true);
    expect(summary.legacyDashboardLinked).toBe(true);
    expect(summary.legacySupplierLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds compare suppliers block with status tiers", () => {
    expect(buildCompareSuppliersBlock(0).status).toBe("missing");
    expect(buildCompareSuppliersBlock(1).status).toBe("partial");
    expect(buildCompareSuppliersBlock(5).status).toBe("ready");
  });

  it("computes purchasing readiness score", () => {
    const score = computePurchasingReadinessScore([
      { id: "a", label: "A", status: "ready", summary: "", count: 1 },
      { id: "b", label: "B", status: "missing", summary: "", count: 0 },
    ]);
    expect(score).toBe(50);
  });

  it("builds demo restaurant purchasing report", () => {
    const report = buildRestaurantPurchasingDemoReport();
    expect(report.blocks).toHaveLength(5);
    expect(report.compareOfferCount).toBeGreaterThan(0);
    expect(hasActivePurchasingWorkflow(report)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[RESTAURANT_PURCHASING_P2_117_NPM_SCRIPT]).toContain(
      "audit-restaurant-purchasing-p2-117.ts",
    );
    expect(pkg.scripts["test:ci:restaurant-purchasing-p2-117"]).toContain(
      RESTAURANT_PURCHASING_P2_117_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, RESTAURANT_PURCHASING_P2_117_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(RESTAURANT_PURCHASING_P2_117_NPM_SCRIPT);

    expect(existsSync(join(ROOT, RESTAURANT_PURCHASING_P2_117_DOC))).toBe(true);
    expect(
      formatRestaurantPurchasingP2_117AuditLines(auditRestaurantPurchasingP2_117(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
