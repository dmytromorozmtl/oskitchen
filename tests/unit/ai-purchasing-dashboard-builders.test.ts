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
      confidence: 0.82,
      suggestedAction: "Order 25 lb from Sysco",
    },
  ],
  summary: {
    itemCount: 1,
    criticalCount: 0,
    highCount: 1,
    totalEstimatedSpend: 27.5,
    totalPotentialSavings: 3.75,
    averageConfidence: 0.82,
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
