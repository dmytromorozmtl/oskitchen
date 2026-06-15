import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditVendorAnalyticsP2_119,
  formatVendorAnalyticsP2_119AuditLines,
} from "@/lib/marketplace/vendor-analytics-p2-119-audit";
import { VENDOR_ANALYTICS_P2_119_CAPABILITIES } from "@/lib/marketplace/vendor-analytics-p2-119-content";
import {
  buildRepeatBuyersBlock,
  buildTopProductsBlock,
  buildVendorAnalyticsDemoReport,
  computeVendorAnalyticsReadinessScore,
  hasActiveVendorAnalytics,
} from "@/lib/marketplace/vendor-analytics-p2-119-operations";
import {
  VENDOR_ANALYTICS_P2_119_CAPABILITY_COUNT,
  VENDOR_ANALYTICS_P2_119_CI_WORKFLOW,
  VENDOR_ANALYTICS_P2_119_DOC,
  VENDOR_ANALYTICS_P2_119_NPM_SCRIPT,
  VENDOR_ANALYTICS_P2_119_POLICY_ID,
  VENDOR_ANALYTICS_P2_119_ROUTE,
  VENDOR_ANALYTICS_P2_119_UNIT_TEST,
} from "@/lib/marketplace/vendor-analytics-p2-119-policy";

const ROOT = process.cwd();

describe("Vendor analytics (P2-119)", () => {
  it("locks policy id, route, and four capabilities", () => {
    expect(VENDOR_ANALYTICS_P2_119_POLICY_ID).toBe("vendor-analytics-p2-119-v1");
    expect(VENDOR_ANALYTICS_P2_119_ROUTE).toBe("/dashboard/marketplace/vendor-analytics");
    expect(VENDOR_ANALYTICS_P2_119_CAPABILITY_COUNT).toBe(4);
    expect(VENDOR_ANALYTICS_P2_119_CAPABILITIES).toHaveLength(4);
  });

  it("passes full vendor analytics audit", () => {
    const summary = auditVendorAnalyticsP2_119(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyAnalyticsLinked).toBe(true);
    expect(summary.legacyAnalyticsPageLinked).toBe(true);
    expect(summary.legacyAnalyticsClientLinked).toBe(true);
    expect(summary.legacyCartLinked).toBe(true);
    expect(summary.legacyCompareLinked).toBe(true);
    expect(summary.legacyPriceIntelLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds top products block with status tiers", () => {
    expect(buildTopProductsBlock(0, 0).status).toBe("missing");
    expect(buildTopProductsBlock(1, 100).status).toBe("partial");
    expect(buildTopProductsBlock(5, 1000).status).toBe("ready");
  });

  it("builds repeat buyers block with rate tiers", () => {
    expect(buildRepeatBuyersBlock(0, 0).status).toBe("missing");
    expect(buildRepeatBuyersBlock(15, 2).status).toBe("partial");
    expect(buildRepeatBuyersBlock(45, 6).status).toBe("ready");
  });

  it("computes vendor analytics readiness score", () => {
    const score = computeVendorAnalyticsReadinessScore([
      { id: "a", label: "A", status: "ready", summary: "", count: 1 },
      { id: "b", label: "B", status: "missing", summary: "", count: 0 },
    ]);
    expect(score).toBe(50);
  });

  it("builds demo vendor analytics report", () => {
    const report = buildVendorAnalyticsDemoReport();
    expect(report.blocks).toHaveLength(4);
    expect(report.topProductCount).toBeGreaterThan(0);
    expect(hasActiveVendorAnalytics(report)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[VENDOR_ANALYTICS_P2_119_NPM_SCRIPT]).toContain(
      "audit-vendor-analytics-p2-119.ts",
    );
    expect(pkg.scripts["test:ci:vendor-analytics-p2-119"]).toContain(
      VENDOR_ANALYTICS_P2_119_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, VENDOR_ANALYTICS_P2_119_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(VENDOR_ANALYTICS_P2_119_NPM_SCRIPT);

    expect(existsSync(join(ROOT, VENDOR_ANALYTICS_P2_119_DOC))).toBe(true);
    expect(
      formatVendorAnalyticsP2_119AuditLines(auditVendorAnalyticsP2_119(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
