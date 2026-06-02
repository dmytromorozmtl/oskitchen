import type { IngredientDemandRow } from "@/lib/ingredient-demand/types";
import type { AiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import type { OvertimePrediction } from "@/services/labor/labor-realtime-service";
import type {
  BriefingTrend,
  BriefingUrgency,
  InventoryBriefingAlert,
  LaborBriefingInsight,
  MenuBriefingInsight,
  ProfitBriefingInsight,
  StaffBriefingInsight,
  WeeklyBriefingForecast,
} from "@/lib/ai/restaurant-brain-types";

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function trendFromDelta(deltaPct: number | null, threshold = 2): BriefingTrend {
  if (deltaPct == null || Math.abs(deltaPct) < threshold) return "stable";
  return deltaPct > 0 ? "improving" : "declining";
}

function urgencyFromDaysRemaining(days: number): BriefingUrgency {
  if (days <= 2) return "critical";
  if (days <= 5) return "warning";
  return "info";
}

function confidenceFromSample(sampleWeeks: number): number {
  if (sampleWeeks >= 3) return 0.87;
  if (sampleWeeks >= 1.5) return 0.72;
  if (sampleWeeks >= 0.5) return 0.58;
  return 0.45;
}

export type CostingLineInput = {
  productId: string;
  itemTitle: string;
  grossMarginPercent: number;
  foodCostPercent: number;
  warningLevel: string;
  salePrice: number;
  suggestedPrice?: number | null;
};

export type StaffPosMetric = {
  staffId: string;
  staffName: string;
  orderCount: number;
  avgTicket: number;
  tipRate: number;
};

export type ProfitInput = {
  netRevenue: number;
  previousNetRevenue: number;
  revenueTrend: number | null;
  marginMedian: number | null;
  marginAtRiskItems: number;
  packingAccuracy: number | null;
  avgFoodCostPct: number | null;
  laborPercent: number | null;
  targetLaborPercent: number;
};

export function buildInventoryAlerts(
  rows: IngredientDemandRow[],
  windowDays: number,
): InventoryBriefingAlert[] {
  const byIngredient = new Map<
    string,
    { name: string; stock: number; required: number; shortage: number }
  >();

  for (const row of rows) {
    const cur = byIngredient.get(row.ingredientId) ?? {
      name: row.name,
      stock: row.stock,
      required: 0,
      shortage: 0,
    };
    cur.required += row.required;
    cur.shortage = Math.max(cur.shortage, row.shortage);
    cur.stock = Math.min(cur.stock, row.stock);
    byIngredient.set(row.ingredientId, cur);
  }

  const alerts: InventoryBriefingAlert[] = [];
  const days = Math.max(windowDays, 1);

  for (const entry of byIngredient.values()) {
    const dailyUsage = round2(entry.required / days);
    if (dailyUsage <= 0 && entry.shortage <= 0) continue;

    const daysRemaining =
      dailyUsage > 0 ? Math.floor(entry.stock / dailyUsage) : entry.stock > 0 ? 999 : 0;
    const recommendedOrder = Math.max(0, round2(entry.shortage > 0 ? entry.shortage : dailyUsage * 7 - entry.stock));
    const urgency = entry.shortage > 0 ? urgencyFromDaysRemaining(daysRemaining) : "info";

    if (urgency === "info" && recommendedOrder <= 0) continue;

    const conf = dailyUsage > 0 ? 0.82 : 0.55;
    alerts.push({
      item: entry.name,
      currentStock: round2(entry.stock),
      dailyUsage,
      daysRemaining,
      recommendedOrder,
      urgency,
      message:
        entry.shortage > 0
          ? `AI-assisted: ${entry.name} is short by ${round2(entry.shortage)} ${rows.find((r) => r.name === entry.name)?.unit ?? "units"}. ~${daysRemaining} day(s) of cover at current usage.`
          : `AI-assisted: ${entry.name} trending toward reorder — ~${daysRemaining} day(s) remaining.`,
      confidence: conf,
    });
  }

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function buildLaborInsights(
  plan: AiSchedulePlan | null,
  overtimePredictions: OvertimePrediction[],
  avgHourlyRate: number,
): LaborBriefingInsight[] {
  const insights: LaborBriefingInsight[] = [];
  if (!plan) return insights;

  const confMap = { high: 0.85, medium: 0.7, low: 0.55 } as const;
  const baseConf = confMap[plan.summary.confidence];

  for (const day of plan.days) {
    const scheduled = day.shifts.length;
    const recommended = day.recommendedHeadcount;
    if (recommended > scheduled && recommended - scheduled >= 1) {
      const gap = recommended - scheduled;
      insights.push({
        type: "understaffed",
        shift: `${day.dayLabel} (${day.dateIso})`,
        role: "Kitchen / FOH",
        impact: round2(gap * DEFAULT_SHIFT_HOURS * avgHourlyRate),
        message: `AI-assisted: ${day.dayLabel} needs ~${gap} more staff for ${day.predictedOrders} expected orders.`,
        confidence: baseConf,
      });
    } else if (scheduled > recommended + 1 && scheduled >= 2) {
      const extra = scheduled - recommended;
      insights.push({
        type: "overstaffed",
        shift: `${day.dayLabel} (${day.dateIso})`,
        role: "Scheduled crew",
        impact: round2(extra * DEFAULT_SHIFT_HOURS * avgHourlyRate),
        message: `AI-assisted: ${day.dayLabel} may be overstaffed by ~${extra} shift(s) vs predicted demand.`,
        confidence: baseConf * 0.9,
      });
    }
  }

  if (plan.summary.confidence === "low") {
    const today = plan.days.find((d) => d.predictedOrders > 0) ?? plan.days[0];
    if (today) {
      insights.push({
        type: "no_show_risk",
        shift: `${today.dayLabel} peak`,
        role: "All roles",
        impact: round2(today.predictedRevenue * 0.05),
        message:
          "AI-assisted: Limited order history — schedule absences could hurt throughput more than usual.",
        confidence: 0.52,
      });
    }
  }

  for (const ot of overtimePredictions.slice(0, 5)) {
    if (ot.overtimeHours <= 0 && ot.severity !== "critical") continue;
    insights.push({
      type: "overtime_risk",
      shift: "This week",
      role: ot.staffName,
      impact: round2(ot.overtimeHours * avgHourlyRate * 1.5),
      message: `AI-assisted: ${ot.staffName} projected at ${ot.projectedWeekHours}h this week (${ot.overtimeHours}h OT).`,
      confidence: 0.78,
    });
  }

  return insights.sort((a, b) => b.impact - a.impact);
}

const DEFAULT_SHIFT_HOURS = 8;

export function buildMenuInsights(
  lines: CostingLineInput[],
  previousMargins: Map<string, number>,
  targetMarginPercent: number,
): MenuBriefingInsight[] {
  const insights: MenuBriefingInsight[] = [];

  for (const line of lines) {
    const prev = previousMargins.get(line.productId);
    const compared =
      prev != null && prev !== 0
        ? round1(((line.grossMarginPercent - prev) / Math.abs(prev)) * 100)
        : 0;
    const trend = trendFromDelta(compared);

    let recommendation = "Margin within target — monitor ingredient costs.";
    if (line.grossMarginPercent < targetMarginPercent) {
      recommendation =
        line.suggestedPrice != null
          ? `Suggested price $${line.suggestedPrice.toFixed(2)} for target margin.`
          : `Consider raising price or reducing food cost — margin ${round1(line.grossMarginPercent)}% vs ${targetMarginPercent}% target.`;
    } else if (line.foodCostPercent > 35) {
      recommendation = "Food cost elevated — review portion sizes or supplier pricing.";
    }

    if (line.warningLevel === "CRITICAL" || line.grossMarginPercent < targetMarginPercent - 5) {
      insights.push({
        item: line.itemTitle,
        foodCost: round1(line.foodCostPercent),
        margin: round1(line.grossMarginPercent),
        trend,
        comparedToLastWeek: compared,
        recommendation: `AI-assisted suggestion: ${recommendation}`,
        confidence: prev != null ? 0.84 : 0.68,
      });
    }
  }

  return insights
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 12);
}

export function buildStaffInsights(
  posMetrics: StaffPosMetric[],
  packingAccuracy: number | null,
  workspaceOrderCount: number,
): StaffBriefingInsight[] {
  if (posMetrics.length === 0 && packingAccuracy == null) return [];

  const insights: StaffBriefingInsight[] = [];
  const avgOrders =
    posMetrics.length > 0
      ? posMetrics.reduce((s, m) => s + m.orderCount, 0) / posMetrics.length
      : 0;
  const avgTipRate =
    posMetrics.length > 0 ? posMetrics.reduce((s, m) => s + m.tipRate, 0) / posMetrics.length : 0;
  const packingBenchmark = packingAccuracy ?? 0.92;

  for (const m of posMetrics.slice(0, 8)) {
    const speedTrend = trendFromDelta(
      avgOrders > 0 ? ((m.orderCount - avgOrders) / avgOrders) * 100 : null,
      10,
    );
    insights.push({
      employee: m.staffName,
      metric: "speed",
      current: m.orderCount,
      benchmark: round1(avgOrders),
      trend: speedTrend,
      message: `AI-assisted: ${m.orderCount} POS orders in the window (team avg ${round1(avgOrders)}).`,
      confidence: workspaceOrderCount >= 20 ? 0.76 : 0.58,
    });

    if (m.tipRate > 0) {
      insights.push({
        employee: m.staffName,
        metric: "upsell_rate",
        current: round1(m.tipRate * 100),
        benchmark: round1(avgTipRate * 100),
        trend: trendFromDelta(
          avgTipRate > 0 ? ((m.tipRate - avgTipRate) / avgTipRate) * 100 : null,
          5,
        ),
        message: `AI-assisted: Tip rate ${(m.tipRate * 100).toFixed(1)}% vs team ${(avgTipRate * 100).toFixed(1)}%.`,
        confidence: 0.65,
      });
    }
  }

  if (packingAccuracy != null && posMetrics.length === 0) {
    insights.push({
      employee: "Kitchen team",
      metric: "accuracy",
      current: round1(packingAccuracy * 100),
      benchmark: round1(packingBenchmark * 100),
      trend: packingAccuracy >= packingBenchmark ? "improving" : "declining",
      message: `AI-assisted: Packing accuracy ${(packingAccuracy * 100).toFixed(1)}% in the current window.`,
      confidence: 0.8,
    });
  }

  return insights.slice(0, 10);
}

export function buildProfitInsights(input: ProfitInput): ProfitBriefingInsight[] {
  const insights: ProfitBriefingInsight[] = [];
  const rev = input.netRevenue;

  if (input.revenueTrend != null) {
    const delta = input.revenueTrend * 100;
    const impact = round2((input.netRevenue - input.previousNetRevenue));
    insights.push({
      factor: "Net revenue",
      impact,
      percentageOfRevenue: rev > 0 ? round1((impact / rev) * 100) : 0,
      trend: trendFromDelta(delta),
      recommendation:
        delta < -5
          ? "AI-assisted: Revenue down vs prior period — review channel mix and promos."
          : delta > 5
            ? "AI-assisted: Revenue up — ensure labor and prep scale with demand."
            : "AI-assisted: Revenue stable — focus on margin levers.",
      confidence: 0.83,
    });
  }

  if (input.marginMedian != null) {
    insights.push({
      factor: "Gross margin (median menu item)",
      impact: round2(input.marginAtRiskItems * 2.5),
      percentageOfRevenue: round1(input.marginMedian),
      trend: input.marginAtRiskItems > 3 ? "declining" : "stable",
      recommendation:
        input.marginAtRiskItems > 0
          ? `AI-assisted: ${input.marginAtRiskItems} item(s) below margin target — open Costing.`
          : "AI-assisted: Menu margins healthy — maintain recipe costing discipline.",
      confidence: 0.81,
    });
  }

  if (input.avgFoodCostPct != null) {
    insights.push({
      factor: "Food cost %",
      impact: round2(rev * (input.avgFoodCostPct / 100) * 0.02),
      percentageOfRevenue: round1(input.avgFoodCostPct),
      trend: input.avgFoodCostPct > 32 ? "declining" : "stable",
      recommendation:
        input.avgFoodCostPct > 32
          ? "AI-assisted: Food cost elevated — review purchasing and portion control."
          : "AI-assisted: Food cost within typical range.",
      confidence: 0.79,
    });
  }

  if (input.laborPercent != null) {
    const laborDelta = input.laborPercent - input.targetLaborPercent;
    insights.push({
      factor: "Labor cost %",
      impact: round2(rev * (Math.abs(laborDelta) / 100)),
      percentageOfRevenue: round1(input.laborPercent),
      trend: laborDelta > 3 ? "declining" : laborDelta < -3 ? "improving" : "stable",
      recommendation:
        laborDelta > 3
          ? "AI-assisted: Labor running above target — align schedules with forecast."
          : "AI-assisted: Labor percent near target.",
      confidence: 0.77,
    });
  }

  return insights.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}

export function buildWeeklyForecast(params: {
  schedulePlan: AiSchedulePlan | null;
  recentDailyRevenue: { date: string; value: number }[];
  recentOrderCount: number;
  recentDayCount: number;
}): WeeklyBriefingForecast {
  const plan = params.schedulePlan;
  const factors: WeeklyBriefingForecast["factors"] = [];
  const recommendations: string[] = [];

  let predictedRevenue = 0;
  let predictedOrders = 0;
  let sampleWeeks = 0;

  if (plan) {
    predictedRevenue = plan.summary.totalProjectedRevenue;
    predictedOrders = plan.days.reduce((s, d) => s + d.predictedOrders, 0);
    sampleWeeks = plan.summary.confidence === "high" ? 4 : plan.summary.confidence === "medium" ? 2 : 1;
    factors.push({
      name: "Day-of-week order history",
      impact: plan.summary.confidence === "high" ? "positive" : "neutral",
    });
    if (plan.summary.blendedLaborPct > plan.targetLaborPct + 3) {
      factors.push({ name: "Labor cost pressure", impact: "negative" });
      recommendations.push("Trim overstaffed shifts flagged in labor insights.");
    }
  } else if (params.recentDailyRevenue.length > 0) {
    const avg =
      params.recentDailyRevenue.reduce((s, d) => s + d.value, 0) / params.recentDailyRevenue.length;
    predictedRevenue = round2(avg * 7);
    predictedOrders = Math.round((params.recentOrderCount / Math.max(params.recentDayCount, 1)) * 7);
    sampleWeeks = params.recentDayCount >= 14 ? 2 : 1;
    factors.push({ name: "Recent daily revenue average", impact: "neutral" });
  }

  if (predictedRevenue <= 0 && params.recentDailyRevenue.length > 0) {
    const avg =
      params.recentDailyRevenue.reduce((s, d) => s + d.value, 0) / params.recentDailyRevenue.length;
    predictedRevenue = round2(avg * 7);
  }

  if (recommendations.length === 0) {
    recommendations.push("Review inventory alerts before the busiest day this week.");
    recommendations.push("Confirm labor schedule matches AI-assisted demand forecast.");
  }

  const confidence = confidenceFromSample(sampleWeeks);

  return {
    predictedRevenue,
    predictedOrders,
    confidence,
    factors:
      factors.length > 0
        ? factors
        : [{ name: "Limited historical data", impact: "neutral" as const }],
    recommendations,
  };
}

export function computeOverallConfidence(sections: {
  inventory: InventoryBriefingAlert[];
  labor: LaborBriefingInsight[];
  menu: MenuBriefingInsight[];
  staff: StaffBriefingInsight[];
  profit: ProfitBriefingInsight[];
  forecastConfidence: number;
}): number {
  const all = [
    ...sections.inventory.map((i) => i.confidence),
    ...sections.labor.map((i) => i.confidence),
    ...sections.menu.map((i) => i.confidence),
    ...sections.staff.map((i) => i.confidence),
    ...sections.profit.map((i) => i.confidence),
    sections.forecastConfidence,
  ].filter((c) => c > 0);

  if (all.length === 0) return 0.5;
  return round2(all.reduce((s, c) => s + c, 0) / all.length);
}
