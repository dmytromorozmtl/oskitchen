import {
  buildNativeBudgetVsActualModel,
  resolveNativeBudgetSettings,
} from "@/lib/finance/native-budgeting-builders";
import type { NativeBudgetVsActualModel } from "@/lib/finance/native-budgeting-types";
import {
  getRestaurantPnLStatement,
  type PnlPeriod,
} from "@/services/accounting/restaurant-pnl-service";

export async function loadNativeBudgetVsActual(
  userId: string,
  period: PnlPeriod = "month",
): Promise<NativeBudgetVsActualModel> {
  const [statement, settings] = await Promise.all([
    getRestaurantPnLStatement(userId, period),
    resolveNativeBudgetSettings(userId),
  ]);

  const enrichedLines = statement.lines;

  return buildNativeBudgetVsActualModel(
    period,
    statement.summary.totalRevenue,
    enrichedLines,
    settings,
  );
}

export type NativeBudgetDashboardModel = NativeBudgetVsActualModel & {
  primeCostActual: number;
  primeCostBudget: number;
  foodCostTargetPct: number;
  laborCostTargetPct: number;
};

export async function loadNativeBudgetDashboard(
  userId: string,
  period: PnlPeriod = "month",
): Promise<NativeBudgetDashboardModel> {
  const model = await loadNativeBudgetVsActual(userId, period);
  const statement = await getRestaurantPnLStatement(userId, period);

  const foodLine = model.lines.find((l) => l.key === "food_cost");
  const laborLine = model.lines.find((l) => l.key === "labor");
  const rev = model.revenueActual || 1;

  return {
    ...model,
    primeCostActual: statement.summary.primeCostPct,
    primeCostBudget: round1(
      ((foodLine?.budget ?? 0) + (laborLine?.budget ?? 0)) / rev * 100,
    ),
    foodCostTargetPct: statement.summary.targets.foodCostPct,
    laborCostTargetPct: statement.summary.targets.laborCostPct,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
