import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditMarketplaceEmptyStatesP2_123,
  formatMarketplaceEmptyStatesP2_123AuditLines,
} from "@/lib/marketplace/marketplace-empty-states-p2-123-audit";
import { MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITIES } from "@/lib/marketplace/marketplace-empty-states-p2-123-content";
import {
  allEmptyStatesWired,
  buildMarketplaceEmptyStatesP2_123DemoReport,
  buildNoOrdersBlock,
  buildNoProductsBlock,
  computeEmptyStatesWiringScore,
} from "@/lib/marketplace/marketplace-empty-states-p2-123-operations";
import {
  MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITY_COUNT,
  MARKETPLACE_EMPTY_STATES_P2_123_CI_WORKFLOW,
  MARKETPLACE_EMPTY_STATES_P2_123_DOC,
  MARKETPLACE_EMPTY_STATES_P2_123_NPM_SCRIPT,
  MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID,
  MARKETPLACE_EMPTY_STATES_P2_123_ROUTE,
  MARKETPLACE_EMPTY_STATES_P2_123_SCENARIOS,
  MARKETPLACE_EMPTY_STATES_P2_123_UNIT_TEST,
} from "@/lib/marketplace/marketplace-empty-states-p2-123-policy";

const ROOT = process.cwd();

describe("Marketplace empty states (P2-123)", () => {
  it("locks policy id, route, and three scenarios", () => {
    expect(MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID).toBe("marketplace-empty-states-p2-123-v1");
    expect(MARKETPLACE_EMPTY_STATES_P2_123_ROUTE).toBe("/dashboard/marketplace/empty-states");
    expect(MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITY_COUNT).toBe(3);
    expect(MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITIES).toHaveLength(3);
    expect(MARKETPLACE_EMPTY_STATES_P2_123_SCENARIOS).toEqual([
      "catalog_empty",
      "orders_empty",
      "vendors_empty",
    ]);
  });

  it("passes full marketplace empty states audit", () => {
    const summary = auditMarketplaceEmptyStatesP2_123(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyPolicyLinked).toBe(true);
    expect(summary.legacyDesignPolicyLinked).toBe(true);
    expect(summary.legacyUiLinked).toBe(true);
    expect(summary.legacyIllustrationLinked).toBe(true);
    expect(summary.catalogPageWired).toBe(true);
    expect(summary.ordersPageWired).toBe(true);
    expect(summary.vendorsModuleWired).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds no-products block with wiring tiers", () => {
    expect(buildNoProductsBlock(false, 0).status).toBe("missing");
    expect(buildNoProductsBlock(true, 5).status).toBe("partial");
    expect(buildNoProductsBlock(true, 0).status).toBe("ready");
  });

  it("builds no-orders block when wired", () => {
    expect(buildNoOrdersBlock(true, 0).wired).toBe(true);
    expect(buildNoOrdersBlock(true, 0).scenario).toBe("orders_empty");
  });

  it("computes empty states wiring score", () => {
    const score = computeEmptyStatesWiringScore([
      { id: "a", label: "A", scenario: "catalog_empty", status: "ready", summary: "", count: 0, wired: true },
      { id: "b", label: "B", scenario: "orders_empty", status: "missing", summary: "", count: 0, wired: false },
    ]);
    expect(score).toBe(50);
  });

  it("builds demo empty states report", () => {
    const report = buildMarketplaceEmptyStatesP2_123DemoReport();
    expect(report.blocks).toHaveLength(3);
    expect(allEmptyStatesWired(report)).toBe(true);
    expect(report.wiringScore).toBe(100);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[MARKETPLACE_EMPTY_STATES_P2_123_NPM_SCRIPT]).toContain(
      "audit-marketplace-empty-states-p2-123.ts",
    );
    expect(pkg.scripts["test:ci:marketplace-empty-states-p2-123"]).toContain(
      MARKETPLACE_EMPTY_STATES_P2_123_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, MARKETPLACE_EMPTY_STATES_P2_123_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(MARKETPLACE_EMPTY_STATES_P2_123_NPM_SCRIPT);

    expect(existsSync(join(ROOT, MARKETPLACE_EMPTY_STATES_P2_123_DOC))).toBe(true);
    expect(
      formatMarketplaceEmptyStatesP2_123AuditLines(auditMarketplaceEmptyStatesP2_123(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
