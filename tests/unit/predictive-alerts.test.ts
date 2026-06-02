import { describe, expect, it } from "vitest";

import {
  mergePredictiveAlerts,
  predictDemandSurges,
  predictInventoryShortages,
  predictLaborGaps,
  predictMarginDeclines,
} from "@/lib/ai/predictive-alerts-builders";
import type { IngredientDemandRow } from "@/lib/ingredient-demand/types";
import type { AiSchedulePlan } from "@/services/labor/ai-scheduling-service";

const now = new Date("2026-06-05T12:00:00.000Z");

describe("predictive alerts builders", () => {
  it("predicts inventory stockouts before lead time", () => {
    const rows: IngredientDemandRow[] = [
      {
        ingredientId: "ing-1",
        name: "Tomatoes",
        category: "Produce",
        unit: "lb",
        dateKey: "2026-06-05",
        required: 70,
        stock: 8,
        shortage: 0,
        supplier: null,
        relatedProducts: [],
        estimatedCost: 140,
      },
    ];
    const alerts = predictInventoryShortages(rows, 7, { now, leadTimeDays: 3 });
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0]?.type).toBe("inventory_shortage");
    expect(alerts[0]?.impact).toBeGreaterThan(0);
    expect(alerts[0]?.confidence).toBeGreaterThan(0.5);
    expect(alerts[0]?.suggestedAction).toContain("purchase order");
  });

  it("predicts labor gaps when understaffed", () => {
    const plan: AiSchedulePlan = {
      weekStartIso: "2026-06-02",
      targetLaborPct: 28,
      avgHourlyRate: 20,
      days: [
        {
          dateIso: "2026-06-06",
          dayLabel: "Fri",
          predictedRevenue: 3000,
          predictedOrders: 90,
          recommendedHeadcount: 5,
          projectedLaborCost: 800,
          projectedLaborPct: 27,
          shifts: [],
        },
      ],
      summary: {
        totalProjectedRevenue: 3000,
        totalProjectedLabor: 800,
        blendedLaborPct: 27,
        totalShifts: 0,
        confidence: "high",
        notes: [],
      },
    };
    const alerts = predictLaborGaps(plan, 20, { now });
    expect(alerts.some((a) => a.type === "labor_gap")).toBe(true);
    expect(alerts[0]?.severity).toBe("critical");
  });

  it("predicts margin decline when food cost rises", () => {
    const previous = new Map([["p1", 42]]);
    const alerts = predictMarginDeclines(
      [
        {
          productId: "p1",
          itemTitle: "Burger",
          grossMarginPercent: 28,
          foodCostPercent: 38,
          warningLevel: "CRITICAL",
          salePrice: 15,
          suggestedPrice: 16.5,
        },
      ],
      previous,
      35,
      { now },
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.type).toBe("margin_decline");
    expect(alerts[0]?.description).toContain("AI-assisted");
  });

  it("predicts demand surges on peak days", () => {
    const plan: AiSchedulePlan = {
      weekStartIso: "2026-06-02",
      targetLaborPct: 28,
      avgHourlyRate: 18,
      days: [
        {
          dateIso: "2026-06-02",
          dayLabel: "Mon",
          predictedRevenue: 800,
          predictedOrders: 30,
          recommendedHeadcount: 2,
          projectedLaborCost: 200,
          projectedLaborPct: 25,
          shifts: [],
        },
        {
          dateIso: "2026-06-06",
          dayLabel: "Fri",
          predictedRevenue: 2400,
          predictedOrders: 80,
          recommendedHeadcount: 4,
          projectedLaborCost: 600,
          projectedLaborPct: 25,
          shifts: [],
        },
      ],
      summary: {
        totalProjectedRevenue: 3200,
        totalProjectedLabor: 800,
        blendedLaborPct: 25,
        totalShifts: 0,
        confidence: "medium",
        notes: [],
      },
    };
    const alerts = predictDemandSurges(plan, null, 5000, { now });
    expect(alerts.some((a) => a.type === "demand_surge" && a.title.includes("Fri"))).toBe(true);
  });

  it("sorts merged alerts by impact descending", () => {
    const merged = mergePredictiveAlerts([
      {
        id: "a",
        type: "labor_gap",
        severity: "warning",
        title: "Low",
        description: "d",
        impact: 50,
        confidence: 0.7,
        suggestedAction: "act",
        expiresAt: now,
      },
      {
        id: "b",
        type: "inventory_shortage",
        severity: "critical",
        title: "High",
        description: "d",
        impact: 500,
        confidence: 0.9,
        suggestedAction: "act",
        expiresAt: now,
      },
    ]);
    expect(merged[0]?.id).toBe("b");
  });
});
