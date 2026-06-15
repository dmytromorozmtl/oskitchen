import { describe, expect, it } from "vitest";

import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";
import {
  PRICING_COMPETITOR_BENCHMARK_COMPETITORS,
  PRICING_COMPETITOR_BENCHMARK_ROWS,
  PRICING_TRANSPARENCY_REQUIRED_PLAN_PRICES,
  formatPublishedOsKitchenPriceRange,
  getPublishedOsKitchenPlanPrices,
} from "@/lib/marketing/pricing-competitor-benchmark";
import {
  auditPlanRegistryPublishedPrices,
  auditPricingTransparencyFromRoot,
  auditPublicPricingPlansSync,
} from "@/lib/marketing/pricing-transparency-absolute-final-policy";
import {
  PUBLIC_PRICING_PLANS,
  PUBLIC_PRICING_SOURCE,
} from "@/lib/marketing/public-pricing-content";

describe("pricing transparency absolute final (Task 35)", () => {
  it("locks published plan prices at $49 / $79 / $199 / $499", () => {
    expect(PRICING_TRANSPARENCY_REQUIRED_PLAN_PRICES).toEqual({
      STARTER: 49,
      PRO: 79,
      TEAM: 199,
      ENTERPRISE: 499,
    });
    expect(getPublishedOsKitchenPlanPrices()).toEqual({
      starter: 49,
      pro: 79,
      team: 199,
      enterprise: 499,
    });
    expect(PLAN_REGISTRY.STARTER.priceMonthlyUsd).toBe(49);
  });

  it("syncs PUBLIC_PRICING_PLANS monthly amounts from PLAN_REGISTRY", () => {
    expect(PUBLIC_PRICING_SOURCE).toBe("PLAN_REGISTRY");
    expect(auditPublicPricingPlansSync()).toEqual([]);
    for (const card of PUBLIC_PRICING_PLANS) {
      expect(card.monthly).toBe(PLAN_REGISTRY[card.key].priceMonthlyUsd);
    }
  });

  it("includes four competitor benchmark columns and six comparison rows", () => {
    expect(PRICING_COMPETITOR_BENCHMARK_COMPETITORS).toEqual([
      "Toast",
      "Square",
      "Lightspeed",
      "TouchBistro",
    ]);
    expect(PRICING_COMPETITOR_BENCHMARK_ROWS.length).toBeGreaterThanOrEqual(5);
    expect(formatPublishedOsKitchenPriceRange()).toContain("$49");
    expect(formatPublishedOsKitchenPriceRange()).toContain("$199");
  });

  it("embeds OS Kitchen registry prices in benchmark rows", () => {
    const softwareRow = PRICING_COMPETITOR_BENCHMARK_ROWS.find(
      (row) => row.dimension === "Published software price",
    );
    expect(softwareRow?.osKitchen).toContain("Starter $49");
    expect(softwareRow?.osKitchen).toContain("Pro $79");
    expect(softwareRow?.osKitchen).toContain("Team $199");
  });

  it("passes full pricing transparency audit including /pricing benchmark section", () => {
    expect(auditPlanRegistryPublishedPrices()).toEqual([]);
    const audit = auditPricingTransparencyFromRoot();
    expect(audit.registryPriceMismatches).toEqual([]);
    expect(audit.publicPlanMismatches).toEqual([]);
    expect(audit.competitorCount).toBe(4);
    expect(audit.pricingPageHasBenchmark).toBe(true);
    expect(audit.passed).toBe(true);
  });
});
