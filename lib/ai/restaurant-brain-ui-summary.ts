import type { DailyBriefing } from "@/lib/ai/restaurant-brain-types";

export type AiBriefingSectionSummary = {
  id: string;
  title: string;
  headline: string;
  detailCount: number;
  confidence: number;
  tone: "critical" | "warning" | "neutral" | "positive";
  href: string;
};

function avgConfidence(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100);
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function countCriticalAiBriefingAlerts(briefing: DailyBriefing): number {
  let count = briefing.inventoryAlerts.filter((a) => a.urgency === "critical").length;
  count += briefing.laborInsights.filter(
    (l) => l.type === "understaffed" || (l.type === "overtime_risk" && l.impact >= 100),
  ).length;
  count += briefing.menuInsights.filter((m) => m.trend === "declining" && m.comparedToLastWeek <= -5).length;
  return count;
}

export function buildAiBriefingSectionSummaries(briefing: DailyBriefing): AiBriefingSectionSummary[] {
  const inventoryNeedingReorder = briefing.inventoryAlerts.filter(
    (a) => a.urgency === "critical" || a.urgency === "warning",
  ).length;
  const firstLabor = briefing.laborInsights[0];
  const firstMenu = briefing.menuInsights[0];
  const foodCostInsight = briefing.profitInsights.find((p) => p.factor.toLowerCase().includes("food cost"));
  const forecast = briefing.weeklyForecast;

  return [
    {
      id: "inventory",
      title: "Inventory",
      headline:
        inventoryNeedingReorder > 0
          ? `${inventoryNeedingReorder} item${inventoryNeedingReorder === 1 ? "" : "s"} need reordering`
          : "Stock levels look healthy",
      detailCount: briefing.inventoryAlerts.length,
      confidence: avgConfidence(briefing.inventoryAlerts.map((a) => a.confidence)),
      tone: inventoryNeedingReorder > 0 ? "warning" : "positive",
      href: "/dashboard/inventory/demand",
    },
    {
      id: "labor",
      title: "Labor",
      headline: firstLabor
        ? firstLabor.type === "understaffed"
          ? `Understaffed: ${firstLabor.shift}`
          : firstLabor.message.replace(/^AI-assisted:\s*/i, "")
        : "Schedule aligned with forecast",
      detailCount: briefing.laborInsights.length,
      confidence: avgConfidence(briefing.laborInsights.map((l) => l.confidence)),
      tone: firstLabor?.type === "understaffed" ? "critical" : firstLabor ? "warning" : "neutral",
      href: "/dashboard/staff/ai-scheduling",
    },
    {
      id: "menu",
      title: "Menu",
      headline: firstMenu
        ? `${firstMenu.item} margin ${firstMenu.comparedToLastWeek >= 0 ? "up" : "down"} ${Math.abs(firstMenu.comparedToLastWeek).toFixed(0)}%`
        : "Menu margins stable",
      detailCount: briefing.menuInsights.length,
      confidence: avgConfidence(briefing.menuInsights.map((m) => m.confidence)),
      tone: firstMenu?.trend === "declining" ? "warning" : "neutral",
      href: "/dashboard/costing",
    },
    {
      id: "profit",
      title: "Profit",
      headline: foodCostInsight
        ? `Food cost ${foodCostInsight.percentageOfRevenue.toFixed(1)}% of revenue`
        : briefing.profitInsights[0]?.factor ?? "Profit drivers stable",
      detailCount: briefing.profitInsights.length,
      confidence: avgConfidence(briefing.profitInsights.map((p) => p.confidence)),
      tone: foodCostInsight?.trend === "declining" ? "warning" : "neutral",
      href: "/dashboard/executive",
    },
    {
      id: "forecast",
      title: "Forecast",
      headline:
        forecast.predictedRevenue > 0
          ? `Expected ${fmtMoney(forecast.predictedRevenue)} this week, ${forecast.predictedOrders} orders`
          : "Forecast needs more order history",
      detailCount: forecast.recommendations.length,
      confidence: Math.round(forecast.confidence * 100),
      tone: forecast.confidence >= 0.75 ? "positive" : "neutral",
      href: "/dashboard/forecast",
    },
  ];
}
