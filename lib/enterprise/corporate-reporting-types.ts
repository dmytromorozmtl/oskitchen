import type { CORPORATE_REPORTING_POLICY_ID } from "@/lib/enterprise/corporate-reporting-policy";

export type CorporatePlLineKind = "revenue" | "expense" | "subtotal" | "total";

export type CorporatePlLine = {
  id: string;
  label: string;
  amount: number;
  percentOfNetRevenue: number | null;
  kind: CorporatePlLineKind;
  indent?: boolean;
};

export type CorporateTrendPoint = {
  dateIso: string;
  revenue: number;
};

export type CorporatePeriodComparison = {
  currentNetRevenue: number;
  previousNetRevenue: number;
  changeAmount: number;
  changePercent: number | null;
  orderCount: number;
  previousOrderCount: number;
  orderChangePercent: number | null;
};

export type CorporateForecastStrip = {
  horizonDays: number;
  projectedRevenueUsd: number;
  projectedOrders: number;
  nextSevenDaysRevenueUsd: number;
  confidence: "low" | "medium" | "high";
  weatherUpliftDays: number;
  holidayUpliftDays: number;
  warning: string | null;
  preview: { dateIso: string; revenueUsd: number; orders: number }[];
};

export type CorporateReportingDashboard = {
  policyId: typeof CORPORATE_REPORTING_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  rangeLabel: string;
  plLines: CorporatePlLine[];
  trends: CorporateTrendPoint[];
  periodComparison: CorporatePeriodComparison;
  forecast: CorporateForecastStrip;
  summary: {
    grossRevenue: number;
    netRevenue: number;
    grossProfit: number;
    ebitdaProxy: number;
    netOperatingIncome: number;
    grossMarginPercent: number | null;
    laborPercent: number;
    foodCostPercent: number;
  };
  warnings: string[];
  basePath: string;
};
