import { NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES } from "@/lib/finance/native-budgeting-p3-91-content";
import {
  loadNativeBudgetSettings,
  resolveCategoryPercent,
} from "@/lib/finance/native-budgeting-settings";
import type {
  NativeBudgetCategoryKey,
  NativeBudgetSettings,
  NativeBudgetVsActualLine,
  NativeBudgetVsActualModel,
} from "@/lib/finance/native-budgeting-types";
import type { PnlLine, PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function variancePct(actual: number, budget: number): number | null {
  if (budget === 0) return null;
  return round2(((actual - budget) / budget) * 100);
}

export async function resolveNativeBudgetSettings(userId: string): Promise<NativeBudgetSettings> {
  return loadNativeBudgetSettings(userId);
}

export function buildNativeBudgetTargets(
  revenue: number,
  settings: NativeBudgetSettings,
): Record<NativeBudgetCategoryKey, number> {
  const revenueBase = settings.revenueTargetUsd ?? revenue;
  const out = {} as Record<NativeBudgetCategoryKey, number>;
  for (const cat of NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES) {
    out[cat.key] = round2(revenueBase * resolveCategoryPercent(cat.key, settings));
  }
  return out;
}

export function pnlLineBudgetAmount(
  key: string,
  revenue: number,
  settings: NativeBudgetSettings,
): number {
  if (key === "revenue") {
    return round2(settings.revenueTargetUsd ?? revenue);
  }
  if (key === "gross") {
    const foodPct = resolveCategoryPercent("food_cost", settings);
    return round2((settings.revenueTargetUsd ?? revenue) * (1 - foodPct));
  }
  if (key === "ebitda") {
    return round2((settings.revenueTargetUsd ?? revenue) * resolveCategoryPercent("ebitda", settings));
  }
  if (key === "net") {
    return round2((settings.revenueTargetUsd ?? revenue) * resolveCategoryPercent("net_income", settings));
  }
  const map: Record<string, NativeBudgetCategoryKey> = {
    food_cost: "food_cost",
    labor: "labor",
    occupancy: "occupancy",
    supplies: "supplies",
    repairs: "repairs",
    marketing: "marketing",
    admin: "admin",
  };
  const catKey = map[key];
  if (!catKey) {
    return round2(revenue * 0);
  }
  return round2((settings.revenueTargetUsd ?? revenue) * resolveCategoryPercent(catKey, settings));
}

export function enrichPnlLinesWithNativeBudget(
  lines: PnlLine[],
  revenue: number,
  settings: NativeBudgetSettings,
): PnlLine[] {
  return lines.map((line) => {
    const budget = pnlLineBudgetAmount(line.key, revenue, settings);
    return {
      ...line,
      budget,
      variance: round2(line.actual - budget),
    };
  });
}

export function buildNativeBudgetVsActualModel(
  period: PnlPeriod,
  revenueActual: number,
  pnlLines: PnlLine[],
  settings: NativeBudgetSettings,
): NativeBudgetVsActualModel {
  const revenueBudget = pnlLineBudgetAmount("revenue", revenueActual, settings);
  const usesOperatorTargets =
    settings.revenueTargetUsd != null || Object.keys(settings.categoryOverrides).length > 0;

  const lines: NativeBudgetVsActualLine[] = pnlLines.map((l) => ({
    key: l.key as NativeBudgetVsActualLine["key"],
    label: l.label,
    actual: l.actual,
    budget: l.budget,
    variance: l.variance,
    variancePct: variancePct(l.actual, l.budget),
    isSubtotal: l.isSubtotal,
  }));

  return {
    period,
    revenueActual,
    revenueBudget,
    lines,
    usesOperatorTargets,
  };
}
