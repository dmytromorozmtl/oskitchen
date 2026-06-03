import { describe, expect, it } from "vitest";

import {
  BENCHMARK_REPORT_CATALOG,
  buildIndustryReportCatalog,
  generateIndustryReport,
} from "@/lib/ai/benchmark-2.0-builders";
import { resolveBenchmarkPremiumAccess } from "@/services/ai/benchmark-2.0-service";
import type { BenchmarkNetworkResult } from "@/lib/ai/benchmark-network-types";

function sampleBenchmarkData(): BenchmarkNetworkResult {
  return {
    workspaceId: "ws_test",
    analyzedAt: new Date().toISOString(),
    cohort: {
      id: "restaurant-na",
      label: "Full-service restaurants · North America",
      businessType: "RESTAURANT",
      region: "NA",
      sampleSize: 1240,
      anonymized: true,
    },
    metrics: [
      {
        key: "food_cost_percent",
        label: "Food cost %",
        category: "cost",
        unit: "percent",
        yourValue: 32,
        industryAverage: 30,
        topQuartile: 28,
        bottomQuartile: 34,
        percentileRank: 42,
        sampleSize: 1240,
        trend: "stable",
        higherIsBetter: false,
      },
      {
        key: "revenue_per_day",
        label: "Revenue / day",
        category: "revenue",
        unit: "currency",
        yourValue: 4200,
        industryAverage: 3800,
        topQuartile: 5100,
        bottomQuartile: 2900,
        percentileRank: 68,
        sampleSize: 1240,
        trend: "up",
        higherIsBetter: true,
      },
      {
        key: "kds_wait_minutes",
        label: "KDS wait (min)",
        category: "operations",
        unit: "minutes",
        yourValue: 11,
        industryAverage: 14,
        topQuartile: 9,
        bottomQuartile: 18,
        percentileRank: 71,
        sampleSize: 1240,
        trend: "down",
        higherIsBetter: false,
      },
    ],
    summary: {
      metricCount: 3,
      aboveTopQuartile: 1,
      belowBottomQuartile: 0,
      averagePercentile: 60,
      strongMetrics: ["revenue_per_day"],
      weakMetrics: ["food_cost_percent"],
    },
    aiAssisted: true,
    confidence: 0.82,
  };
}

describe("benchmark-2.0 builders", () => {
  it("generates all catalog reports", () => {
    const data = sampleBenchmarkData();
    for (const entry of BENCHMARK_REPORT_CATALOG) {
      const report = generateIndustryReport({ reportId: entry.id, data, locked: false });
      expect(report.title).toBe(entry.title);
      expect(report.executiveSummary).toContain("60th percentile");
      expect(report.sections.length).toBeGreaterThan(0);
    }
  });

  it("locks report content for non-premium users", () => {
    const reports = buildIndustryReportCatalog(sampleBenchmarkData(), false);
    expect(reports.every((r) => r.locked)).toBe(true);
  });

  it("unlocks reports for premium users", () => {
    const reports = buildIndustryReportCatalog(sampleBenchmarkData(), true);
    expect(reports.every((r) => !r.locked)).toBe(true);
  });
});

describe("resolveBenchmarkPremiumAccess", () => {
  it("grants premium for active PRO subscription", () => {
    const result = resolveBenchmarkPremiumAccess({
      settings: {},
      subscription: {
        plan: "PRO",
        status: "ACTIVE",
        statusDetail: "ACTIVE",
        billingMode: "STRIPE",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        currentPeriodStart: null,
        currentPeriodEnd: new Date("2030-01-01"),
        trialStart: null,
        trialEnd: null,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });
    expect(result.isPremium).toBe(true);
    expect(result.subscription.includedWithPlan).toBe(true);
    expect(result.subscription.source).toBe("pro_bundle");
  });

  it("grants premium for active addon trial", () => {
    const result = resolveBenchmarkPremiumAccess({
      settings: {
        status: "trialing",
        currentPeriodEnd: new Date(Date.now() + 86400000).toISOString(),
      },
      subscription: {
        plan: "STARTER",
        status: "TRIALING",
        statusDetail: "TRIALING",
        billingMode: "STRIPE",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        trialStart: null,
        trialEnd: null,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });
    expect(result.isPremium).toBe(true);
    expect(result.subscription.source).toBe("addon");
  });
});
