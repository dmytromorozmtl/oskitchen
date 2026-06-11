"use client";

import dynamic from "next/dynamic";

import { ChartPanelSkeleton } from "@/components/charts/chart-panel-skeleton";

const loading = () => <ChartPanelSkeleton />;

/** Top-5 heavy chart panels — code-split recharts out of route First Load JS. */
export const LazyBenchmarkDashboard = dynamic(
  () =>
    import("@/components/dashboard/benchmark-dashboard").then((m) => ({
      default: m.BenchmarkDashboard,
    })),
  { loading, ssr: false },
);

export const LazyFoodCostDashboard = dynamic(
  () =>
    import("@/components/dashboard/food-cost-dashboard").then((m) => ({
      default: m.FoodCostDashboard,
    })),
  { loading, ssr: false },
);

export const LazyMarketplaceAnalyticsClient = dynamic(
  () =>
    import("@/components/marketplace/marketplace-analytics-client").then((m) => ({
      default: m.MarketplaceAnalyticsClient,
    })),
  { loading, ssr: false },
);

export const LazyVendorFinanceClient = dynamic(
  () =>
    import("@/components/marketplace/vendor-finance-client").then((m) => ({
      default: m.VendorFinanceClient,
    })),
  { loading, ssr: false },
);

export const LazyOverviewCharts = dynamic(
  () =>
    import("@/components/dashboard/overview-charts").then((m) => ({
      default: m.OverviewCharts,
    })),
  { loading, ssr: false },
);
