import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMarketplaceComparisonP2_124,
  formatMarketplaceComparisonP2_124AuditLines,
} from "@/lib/marketplace/marketplace-comparison-p2-124-audit";
import { MARKETPLACE_COMPARISON_P2_124_CAPABILITIES } from "@/lib/marketplace/marketplace-comparison-p2-124-content";
import {
  buildMarketplaceComparisonP2_124DemoReport,
  buildMultiSortBlock,
  buildSideBySideBlock,
  computeComparisonReadinessScore,
  hasActiveComparison,
} from "@/lib/marketplace/marketplace-comparison-p2-124-operations";
import {
  MARKETPLACE_COMPARISON_P2_124_CAPABILITY_COUNT,
  MARKETPLACE_COMPARISON_P2_124_CI_WORKFLOW,
  MARKETPLACE_COMPARISON_P2_124_DOC,
  MARKETPLACE_COMPARISON_P2_124_NPM_SCRIPT,
  MARKETPLACE_COMPARISON_P2_124_POLICY_ID,
  MARKETPLACE_COMPARISON_P2_124_ROUTE,
  MARKETPLACE_COMPARISON_P2_124_UNIT_TEST,
} from "@/lib/marketplace/marketplace-comparison-p2-124-policy";

const ROOT = process.cwd();

describe("Marketplace comparison tool (P2-124)", () => {
  it("locks policy id, route, and four capabilities", () => {
    expect(MARKETPLACE_COMPARISON_P2_124_POLICY_ID).toBe("marketplace-comparison-p2-124-v1");
    expect(MARKETPLACE_COMPARISON_P2_124_ROUTE).toBe("/dashboard/marketplace/comparison-tool");
    expect(MARKETPLACE_COMPARISON_P2_124_CAPABILITY_COUNT).toBe(4);
    expect(MARKETPLACE_COMPARISON_P2_124_CAPABILITIES).toHaveLength(4);
  });

  it("passes full marketplace comparison tool audit", () => {
    const summary = auditMarketplaceComparisonP2_124(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyCompareServiceLinked).toBe(true);
    expect(summary.legacyComparePageLinked).toBe(true);
    expect(summary.legacyCompareClientLinked).toBe(true);
    expect(summary.legacyComparisonTableLinked).toBe(true);
    expect(summary.legacyCompareFiltersLinked).toBe(true);
    expect(summary.legacyCompareStorageLinked).toBe(true);
    expect(summary.legacyCatalogToolbarLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds side-by-side block with vendor count tiers", () => {
    expect(buildSideBySideBlock(0, 0).status).toBe("missing");
    expect(buildSideBySideBlock(1, 1).status).toBe("partial");
    expect(buildSideBySideBlock(5, 3).status).toBe("ready");
  });

  it("builds multi-sort block with five sort options", () => {
    expect(buildMultiSortBlock(3, 5).status).toBe("ready");
    expect(buildMultiSortBlock(0, 3).status).toBe("missing");
  });

  it("computes comparison readiness score", () => {
    const score = computeComparisonReadinessScore([
      { id: "a", label: "A", status: "ready", summary: "", count: 1 },
      { id: "b", label: "B", status: "missing", summary: "", count: 0 },
    ]);
    expect(score).toBe(50);
  });

  it("builds demo comparison report", () => {
    const report = buildMarketplaceComparisonP2_124DemoReport();
    expect(report.blocks).toHaveLength(4);
    expect(report.compareOfferCount).toBe(12);
    expect(hasActiveComparison(report)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[MARKETPLACE_COMPARISON_P2_124_NPM_SCRIPT]).toContain(
      "audit-marketplace-comparison-p2-124.ts",
    );
    expect(pkg.scripts["test:ci:marketplace-comparison-p2-124"]).toContain(
      MARKETPLACE_COMPARISON_P2_124_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARKETPLACE_COMPARISON_P2_124_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(MARKETPLACE_COMPARISON_P2_124_NPM_SCRIPT);

    expect(existsSync(join(ROOT, MARKETPLACE_COMPARISON_P2_124_DOC))).toBe(true);
    expect(
      formatMarketplaceComparisonP2_124AuditLines(auditMarketplaceComparisonP2_124(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
