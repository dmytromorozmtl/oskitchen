import { describe, expect, it } from "vitest";

import {
  buildPurchasingAiDashboardPayload,
  buildPurchasingAiRows,
  daysRemainingTone,
  parseAiPurchasingUiState,
} from "@/lib/ai/ai-purchasing-dashboard-builders";
import type { AiPurchasingResult } from "@/lib/ai/ai-purchasing-types";

const sampleResult: AiPurchasingResult = {
  workspaceId: "ws-1",
  analyzedAt: "2026-06-01T00:00:00.000Z",
  forecastHorizonDays: 14,
  recommendations: [
    {
      ingredientId: "i1",
      ingredientName: "Flour",
      unit: "lb",
      category: "Dry",
      currentStock: 5,
      reorderPoint: 8,
      dailyUsage: 2,
      predictedDemand14d: 28,
      daysRemaining: 2.5,
      urgency: "high",
      bestSupplier: {
        supplierId: "s1",
        supplierName: "Sysco",
        supplierItemId: "si1",
        unitCost: 1.1,
        eoq: 20,
        orderQuantity: 25,
        orderTotal: 27.5,
        leadTimeDays: 2,
      },
      alternativeSupplier: {
        supplierId: "s2",
        supplierName: "US Foods",
        supplierItemId: "si2",
        unitCost: 1.25,
        eoq: 18,
        orderQuantity: 25,
        orderTotal: 31.25,
        leadTimeDays: 3,
        savingsPerOrder: 3.75,
        savingsPercent: 12,
      },
      shortagePrediction: {
        predictedShortageQty: 23,
        shortageDateIso: "2026-06-03T00:00:00.000Z",
        daysUntilShortage: 2.5,
        coverageGapDays: 0,
      },
      priceOptimization: {
        optimizedUnitCost: 1.1,
        currentBestUnitCost: 1.1,
        savingsPerUnit: 0,
        savingsPerOrder: 0,
        recommendation: "order_now",
        rationale: "Stock coverage is below lead time — prioritize replenishment over price shopping.",
      },
      confidence: 0.82,
      suggestedAction: "Order 25 lb from Sysco",
    },
  ],
  dailyBrief: {
    generatedAtIso: "2026-06-01T00:00:00.000Z",
    headline: "1 items need orders today — $28 estimated spend",
    executiveSummary: "Shortage prediction flags 1 urgent line. 0 alternative supplier switches can reduce spend.",
    topShortages: [{ ingredientName: "Flour", daysUntilShortage: 2.5, predictedShortageQty: 23 }],
    topSavings: [],
    priceSwitchCount: 0,
    orderTodayCount: 1,
    bullets: ["1 item below lead-time coverage"],
  },
  summary: {
    itemCount: 1,
    criticalCount: 0,
    highCount: 1,
    totalEstimatedSpend: 27.5,
    totalPotentialSavings: 3.75,
    averageConfidence: 0.82,
    shortageCount: 1,
    priceSwitchCount: 0,
  },
  aiAssisted: true,
  confidence: 0.85,
};

describe("daysRemainingTone", () => {
  it("returns red for critical urgency", () => {
    expect(daysRemainingTone(0.5, "critical")).toBe("red");
  });

  it("returns amber for high urgency", () => {
    expect(daysRemainingTone(2, "high")).toBe("amber");
  });
});

describe("buildPurchasingAiRows", () => {
  it("applies quantity override and skip state", () => {
    const rows = buildPurchasingAiRows(sampleResult, {
      skipped: {},
      quantityOverrides: { i1: 40 },
    });
    expect(rows[0]!.orderQuantity).toBe(40);
    expect(rows[0]!.bestSupplier.orderTotal).toBe(44);
    expect(rows[0]!.daysTone).toBe("amber");
  });

  it("marks skipped rows", () => {
    const rows = buildPurchasingAiRows(sampleResult, {
      skipped: { i1: { reason: "Already ordered", skippedAt: "2026-06-01" } },
      quantityOverrides: {},
    });
    expect(rows[0]!.skipped).toBe(true);
    expect(rows[0]!.skipReason).toBe("Already ordered");
  });
});

describe("buildPurchasingAiDashboardPayload", () => {
  it("excludes skipped from active summary", () => {
    const payload = buildPurchasingAiDashboardPayload(sampleResult, {
      skipped: { i1: { reason: "Skip", skippedAt: "2026-06-01" } },
      quantityOverrides: {},
    });
    expect(payload.activeRows).toHaveLength(0);
    expect(payload.skippedRows).toHaveLength(1);
    expect(payload.summary.itemCount).toBe(0);
  });
});

describe("parseAiPurchasingUiState", () => {
  it("parses valid storage", () => {
    const state = parseAiPurchasingUiState({
      skipped: { i1: { reason: "test", skippedAt: "2026-06-01" } },
      quantityOverrides: { i1: 10 },
    });
    expect(state.skipped.i1?.reason).toBe("test");
    expect(state.quantityOverrides.i1).toBe(10);
  });
});
