import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMarketplaceCommissionModelP2_118,
  formatMarketplaceCommissionModelP2_118AuditLines,
} from "@/lib/marketplace/marketplace-commission-model-p2-118-audit";
import { MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITIES } from "@/lib/marketplace/marketplace-commission-model-p2-118-content";
import {
  buildFeaturedPlacementBlock,
  buildMarketplaceCommissionModelDemoReport,
  buildVendorCommissionBlock,
  computeCommissionReadinessScore,
  hasActiveCommissionRevenue,
} from "@/lib/marketplace/marketplace-commission-model-p2-118-operations";
import {
  MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITY_COUNT,
  MARKETPLACE_COMMISSION_MODEL_P2_118_CI_WORKFLOW,
  MARKETPLACE_COMMISSION_MODEL_P2_118_DOC,
  MARKETPLACE_COMMISSION_MODEL_P2_118_NPM_SCRIPT,
  MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID,
  MARKETPLACE_COMMISSION_MODEL_P2_118_ROUTE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_UNIT_TEST,
} from "@/lib/marketplace/marketplace-commission-model-p2-118-policy";

const ROOT = process.cwd();

describe("Marketplace commission model (P2-118)", () => {
  it("locks policy id, route, and four capabilities", () => {
    expect(MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID).toBe(
      "marketplace-commission-model-p2-118-v1",
    );
    expect(MARKETPLACE_COMMISSION_MODEL_P2_118_ROUTE).toBe(
      "/dashboard/marketplace/commission-model",
    );
    expect(MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITY_COUNT).toBe(4);
    expect(MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITIES).toHaveLength(4);
  });

  it("passes full marketplace commission model audit", () => {
    const summary = auditMarketplaceCommissionModelP2_118(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyPlatformAnalyticsLinked).toBe(true);
    expect(summary.legacyFeaturedLinked).toBe(true);
    expect(summary.legacyCheckoutLinked).toBe(true);
    expect(summary.legacyStripeLinked).toBe(true);
    expect(summary.legacyBillingTypesLinked).toBe(true);
    expect(summary.legacyVendorFinanceLinked).toBe(true);
    expect(summary.legacyVendorSettingsLinked).toBe(true);
    expect(summary.legacyPlatformPageLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds vendor commission block with status tiers", () => {
    expect(buildVendorCommissionBlock(0).status).toBe("missing");
    expect(buildVendorCommissionBlock(50).status).toBe("partial");
    expect(buildVendorCommissionBlock(500).status).toBe("ready");
  });

  it("builds featured placement block with slot count", () => {
    expect(buildFeaturedPlacementBlock(0, 0).status).toBe("missing");
    expect(buildFeaturedPlacementBlock(200, 2).status).toBe("ready");
  });

  it("computes commission readiness score", () => {
    const score = computeCommissionReadinessScore([
      { id: "a", label: "A", status: "ready", summary: "", amountUsd: 100 },
      { id: "b", label: "B", status: "missing", summary: "", amountUsd: 0 },
    ]);
    expect(score).toBe(50);
  });

  it("builds demo marketplace commission model report", () => {
    const report = buildMarketplaceCommissionModelDemoReport();
    expect(report.blocks).toHaveLength(4);
    expect(report.commissionRevenue30dUsd).toBeGreaterThan(0);
    expect(hasActiveCommissionRevenue(report)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[MARKETPLACE_COMMISSION_MODEL_P2_118_NPM_SCRIPT]).toContain(
      "audit-marketplace-commission-model-p2-118.ts",
    );
    expect(pkg.scripts["test:ci:marketplace-commission-model-p2-118"]).toContain(
      MARKETPLACE_COMMISSION_MODEL_P2_118_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARKETPLACE_COMMISSION_MODEL_P2_118_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(MARKETPLACE_COMMISSION_MODEL_P2_118_NPM_SCRIPT);

    expect(existsSync(join(ROOT, MARKETPLACE_COMMISSION_MODEL_P2_118_DOC))).toBe(true);
    expect(
      formatMarketplaceCommissionModelP2_118AuditLines(
        auditMarketplaceCommissionModelP2_118(ROOT),
      ).length,
    ).toBeGreaterThan(5);
  });
});
