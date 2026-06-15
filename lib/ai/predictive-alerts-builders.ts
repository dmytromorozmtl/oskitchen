import { addDays, addHours } from "date-fns";

import type { IngredientDemandRow } from "@/lib/ingredient-demand/types";
import type {
  PredictiveAlert,
  PredictiveAlertSeverity,
  PredictiveAlertType,
} from "@/lib/ai/predictive-alerts-types";
import type { AiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import type { CostingLineInput } from "@/lib/ai/restaurant-brain-builders";

const DEFAULT_LEAD_TIME_DAYS = 3;
const DEFAULT_UNIT_COST = 5;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function slugId(type: PredictiveAlertType, key: string): string {
  return `${type}-${key.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48)}`;
}

function expiresAtFor(severity: PredictiveAlertSeverity, now = new Date()): Date {
  if (severity === "critical") return addHours(now, 24);
  if (severity === "warning") return addDays(now, 3);
  return addDays(now, 7);
}

function severityFromDaysRemaining(days: number, leadTime: number): PredictiveAlertSeverity {
  if (days <= 1) return "critical";
  if (days <= leadTime) return "warning";
  return "info";
}

export function predictInventoryShortages(
  rows: IngredientDemandRow[],
  windowDays: number,
  options?: { leadTimeDays?: number; now?: Date },
): PredictiveAlert[] {
  const leadTime = options?.leadTimeDays ?? DEFAULT_LEAD_TIME_DAYS;
  const now = options?.now ?? new Date();
  const days = Math.max(windowDays, 1);
  const byIngredient = new Map<
    string,
    { name: string; stock: number; required: number; shortage: number; unitCost: number }
  >();

  for (const row of rows) {
    const cur = byIngredient.get(row.ingredientId) ?? {
      name: row.name,
      stock: row.stock,
      required: 0,
      shortage: 0,
      unitCost: row.estimatedCost != null && row.required > 0 ? row.estimatedCost / row.required : DEFAULT_UNIT_COST,
    };
    cur.required += row.required;
    cur.shortage = Math.max(cur.shortage, row.shortage);
    cur.stock = Math.min(cur.stock, row.stock);
    byIngredient.set(row.ingredientId, cur);
  }

  const alerts: PredictiveAlert[] = [];

  for (const [ingredientId, entry] of byIngredient) {
    const dailyUsage = entry.required / days;
    if (dailyUsage <= 0 && entry.shortage <= 0) continue;

    const daysRemaining =
      dailyUsage > 0 ? Math.floor(entry.stock / dailyUsage) : entry.stock > 0 ? 999 : 0;

    if (daysRemaining > leadTime + 2 && entry.shortage <= 0) continue;

    const severity = severityFromDaysRemaining(daysRemaining, leadTime);
    const stockoutBeforeDelivery = daysRemaining <= leadTime;
    const impact = round2(
      entry.shortage > 0
        ? entry.shortage * entry.unitCost
        : dailyUsage * entry.unitCost * Math.max(1, leadTime - daysRemaining),
    );
    const confidence = dailyUsage > 0 ? (stockoutBeforeDelivery ? 0.88 : 0.74) : 0.55;

    alerts.push({
      id: slugId("inventory_shortage", ingredientId),
      type: "inventory_shortage",
      severity,
      title: stockoutBeforeDelivery
        ? `Predicted stockout: ${entry.name}`
        : `Reorder window closing: ${entry.name}`,
      description: `AI-assisted: ${entry.name} has ~${daysRemaining} day(s) of cover at ${round2(dailyUsage)}/day usage. Lead time ~${leadTime} day(s).`,
      impact,
      confidence,
      suggestedAction: stockoutBeforeDelivery
        ? `Place a purchase order for ${entry.name} today — include safety stock for ${leadTime} day lead time.`
        : `Review par levels and schedule a PO before ${entry.name} hits reorder point.`,
      expiresAt: expiresAtFor(severity, now),
    });
  }

  return alerts;
}

export function predictLaborGaps(
  plan: AiSchedulePlan | null,
  avgHourlyRate: number,
  options?: { now?: Date },
): PredictiveAlert[] {
  if (!plan) return [];
  const now = options?.now ?? new Date();
  const confMap = { high: 0.86, medium: 0.72, low: 0.58 } as const;
  const baseConf = confMap[plan.summary.confidence];
  const alerts: PredictiveAlert[] = [];

  for (const day of plan.days) {
    const gap = day.recommendedHeadcount - day.shifts.length;
    if (gap < 1) continue;

    const severity: PredictiveAlertSeverity =
      gap >= 3 || day.predictedOrders >= 60 ? "critical" : gap >= 2 ? "warning" : "info";
    const impact = round2(gap * 8 * avgHourlyRate + day.predictedRevenue * 0.04);

    alerts.push({
      id: slugId("labor_gap", `${day.dateIso}-${gap}`),
      type: "labor_gap",
      severity,
      title: `Labor gap: ${day.dayLabel}`,
      description: `AI-assisted: ${day.dayLabel} expects ${day.predictedOrders} orders but only ${day.shifts.length}/${day.recommendedHeadcount} shifts scheduled.`,
      impact,
      confidence: baseConf,
      suggestedAction: `Add ${gap} shift(s) on ${day.dayLabel} or cross-train staff for peak coverage.`,
      expiresAt: expiresAtFor(severity, now),
    });
  }

  if (plan.summary.confidence === "low" && plan.days.some((d) => d.predictedOrders > 20)) {
    alerts.push({
      id: slugId("labor_gap", "no-show-risk"),
      type: "labor_gap",
      severity: "warning",
      title: "No-show risk elevated",
      description:
        "AI-assisted: Thin order history increases schedule uncertainty — absences may leave stations uncovered.",
      impact: round2(plan.summary.totalProjectedRevenue * 0.03),
      confidence: 0.62,
      suggestedAction: "Keep a floater on call for the busiest shift this week.",
      expiresAt: expiresAtFor("warning", now),
    });
  }

  return alerts;
}

export function predictMarginDeclines(
  lines: CostingLineInput[],
  previousMargins: Map<string, number>,
  targetMarginPercent: number,
  options?: { now?: Date },
): PredictiveAlert[] {
  const now = options?.now ?? new Date();
  const alerts: PredictiveAlert[] = [];

  for (const line of lines) {
    const prev = previousMargins.get(line.productId);
    const marginDelta =
      prev != null ? line.grossMarginPercent - prev : 0;
    const declining = marginDelta <= -3 || line.grossMarginPercent < targetMarginPercent - 5;
    const foodCostSpike = line.foodCostPercent > 35 && prev != null && marginDelta <= -2;

    if (!declining && !foodCostSpike) continue;

    const severity: PredictiveAlertSeverity =
      line.grossMarginPercent < targetMarginPercent - 10 || line.warningLevel === "CRITICAL"
        ? "critical"
        : marginDelta <= -8
          ? "warning"
          : "info";

    const impact = round2(Math.max(0, targetMarginPercent - line.grossMarginPercent) * line.salePrice * 0.15);
    const confidence = prev != null ? 0.83 : 0.67;

    alerts.push({
      id: slugId("margin_decline", line.productId),
      type: "margin_decline",
      severity,
      title: `Margin decline: ${line.itemTitle}`,
      description:
        prev != null
          ? `AI-assisted: ${line.itemTitle} margin ${line.grossMarginPercent.toFixed(1)}% (${marginDelta >= 0 ? "+" : ""}${marginDelta.toFixed(1)} pts vs last costing run). Food cost ${line.foodCostPercent.toFixed(1)}%.`
          : `AI-assisted: ${line.itemTitle} margin ${line.grossMarginPercent.toFixed(1)}% is below ${targetMarginPercent}% target.`,
      impact,
      confidence,
      suggestedAction:
        line.suggestedPrice != null
          ? `Review recipe costs or adjust price toward $${line.suggestedPrice.toFixed(2)}.`
          : "Audit ingredient costs and portion sizes; consider a menu price adjustment.",
      expiresAt: expiresAtFor(severity, now),
    });
  }

  return alerts;
}

export function predictDemandSurges(
  plan: AiSchedulePlan | null,
  orderTrend: number | null,
  netRevenue: number,
  options?: { now?: Date },
): PredictiveAlert[] {
  const now = options?.now ?? new Date();
  const alerts: PredictiveAlert[] = [];

  if (plan && plan.days.length > 0) {
    const avgOrders = plan.days.reduce((s, d) => s + d.predictedOrders, 0) / plan.days.length;
    for (const day of plan.days) {
      if (avgOrders <= 0) continue;
      const surgeRatio = day.predictedOrders / avgOrders;
      if (surgeRatio < 1.35) continue;

      const severity: PredictiveAlertSeverity = surgeRatio >= 1.6 ? "critical" : "warning";
      const extraOrders = Math.round(day.predictedOrders - avgOrders);
      const aov = day.predictedRevenue / Math.max(day.predictedOrders, 1);
      const impact = round2(extraOrders * aov * 0.25);

      alerts.push({
        id: slugId("demand_surge", day.dateIso),
        type: "demand_surge",
        severity,
        title: `Demand surge: ${day.dayLabel}`,
        description: `AI-assisted: ${day.dayLabel} projected at ${day.predictedOrders} orders (+${Math.round((surgeRatio - 1) * 100)}% vs weekly average).`,
        impact,
        confidence: plan.summary.confidence === "high" ? 0.85 : plan.summary.confidence === "medium" ? 0.72 : 0.58,
        suggestedAction: `Pre-prep high-volume items and align labor for ${day.dayLabel} peak.`,
        expiresAt: expiresAtFor(severity, now),
      });
    }
  }

  if (orderTrend != null && orderTrend >= 0.12 && netRevenue > 0) {
    alerts.push({
      id: slugId("demand_surge", "revenue-trend"),
      type: "demand_surge",
      severity: orderTrend >= 0.2 ? "warning" : "info",
      title: "Revenue trend accelerating",
      description: `AI-assisted: Order volume up ${(orderTrend * 100).toFixed(0)}% vs the prior period — demand may exceed baseline prep.`,
      impact: round2(netRevenue * orderTrend * 0.1),
      confidence: 0.78,
      suggestedAction: "Increase prep pars and confirm inventory for top sellers this week.",
      expiresAt: expiresAtFor(orderTrend >= 0.2 ? "warning" : "info", now),
    });
  }

  return alerts;
}

export function mergePredictiveAlerts(alerts: PredictiveAlert[]): PredictiveAlert[] {
  const byId = new Map<string, PredictiveAlert>();
  for (const alert of alerts) {
    byId.set(alert.id, alert);
  }
  return [...byId.values()].sort((a, b) => b.impact - a.impact);
}
