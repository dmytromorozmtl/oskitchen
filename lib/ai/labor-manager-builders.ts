import {
  AI_LABOR_DEFAULT_SHIFT_HOURS,
  AI_LABOR_MANAGER_POLICY_ID,
  AI_LABOR_OT_PREMIUM_MULTIPLIER,
} from "@/lib/ai/labor-manager-policy";
import type {
  LaborManagerDailyBrief,
  LaborManagerSnapshot,
  LaborSignalSeverity,
  OvertimeAlert,
  StaffingOptimizationSignal,
} from "@/lib/ai/labor-manager-types";
import type { AiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import type { LaborRealtimeSnapshot, OvertimePrediction } from "@/services/labor/labor-realtime-service";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function staffingSeverity(gap: number, type: StaffingOptimizationSignal["type"]): LaborSignalSeverity {
  if (type === "on_target") return "low";
  const magnitude = Math.abs(gap);
  if (magnitude >= 3) return "critical";
  if (magnitude >= 2) return "high";
  if (magnitude >= 1) return "normal";
  return "low";
}

function overtimeSeverity(prediction: OvertimePrediction): LaborSignalSeverity {
  if (prediction.severity === "critical" || prediction.overtimeHours >= 4) return "critical";
  if (prediction.overtimeHours > 0) return "high";
  return "normal";
}

export function buildStaffingOptimizationSignals(
  plan: AiSchedulePlan | null,
  avgHourlyRate: number,
): StaffingOptimizationSignal[] {
  if (!plan) return [];

  return plan.days
    .map((day) => {
      const scheduled = day.shifts.length;
      const recommended = day.recommendedHeadcount;
      const gap = recommended - scheduled;
      let type: StaffingOptimizationSignal["type"] = "on_target";
      if (gap >= 1) type = "understaffed";
      else if (scheduled > recommended + 1 && scheduled >= 2) type = "overstaffed";

      const magnitude = type === "understaffed" ? gap : type === "overstaffed" ? scheduled - recommended : 0;
      const severity = staffingSeverity(magnitude, type);
      const estimatedImpact = round2(magnitude * AI_LABOR_DEFAULT_SHIFT_HOURS * avgHourlyRate);

      let recommendation = "Staffing aligns with predicted demand.";
      if (type === "understaffed") {
        recommendation =
          severity === "critical" || severity === "high"
            ? `Add ${magnitude} shift(s) or extend hours — ${day.predictedOrders} orders expected.`
            : `Consider one extra shift for ${day.dayLabel} peak throughput.`;
      } else if (type === "overstaffed") {
        recommendation =
          severity === "critical" || severity === "high"
            ? `Trim ${magnitude} shift(s) to protect labor % on lower-demand day.`
            : `Review optional shifts — demand may not justify full crew.`;
      }

      return {
        dateIso: day.dateIso,
        dayLabel: day.dayLabel,
        type,
        scheduledHeadcount: scheduled,
        recommendedHeadcount: recommended,
        gap: type === "overstaffed" ? -(scheduled - recommended) : gap,
        predictedOrders: day.predictedOrders,
        estimatedImpact,
        severity,
        recommendation,
      };
    })
    .filter((row) => row.type !== "on_target" || row.predictedOrders > 0)
    .sort((left, right) => Math.abs(right.gap) - Math.abs(left.gap));
}

export function buildOvertimeAlerts(
  predictions: OvertimePrediction[],
  hourlyRate: number,
): OvertimeAlert[] {
  return predictions
    .filter((row) => row.overtimeHours > 0 || row.severity === "critical")
    .map((row) => {
      const severity = overtimeSeverity(row);
      const estimatedOvertimeCost = round2(row.overtimeHours * hourlyRate * AI_LABOR_OT_PREMIUM_MULTIPLIER);
      return {
        staffMemberId: row.staffMemberId,
        staffName: row.staffName,
        weekScheduledHours: row.weekScheduledHours,
        todayClockedHours: row.todayClockedHours,
        projectedWeekHours: row.projectedWeekHours,
        overtimeHours: row.overtimeHours,
        estimatedOvertimeCost,
        severity,
        recommendation:
          severity === "critical"
            ? `Reassign or shorten shifts — ${row.staffName} projected ${row.projectedWeekHours}h this week.`
            : row.overtimeHours > 0
              ? `Swap or split shifts to avoid ~${row.overtimeHours}h overtime for ${row.staffName}.`
              : `Monitor clock-outs — ${row.staffName} approaching weekly threshold.`,
      };
    })
    .sort((left, right) => right.projectedWeekHours - left.projectedWeekHours);
}

export function buildLaborManagerDailyBrief(input: {
  realtime: LaborRealtimeSnapshot;
  staffingSignals: StaffingOptimizationSignal[];
  overtimeAlerts: OvertimeAlert[];
  analyzedAt: Date;
}): LaborManagerDailyBrief {
  const understaffedDays = input.staffingSignals.filter((row) => row.type === "understaffed").length;
  const criticalCount =
    input.staffingSignals.filter((row) => row.severity === "critical").length +
    input.overtimeAlerts.filter((row) => row.severity === "critical").length;

  const headline =
    criticalCount > 0
      ? `${criticalCount} critical labor signal${criticalCount === 1 ? "" : "s"} — ${input.realtime.laborPercent.toFixed(1)}% labor today`
      : understaffedDays > 0 || input.overtimeAlerts.length > 0
        ? `Labor watch — ${understaffedDays} understaffed day${understaffedDays === 1 ? "" : "s"}, ${input.overtimeAlerts.length} OT alert${input.overtimeAlerts.length === 1 ? "" : "s"}`
        : `Labor on track — ${input.realtime.laborPercent.toFixed(1)}% vs ${input.realtime.targetLaborPercent}% target`;

  const executiveSummary =
    input.realtime.status === "OVER"
      ? `Today's labor is ${input.realtime.laborPercent.toFixed(1)}% of revenue — above the ${input.realtime.targetLaborPercent}% target. Review staffing and overtime before close.`
      : input.realtime.status === "UNDER"
        ? `Labor at ${input.realtime.laborPercent.toFixed(1)}% — below target; verify coverage for peak periods.`
        : `Labor ${input.realtime.laborPercent.toFixed(1)}% tracks the ${input.realtime.targetLaborPercent}% goal with ${input.realtime.activeStaff} staff active.`;

  const bullets = [
    input.realtime.activeStaff > 0
      ? `Active now: ${input.realtime.activeStaff} (${input.realtime.activeStaffNames.slice(0, 3).join(", ")}${input.realtime.activeStaffNames.length > 3 ? "…" : ""})`
      : null,
    understaffedDays > 0 ? `Understaffed: ${understaffedDays} day(s) in the AI schedule plan` : null,
    input.overtimeAlerts.length > 0
      ? `Overtime: ${input.overtimeAlerts.length} staff projected at or above threshold`
      : null,
    input.staffingSignals.find((row) => row.type === "understaffed")
      ? `Top gap: ${input.staffingSignals.find((row) => row.type === "understaffed")!.dayLabel} needs +${Math.abs(input.staffingSignals.find((row) => row.type === "understaffed")!.gap)} staff`
      : null,
    input.overtimeAlerts[0]
      ? `Top OT risk: ${input.overtimeAlerts[0].staffName} (${input.overtimeAlerts[0].projectedWeekHours}h projected)`
      : null,
  ].filter((line): line is string => line != null);

  return {
    generatedAtIso: input.analyzedAt.toISOString(),
    headline,
    executiveSummary,
    bullets,
    laborPercentToday: input.realtime.laborPercent,
    targetLaborPercent: input.realtime.targetLaborPercent,
    overtimeAlertCount: input.overtimeAlerts.length,
    staffingGapDays: understaffedDays,
  };
}

export function buildLaborManagerSnapshot(input: {
  workspaceId: string;
  weekStartIso: string;
  realtime: LaborRealtimeSnapshot;
  plan: AiSchedulePlan | null;
  analyzedAt?: Date;
}): LaborManagerSnapshot {
  const analyzedAt = input.analyzedAt ?? new Date();
  const hourlyRate = input.realtime.hourlyRate;
  const staffingSignals = buildStaffingOptimizationSignals(input.plan, hourlyRate);
  const overtimeAlerts = buildOvertimeAlerts(input.realtime.overtimePredictions, hourlyRate);
  const understaffedDays = staffingSignals.filter((row) => row.type === "understaffed").length;
  const overstaffedDays = staffingSignals.filter((row) => row.type === "overstaffed").length;
  const projectedOvertimeCost = round2(
    overtimeAlerts.reduce((sum, row) => sum + row.estimatedOvertimeCost, 0),
  );
  const alertCount =
    staffingSignals.filter((row) => row.severity !== "low").length + overtimeAlerts.length;

  const confMap = { high: 0.85, medium: 0.72, low: 0.55 } as const;
  const planConf = input.plan ? confMap[input.plan.summary.confidence] : 0.5;
  const confidence = round2(Math.min(0.92, planConf + (input.realtime.totalRevenue > 0 ? 0.05 : 0)));

  const dailyBrief = buildLaborManagerDailyBrief({
    realtime: input.realtime,
    staffingSignals,
    overtimeAlerts,
    analyzedAt,
  });

  return {
    policyId: AI_LABOR_MANAGER_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: analyzedAt.toISOString(),
    weekStartIso: input.weekStartIso,
    staffingSignals,
    overtimeAlerts,
    dailyBrief,
    summary: {
      activeStaff: input.realtime.activeStaff,
      laborPercent: input.realtime.laborPercent,
      laborStatus: input.realtime.status,
      projectedOvertimeCost,
      understaffedDays,
      overstaffedDays,
      alertCount,
      confidence,
    },
    aiAssisted: true,
  };
}
