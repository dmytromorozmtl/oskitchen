import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPurchaseSuggestionsP2_98,
  formatPurchaseSuggestionsP2_98AuditLines,
} from "@/lib/inventory/purchase-suggestions-p2-98-audit";
import { PURCHASE_SUGGESTIONS_P2_98_CAPABILITIES } from "@/lib/inventory/purchase-suggestions-p2-98-content";
import {
  buildForecastSignal,
  buildLowStockSignal,
  buildMenuDemandSignal,
  buildPurchaseSuggestionItem,
  buildPurchaseSuggestionsReport,
  buildVendorPriceSignal,
  PURCHASE_SUGGESTIONS_DEMO_FIXTURE,
} from "@/lib/inventory/purchase-suggestions-p2-98-operations";
import {
  PURCHASE_SUGGESTIONS_P2_98_CAPABILITY_COUNT,
  PURCHASE_SUGGESTIONS_P2_98_CI_WORKFLOW,
  PURCHASE_SUGGESTIONS_P2_98_DOC,
  PURCHASE_SUGGESTIONS_P2_98_NPM_SCRIPT,
  PURCHASE_SUGGESTIONS_P2_98_POLICY_ID,
  PURCHASE_SUGGESTIONS_P2_98_ROUTE,
  PURCHASE_SUGGESTIONS_P2_98_UNIT_TEST,
} from "@/lib/inventory/purchase-suggestions-p2-98-policy";

const ROOT = process.cwd();

describe("Purchase suggestions AI (P2-98)", () => {
  it("locks policy id, route, and four capabilities", () => {
    expect(PURCHASE_SUGGESTIONS_P2_98_POLICY_ID).toBe("purchase-suggestions-p2-98-v1");
    expect(PURCHASE_SUGGESTIONS_P2_98_ROUTE).toBe("/dashboard/inventory/purchase-suggestions");
    expect(PURCHASE_SUGGESTIONS_P2_98_CAPABILITY_COUNT).toBe(4);
    expect(PURCHASE_SUGGESTIONS_P2_98_CAPABILITIES).toHaveLength(4);
  });

  it("passes full purchase suggestions audit", () => {
    const summary = auditPurchaseSuggestionsP2_98(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyBuildersLinked).toBe(true);
    expect(summary.legacyServiceLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds four signal types from demo fixture", () => {
    const [critical] = PURCHASE_SUGGESTIONS_DEMO_FIXTURE;
    expect(buildForecastSignal(critical!).type).toBe("forecast");
    expect(buildLowStockSignal(critical!)?.type).toBe("low_stock");
    expect(buildMenuDemandSignal(critical!)?.type).toBe("menu_demand");
    expect(buildVendorPriceSignal(critical!)?.type).toBe("vendor_price");
  });

  it("builds purchase suggestion item with signals", () => {
    const item = buildPurchaseSuggestionItem(PURCHASE_SUGGESTIONS_DEMO_FIXTURE[0]!);
    expect(item.signals.length).toBeGreaterThanOrEqual(3);
    expect(item.urgency).toBe("critical");
    expect(item.estimatedTotal).toBeGreaterThan(0);
  });

  it("builds purchase suggestions report from demo fixture", () => {
    const report = buildPurchaseSuggestionsReport(PURCHASE_SUGGESTIONS_DEMO_FIXTURE);
    expect(report.itemCount).toBe(2);
    expect(report.forecastCount).toBe(2);
    expect(report.lowStockCount).toBeGreaterThanOrEqual(1);
    expect(report.menuDemandCount).toBeGreaterThanOrEqual(1);
    expect(report.estimatedSpend).toBeGreaterThan(0);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[PURCHASE_SUGGESTIONS_P2_98_NPM_SCRIPT]).toContain(
      "audit-purchase-suggestions-p2-98.ts",
    );
    expect(pkg.scripts["test:ci:purchase-suggestions-p2-98"]).toContain(
      PURCHASE_SUGGESTIONS_P2_98_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, PURCHASE_SUGGESTIONS_P2_98_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(PURCHASE_SUGGESTIONS_P2_98_NPM_SCRIPT);

    expect(existsSync(join(ROOT, PURCHASE_SUGGESTIONS_P2_98_DOC))).toBe(true);
    expect(
      formatPurchaseSuggestionsP2_98AuditLines(auditPurchaseSuggestionsP2_98(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
