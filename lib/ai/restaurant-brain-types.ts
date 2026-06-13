/** AI Restaurant Brain — daily briefing payload types (deterministic, AI-assisted labeling). */

import type { AnalyticsChannel } from "@/lib/analytics/channel-attribution";

export type BriefingUrgency = "critical" | "warning" | "info";

export type BriefingTrend = "improving" | "declining" | "stable";

export type InventoryBriefingAlert = {
  item: string;
  currentStock: number;
  dailyUsage: number;
  daysRemaining: number;
  recommendedOrder: number;
  urgency: BriefingUrgency;
  message: string;
  confidence: number;
};

export type LaborBriefingInsight = {
  type: "understaffed" | "overstaffed" | "no_show_risk" | "overtime_risk";
  shift: string;
  role: string;
  impact: number;
  message: string;
  confidence: number;
};

export type MenuBriefingInsight = {
  item: string;
  foodCost: number;
  margin: number;
  trend: BriefingTrend;
  comparedToLastWeek: number;
  recommendation: string;
  confidence: number;
};

export type StaffBriefingInsight = {
  employee: string;
  metric: "speed" | "accuracy" | "upsell_rate" | "customer_rating";
  current: number;
  benchmark: number;
  trend: BriefingTrend;
  message: string;
  confidence: number;
};

export type ProfitBriefingInsight = {
  factor: string;
  impact: number;
  percentageOfRevenue: number;
  trend: BriefingTrend;
  recommendation: string;
  confidence: number;
};

export type WeeklyBriefingForecast = {
  predictedRevenue: number;
  predictedOrders: number;
  confidence: number;
  factors: { name: string; impact: "positive" | "negative" | "neutral" }[];
  recommendations: string[];
};

/** Per-channel today forecast — Toast IQ parity (P2-38). */
export type ChannelTodayForecast = {
  channel: AnalyticsChannel;
  label: string;
  predictedOrders: number;
  predictedRevenue: number;
  actualOrdersSoFar: number;
  actualRevenueSoFar: number;
  /** Percent change vs same weekday last week (orders). */
  trendVsLastWeek: number | null;
  confidence: number;
  message: string;
};

export type DailyBriefing = {
  timestamp: string;
  workspaceId: string;
  /** Always true — insights are AI-assisted suggestions from operational data. */
  aiAssisted: true;
  overallConfidence: number;
  inventoryAlerts: InventoryBriefingAlert[];
  laborInsights: LaborBriefingInsight[];
  menuInsights: MenuBriefingInsight[];
  staffInsights: StaffBriefingInsight[];
  profitInsights: ProfitBriefingInsight[];
  weeklyForecast: WeeklyBriefingForecast;
  /** All-channel today forecasts — deterministic, AI-assisted (P2-38). */
  channelForecasts: ChannelTodayForecast[];
};
