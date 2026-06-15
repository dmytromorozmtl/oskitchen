import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PLAN_REGISTRY } from "@/lib/billing/plan-registry";
import {
  PRICING_COMPETITOR_BENCHMARK_COMPETITORS,
  PRICING_COMPETITOR_BENCHMARK_DISCLAIMER,
  PRICING_COMPETITOR_BENCHMARK_POLICY_ID,
  PRICING_COMPETITOR_BENCHMARK_ROWS,
  PRICING_TRANSPARENCY_REQUIRED_PLAN_PRICES,
  getPublishedOsKitchenPlanPrices,
} from "@/lib/marketing/pricing-competitor-benchmark";
import { PUBLIC_PRICING_PLANS } from "@/lib/marketing/public-pricing-content";

/**
 * Absolute Final Task 35 — /pricing transparency audit (real prices + competitor benchmark).
 */

export const PRICING_TRANSPARENCY_ABSOLUTE_FINAL_DOC =
  "docs/transparent-pricing-sales-guide.md" as const;

export const PRICING_PAGE_COMPONENT = "components/marketing/pricing-page.tsx" as const;

export const PRICING_BENCHMARK_COMPONENT =
  "components/marketing/pricing-competitor-benchmark.tsx" as const;

export const PRICING_TRANSPARENCY_CI_SCRIPTS = [
  "test:ci:pricing-transparency-absolute-final",
] as const;

export type PricingTransparencyAudit = {
  policyId: typeof PRICING_COMPETITOR_BENCHMARK_POLICY_ID;
  registryPriceMismatches: string[];
  publicPlanMismatches: string[];
  competitorCount: number;
  benchmarkRowCount: number;
  pricingPageHasBenchmark: boolean;
  passed: boolean;
};

export function auditPlanRegistryPublishedPrices(): string[] {
  const mismatches: string[] = [];
  const entries = Object.entries(PRICING_TRANSPARENCY_REQUIRED_PLAN_PRICES) as Array<
    [keyof typeof PRICING_TRANSPARENCY_REQUIRED_PLAN_PRICES, number]
  >;

  for (const [key, expected] of entries) {
    const actual = PLAN_REGISTRY[key].priceMonthlyUsd;
    if (actual !== expected) {
      mismatches.push(`${key}: expected $${expected}, got $${actual ?? "null"}`);
    }
  }

  return mismatches;
}

export function auditPublicPricingPlansSync(): string[] {
  const published = getPublishedOsKitchenPlanPrices();
  const mismatches: string[] = [];

  for (const card of PUBLIC_PRICING_PLANS) {
    const registryPrice = PLAN_REGISTRY[card.key].priceMonthlyUsd;
    if (card.monthly !== registryPrice) {
      mismatches.push(
        `${card.key}: card $${card.monthly ?? "null"} vs registry $${registryPrice ?? "null"}`,
      );
    }
    if (card.key === "STARTER" && published.starter !== 49) {
      mismatches.push(`Starter published price drift: ${published.starter}`);
    }
  }

  return mismatches;
}

export function auditPricingTransparencyFromRoot(root = process.cwd()): PricingTransparencyAudit {
  const pricingPageSource = readFileSync(join(root, PRICING_PAGE_COMPONENT), "utf8");
  const registryPriceMismatches = auditPlanRegistryPublishedPrices();
  const publicPlanMismatches = auditPublicPricingPlansSync();

  return {
    policyId: PRICING_COMPETITOR_BENCHMARK_POLICY_ID,
    registryPriceMismatches,
    publicPlanMismatches,
    competitorCount: PRICING_COMPETITOR_BENCHMARK_COMPETITORS.length,
    benchmarkRowCount: PRICING_COMPETITOR_BENCHMARK_ROWS.length,
    pricingPageHasBenchmark:
      pricingPageSource.includes("PricingCompetitorBenchmark") ||
      pricingPageSource.includes("pricing-competitor-benchmark"),
    passed:
      registryPriceMismatches.length === 0 &&
      publicPlanMismatches.length === 0 &&
      PRICING_COMPETITOR_BENCHMARK_COMPETITORS.length === 4 &&
      PRICING_COMPETITOR_BENCHMARK_ROWS.length >= 5 &&
      PRICING_COMPETITOR_BENCHMARK_DISCLAIMER.length > 0 &&
      (pricingPageSource.includes("PricingCompetitorBenchmark") ||
        pricingPageSource.includes("pricing-competitor-benchmark")),
  };
}
