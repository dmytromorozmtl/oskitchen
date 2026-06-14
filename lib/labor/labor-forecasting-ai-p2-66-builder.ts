import type { DowDemand } from "@/services/labor/ai-scheduling-service";
import {
  buildAiSchedulePlan,
  recommendHeadcount,
} from "@/services/labor/ai-scheduling-service";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type DeepLaborForecastDay = {
  dayOfWeek: number;
  dayLabel: string;
  predictedOrders: number;
  predictedRevenue: number;
  recommendedHeadcount: number;
  projectedLaborHours: number;
  projectedLaborCost: number;
  projectedLaborPct: number;
  peakShiftWindow: string;
};

export type DeepLaborForecast = {
  horizonDays: number;
  targetLaborPct: number;
  avgHourlyRate: number;
  days: DeepLaborForecastDay[];
  summary: {
    totalProjectedRevenue: number;
    totalProjectedLaborHours: number;
    totalProjectedLaborCost: number;
    blendedLaborPct: number;
    confidence: "low" | "medium" | "high";
    varianceFromTargetPct: number;
    notes: string[];
  };
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildDeepLaborForecast(params: {
  weekStart: Date;
  dowDemand: DowDemand[];
  targetLaborPct: number;
  avgHourlyRate: number;
  staffCount: number;
}): DeepLaborForecast {
  const { weekStart, dowDemand, targetLaborPct, avgHourlyRate, staffCount } = params;
  const demandByDow = new Map(dowDemand.map((d) => [d.dayOfWeek, d]));

  const staff =
    staffCount > 0
      ? Array.from({ length: staffCount }, (_, i) => ({
          id: `staff-${i + 1}`,
          name: `Staff ${i + 1}`,
          roleType: "LINE_COOK",
        }))
      : [];

  const schedulePlan = buildAiSchedulePlan({
    weekStart,
    targetLaborPct,
    avgHourlyRate,
    dowDemand,
    staff,
  });

  const days: DeepLaborForecastDay[] = schedulePlan.days.map((day) => {
    const dow = new Date(day.dateIso).getDay();
    const demand = demandByDow.get(dow);
    const headcount =
      staffCount > 0
        ? day.recommendedHeadcount
        : recommendHeadcount(day.predictedOrders, day.predictedRevenue, targetLaborPct, avgHourlyRate);

    const projectedLaborHours = round2(
      day.shifts.reduce((sum, shift) => sum + shift.estimatedHours, 0),
    );
    const peakShift = day.shifts[0];
    const peakShiftWindow = peakShift
      ? `${peakShift.startTime}–${peakShift.endTime}`
      : "—";

    return {
      dayOfWeek: dow,
      dayLabel: DAY_LABELS[dow] ?? day.dayLabel,
      predictedOrders: day.predictedOrders,
      predictedRevenue: day.predictedRevenue,
      recommendedHeadcount: headcount,
      projectedLaborHours,
      projectedLaborCost: day.projectedLaborCost,
      projectedLaborPct: day.projectedLaborPct,
      peakShiftWindow,
    };
  });

  const totalProjectedLaborHours = round2(
    days.reduce((sum, d) => sum + d.projectedLaborHours, 0),
  );
  const varianceFromTargetPct = round2(
    schedulePlan.summary.blendedLaborPct - targetLaborPct,
  );

  const notes = [
    ...schedulePlan.summary.notes,
    "Deep scheduling AI uses day-of-week order demand — not a generative LLM.",
    "Comparable to 7shifts labor forecasting workflows; review before publishing shifts.",
  ];

  return {
    horizonDays: 7,
    targetLaborPct,
    avgHourlyRate,
    days,
    summary: {
      totalProjectedRevenue: schedulePlan.summary.totalProjectedRevenue,
      totalProjectedLaborHours,
      totalProjectedLaborCost: schedulePlan.summary.totalProjectedLabor,
      blendedLaborPct: schedulePlan.summary.blendedLaborPct,
      confidence: schedulePlan.summary.confidence,
      varianceFromTargetPct,
      notes,
    },
  };
}

export function buildDeepLaborForecastFromAvgShiftHours(params: {
  recentShiftHoursAvg: number;
  horizonDays?: number;
  targetLaborPct?: number;
  avgHourlyRate?: number;
}): DeepLaborForecast {
  const horizonDays = params.horizonDays ?? 7;
  const targetLaborPct = params.targetLaborPct ?? 28;
  const avgHourlyRate = params.avgHourlyRate ?? 18;
  const dailyHours = params.recentShiftHoursAvg;

  const impliedRevenue =
    dailyHours > 0 && targetLaborPct > 0
      ? round2((dailyHours * avgHourlyRate) / (targetLaborPct / 100))
      : 0;
  const impliedOrders = Math.max(1, Math.round(impliedRevenue / 25));

  const dowDemand: DowDemand[] = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    avgRevenue: impliedRevenue,
    avgOrders: impliedOrders,
    sampleWeeks: 1,
  }));

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  return buildDeepLaborForecast({
    weekStart,
    dowDemand,
    targetLaborPct,
    avgHourlyRate,
    staffCount: Math.max(1, Math.ceil(impliedOrders / 18)),
  });
}
