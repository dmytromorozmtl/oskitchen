import {
  CORPORATE_DEFAULT_FOOD_COST_PCT,
  CORPORATE_DEFAULT_LABOR_PCT,
  CORPORATE_DEFAULT_OPEX_PCT,
  CORPORATE_FORECAST_PREVIEW_DAYS,
  CORPORATE_REPORTING_PATH,
  CORPORATE_REPORTING_POLICY_ID,
} from "@/lib/enterprise/corporate-reporting-policy";
import type {
  CorporateForecastStrip,
  CorporatePeriodComparison,
  CorporatePlLine,
  CorporateReportingDashboard,
  CorporateTrendPoint,
} from "@/lib/enterprise/corporate-reporting-types";
import type { Forecasting2Snapshot } from "@/lib/ai/forecasting-types";
import type { ExecutiveOverview } from "@/services/analytics/analytics-service";

export type CorporateReportingBuildInput = {
  workspaceId: string;
  current: ExecutiveOverview;
  previous: ExecutiveOverview;
  forecast: Forecasting2Snapshot;
  laborPercent?: number | null;
  foodCostPercent?: number | null;
  analyzedAt?: Date;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return round2(((current - previous) / previous) * 100);
}

function pctOfRevenue(amount: number, netRevenue: number): number | null {
  if (netRevenue <= 0) return null;
  return round2((amount / netRevenue) * 100);
}

export function buildCorporatePeriodComparison(
  current: ExecutiveOverview,
  previous: ExecutiveOverview,
): CorporatePeriodComparison {
  const changeAmount = round2(current.netRevenue - previous.netRevenue);
  return {
    currentNetRevenue: current.netRevenue,
    previousNetRevenue: previous.netRevenue,
    changeAmount,
    changePercent: pctChange(current.netRevenue, previous.netRevenue),
    orderCount: current.orderCount,
    previousOrderCount: previous.orderCount,
    orderChangePercent: pctChange(current.orderCount, previous.orderCount),
  };
}

export function buildCorporateTrends(current: ExecutiveOverview): CorporateTrendPoint[] {
  return current.dailyRevenue.map((row) => ({
    dateIso: row.date,
    revenue: round2(row.value),
  }));
}

export function buildCorporateForecastStrip(forecast: Forecasting2Snapshot): CorporateForecastStrip {
  const preview = forecast.dailyForecast.slice(0, CORPORATE_FORECAST_PREVIEW_DAYS).map((row) => ({
    dateIso: row.dateIso,
    revenueUsd: round2(row.adjustedRevenueUsd),
    orders: row.adjustedOrders,
  }));
  const nextSevenDaysRevenueUsd = round2(
    preview.reduce((sum, row) => sum + row.revenueUsd, 0),
  );

  return {
    horizonDays: forecast.horizonDays,
    projectedRevenueUsd: round2(forecast.summary.projectedTotalRevenueUsd),
    projectedOrders: forecast.summary.projectedTotalOrders,
    nextSevenDaysRevenueUsd,
    confidence: forecast.summary.confidence,
    weatherUpliftDays: forecast.summary.weatherUpliftDays,
    holidayUpliftDays: forecast.summary.holidayUpliftDays,
    warning: forecast.summary.warning,
    preview,
  };
}

export function buildCorporatePlLines(input: {
  grossRevenue: number;
  netRevenue: number;
  cancelledRevenue: number;
  foodCostAmount: number;
  laborCostAmount: number;
  opexAmount: number;
}): CorporatePlLine[] {
  const { grossRevenue, netRevenue, cancelledRevenue, foodCostAmount, laborCostAmount, opexAmount } =
    input;
  const grossProfit = round2(netRevenue - foodCostAmount);
  const ebitdaProxy = round2(grossProfit - laborCostAmount - opexAmount);

  return [
    {
      id: "gross_revenue",
      label: "Gross revenue",
      amount: grossRevenue,
      percentOfNetRevenue: pctOfRevenue(grossRevenue, netRevenue),
      kind: "revenue",
    },
    {
      id: "cancelled",
      label: "Cancelled / refunds",
      amount: -cancelledRevenue,
      percentOfNetRevenue: pctOfRevenue(cancelledRevenue, netRevenue),
      kind: "expense",
      indent: true,
    },
    {
      id: "net_revenue",
      label: "Net revenue",
      amount: netRevenue,
      percentOfNetRevenue: 100,
      kind: "subtotal",
    },
    {
      id: "cogs",
      label: "Cost of goods sold (food)",
      amount: -foodCostAmount,
      percentOfNetRevenue: pctOfRevenue(foodCostAmount, netRevenue),
      kind: "expense",
      indent: true,
    },
    {
      id: "gross_profit",
      label: "Gross profit",
      amount: grossProfit,
      percentOfNetRevenue: pctOfRevenue(grossProfit, netRevenue),
      kind: "subtotal",
    },
    {
      id: "labor",
      label: "Labor",
      amount: -laborCostAmount,
      percentOfNetRevenue: pctOfRevenue(laborCostAmount, netRevenue),
      kind: "expense",
      indent: true,
    },
    {
      id: "opex",
      label: "Operating expenses",
      amount: -opexAmount,
      percentOfNetRevenue: pctOfRevenue(opexAmount, netRevenue),
      kind: "expense",
      indent: true,
    },
    {
      id: "ebitda",
      label: "EBITDA (proxy)",
      amount: ebitdaProxy,
      percentOfNetRevenue: pctOfRevenue(ebitdaProxy, netRevenue),
      kind: "total",
    },
  ];
}

export function buildCorporateReportingDashboard(
  input: CorporateReportingBuildInput,
): CorporateReportingDashboard {
  const foodCostPct = input.foodCostPercent ?? CORPORATE_DEFAULT_FOOD_COST_PCT;
  const laborPct = input.laborPercent ?? CORPORATE_DEFAULT_LABOR_PCT;
  const netRevenue = input.current.netRevenue;

  const foodCostAmount = round2(netRevenue * (foodCostPct / 100));
  const laborCostAmount = round2(netRevenue * (laborPct / 100));
  const opexAmount = round2(netRevenue * (CORPORATE_DEFAULT_OPEX_PCT / 100));
  const grossProfit = round2(netRevenue - foodCostAmount);
  const ebitdaProxy = round2(grossProfit - laborCostAmount - opexAmount);

  const plLines = buildCorporatePlLines({
    grossRevenue: input.current.grossRevenue,
    netRevenue,
    cancelledRevenue: input.current.cancelledRevenue,
    foodCostAmount,
    laborCostAmount,
    opexAmount,
  });

  const warnings: string[] = [...input.current.warnings];
  if (input.foodCostPercent == null) {
    warnings.push(
      `Food cost estimated at ${CORPORATE_DEFAULT_FOOD_COST_PCT}% — run costing for actual COGS.`,
    );
  }
  if (input.laborPercent == null) {
    warnings.push(
      `Labor estimated at ${CORPORATE_DEFAULT_LABOR_PCT}% — connect time clock for actual labor %.`,
    );
  }
  const forecastStrip = buildCorporateForecastStrip(input.forecast);
  if (forecastStrip.warning) {
    warnings.push(forecastStrip.warning);
  }

  return {
    policyId: CORPORATE_REPORTING_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    rangeLabel: input.current.filtersRangeLabel,
    plLines,
    trends: buildCorporateTrends(input.current),
    periodComparison: buildCorporatePeriodComparison(input.current, input.previous),
    forecast: forecastStrip,
    summary: {
      grossRevenue: input.current.grossRevenue,
      netRevenue,
      grossProfit,
      ebitdaProxy,
      netOperatingIncome: ebitdaProxy,
      grossMarginPercent: netRevenue > 0 ? pctOfRevenue(grossProfit, netRevenue) : null,
      laborPercent: laborPct,
      foodCostPercent: foodCostPct,
    },
    warnings,
    basePath: CORPORATE_REPORTING_PATH,
  };
}
