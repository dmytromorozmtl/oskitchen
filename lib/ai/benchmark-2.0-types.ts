import type { BenchmarkDashboardPayload } from "@/lib/ai/benchmark-dashboard-types";
import type { BenchmarkNetworkResult } from "@/lib/ai/benchmark-network-types";

export type BenchmarkPremiumStatus = "none" | "trialing" | "active" | "cancelled";

export type BenchmarkPremiumPlanId = "benchmark_premium_monthly";

export type BenchmarkReportCadence = "monthly" | "quarterly" | "special";

export type BenchmarkReportSection = {
  id: string;
  title: string;
  body: string;
  metricKeys?: string[];
  highlight?: "positive" | "negative" | "neutral";
};

export type IndustryBenchmarkReport = {
  id: string;
  title: string;
  cadence: BenchmarkReportCadence;
  cohortLabel: string;
  generatedAt: string;
  periodLabel: string;
  executiveSummary: string;
  sections: BenchmarkReportSection[];
  premiumOnly: true;
  locked: boolean;
};

export type BenchmarkPremiumSubscription = {
  status: BenchmarkPremiumStatus;
  planId: BenchmarkPremiumPlanId | null;
  priceUsdMonthly: number;
  subscribedAt: string | null;
  currentPeriodEnd: string | null;
  includedWithPlan: boolean;
  source: "addon" | "pro_bundle" | "none";
};

export type BenchmarkPremiumDashboard = {
  workspaceId: string;
  isPremium: boolean;
  subscription: BenchmarkPremiumSubscription;
  reports: IndustryBenchmarkReport[];
  benchmark: BenchmarkDashboardPayload;
  stripeCheckoutAvailable: boolean;
};

export type BenchmarkPremiumSettings = {
  status?: BenchmarkPremiumStatus;
  planId?: BenchmarkPremiumPlanId;
  subscribedAt?: string;
  currentPeriodEnd?: string;
  viewedReportIds?: string[];
};

export type GenerateIndustryReportInput = {
  reportId: string;
  data: BenchmarkNetworkResult;
  locked?: boolean;
};
