/** AI Restaurant Brain — daily briefing payload types (deterministic, AI-assisted labeling). */

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
};
