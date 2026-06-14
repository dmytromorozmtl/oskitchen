import type { LaborForecastingCapability } from "@/lib/labor/labor-forecasting-ai-p2-66-policy";

export type LaborForecastingScenarioP266 = {
  id: string;
  label: string;
  capabilities: LaborForecastingCapability[];
  targetLaborPct: number;
  avgHourlyRate: number;
  staffCount: number;
  weekendBoost?: boolean;
};

export function buildLaborForecastingCorpusP266(): LaborForecastingScenarioP266[] {
  return [
    {
      id: "lf-01-weekday-lunch",
      label: "Weekday lunch rush — moderate demand",
      capabilities: ["demand_by_dow", "headcount_recommendation"],
      targetLaborPct: 28,
      avgHourlyRate: 18,
      staffCount: 4,
    },
    {
      id: "lf-02-friday-dinner",
      label: "Friday dinner peak — high headcount",
      capabilities: ["demand_by_dow", "headcount_recommendation", "shift_window_suggestion"],
      targetLaborPct: 30,
      avgHourlyRate: 20,
      staffCount: 8,
      weekendBoost: true,
    },
    {
      id: "lf-03-sunday-brunch",
      label: "Sunday brunch — weekend demand curve",
      capabilities: ["demand_by_dow", "labor_cost_projection"],
      targetLaborPct: 32,
      avgHourlyRate: 19,
      staffCount: 6,
      weekendBoost: true,
    },
    {
      id: "lf-04-tight-labor-target",
      label: "Aggressive 22% labor target",
      capabilities: ["labor_pct_target", "headcount_recommendation"],
      targetLaborPct: 22,
      avgHourlyRate: 17,
      staffCount: 5,
    },
    {
      id: "lf-05-high-wage-market",
      label: "High-wage market — $24/hr average",
      capabilities: ["labor_cost_projection", "labor_pct_target"],
      targetLaborPct: 28,
      avgHourlyRate: 24,
      staffCount: 5,
    },
    {
      id: "lf-06-slow-tuesday",
      label: "Slow Tuesday — minimal staffing",
      capabilities: ["demand_by_dow", "confidence_scoring"],
      targetLaborPct: 26,
      avgHourlyRate: 18,
      staffCount: 2,
    },
    {
      id: "lf-07-meal-prep-batch",
      label: "Meal prep batch day — packers + line",
      capabilities: ["headcount_recommendation", "shift_window_suggestion"],
      targetLaborPct: 25,
      avgHourlyRate: 18,
      staffCount: 6,
    },
    {
      id: "lf-08-catering-event",
      label: "Catering event week — labor spike",
      capabilities: ["labor_cost_projection", "demand_by_dow"],
      targetLaborPct: 35,
      avgHourlyRate: 21,
      staffCount: 10,
    },
    {
      id: "lf-09-new-location",
      label: "New location — low confidence history",
      capabilities: ["confidence_scoring", "demand_by_dow"],
      targetLaborPct: 30,
      avgHourlyRate: 18,
      staffCount: 3,
    },
    {
      id: "lf-10-apply-schedule",
      label: "Generate and apply draft schedule",
      capabilities: ["apply_to_schedule", "shift_window_suggestion"],
      targetLaborPct: 28,
      avgHourlyRate: 19,
      staffCount: 5,
    },
    {
      id: "lf-11-split-shifts",
      label: "Split lunch/dinner shifts on busy day",
      capabilities: ["shift_window_suggestion", "headcount_recommendation"],
      targetLaborPct: 29,
      avgHourlyRate: 20,
      staffCount: 7,
      weekendBoost: true,
    },
    {
      id: "lf-12-full-week-forecast",
      label: "Full week labor forecast with variance",
      capabilities: [
        "demand_by_dow",
        "headcount_recommendation",
        "labor_cost_projection",
        "shift_window_suggestion",
        "labor_pct_target",
        "confidence_scoring",
      ],
      targetLaborPct: 28,
      avgHourlyRate: 18,
      staffCount: 6,
    },
  ];
}
