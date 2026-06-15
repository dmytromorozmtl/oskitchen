import type { AI_LABOR_MANAGER_POLICY_ID } from "@/lib/ai/labor-manager-policy";

export type LaborSignalSeverity = "critical" | "high" | "normal" | "low";

export type StaffingOptimizationSignal = {
  dateIso: string;
  dayLabel: string;
  type: "understaffed" | "overstaffed" | "on_target";
  scheduledHeadcount: number;
  recommendedHeadcount: number;
  gap: number;
  predictedOrders: number;
  estimatedImpact: number;
  severity: LaborSignalSeverity;
  recommendation: string;
};

export type OvertimeAlert = {
  staffMemberId: string;
  staffName: string;
  weekScheduledHours: number;
  todayClockedHours: number;
  projectedWeekHours: number;
  overtimeHours: number;
  estimatedOvertimeCost: number;
  severity: LaborSignalSeverity;
  recommendation: string;
};

export type LaborManagerDailyBrief = {
  generatedAtIso: string;
  headline: string;
  executiveSummary: string;
  bullets: string[];
  laborPercentToday: number;
  targetLaborPercent: number;
  overtimeAlertCount: number;
  staffingGapDays: number;
};

export type LaborManagerSnapshot = {
  policyId: typeof AI_LABOR_MANAGER_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  weekStartIso: string;
  staffingSignals: StaffingOptimizationSignal[];
  overtimeAlerts: OvertimeAlert[];
  dailyBrief: LaborManagerDailyBrief;
  summary: {
    activeStaff: number;
    laborPercent: number;
    laborStatus: "OVER" | "ON_TRACK" | "UNDER";
    projectedOvertimeCost: number;
    understaffedDays: number;
    overstaffedDays: number;
    alertCount: number;
    confidence: number;
  };
  aiAssisted: true;
};
