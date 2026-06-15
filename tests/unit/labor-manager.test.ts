import { describe, expect, it } from "vitest";

import {
  buildLaborManagerSnapshot,
  buildOvertimeAlerts,
  buildStaffingOptimizationSignals,
} from "@/lib/ai/labor-manager-builders";
import {
  AI_LABOR_MANAGER_POLICY_ID,
  AI_LABOR_MANAGER_ROUTE,
  AI_LABOR_MANAGER_SERVICE,
} from "@/lib/ai/labor-manager-policy";
import type { AiSchedulePlan } from "@/services/labor/ai-scheduling-service";
import type { LaborRealtimeSnapshot } from "@/services/labor/labor-realtime-service";

describe("AI labor manager", () => {
  it("locks policy constants", () => {
    expect(AI_LABOR_MANAGER_POLICY_ID).toBe("ai-labor-manager-v1");
    expect(AI_LABOR_MANAGER_SERVICE).toBe("services/ai/labor-manager.ts");
    expect(AI_LABOR_MANAGER_ROUTE).toBe("/dashboard/staff/labor-manager");
  });

  const basePlan: AiSchedulePlan = {
    weekStartIso: "2026-06-02",
    targetLaborPct: 28,
    avgHourlyRate: 18,
    days: [
      {
        dateIso: "2026-06-02",
        dayLabel: "Mon",
        predictedRevenue: 4200,
        predictedOrders: 180,
        recommendedHeadcount: 4,
        projectedLaborCost: 576,
        projectedLaborPct: 13.7,
        shifts: [
          {
            staffMemberId: "s1",
            staffName: "Alex",
            shiftDateIso: "2026-06-02",
            startTime: "09:00",
            endTime: "17:00",
            roleLabel: "Line cook",
            estimatedHours: 8,
            estimatedLaborCost: 144,
          },
          {
            staffMemberId: "s2",
            staffName: "Blake",
            shiftDateIso: "2026-06-02",
            startTime: "09:00",
            endTime: "17:00",
            roleLabel: "Cashier",
            estimatedHours: 8,
            estimatedLaborCost: 144,
          },
        ],
      },
      {
        dateIso: "2026-06-03",
        dayLabel: "Tue",
        predictedRevenue: 5000,
        predictedOrders: 220,
        recommendedHeadcount: 1,
        projectedLaborCost: 288,
        projectedLaborPct: 5.8,
        shifts: [
          {
            staffMemberId: "s1",
            staffName: "Alex",
            shiftDateIso: "2026-06-03",
            startTime: "09:00",
            endTime: "17:00",
            roleLabel: "Line cook",
            estimatedHours: 8,
            estimatedLaborCost: 144,
          },
          {
            staffMemberId: "s2",
            staffName: "Blake",
            shiftDateIso: "2026-06-03",
            startTime: "09:00",
            endTime: "17:00",
            roleLabel: "Cashier",
            estimatedHours: 8,
            estimatedLaborCost: 144,
          },
          {
            staffMemberId: "s3",
            staffName: "Casey",
            shiftDateIso: "2026-06-03",
            startTime: "10:00",
            endTime: "18:00",
            roleLabel: "Driver",
            estimatedHours: 8,
            estimatedLaborCost: 144,
          },
        ],
      },
    ],
    summary: {
      totalProjectedRevenue: 9200,
      totalProjectedLabor: 864,
      blendedLaborPct: 9.4,
      totalShifts: 5,
      confidence: "high",
      notes: [],
    },
  };

  const baseRealtime: LaborRealtimeSnapshot = {
    activeStaff: 3,
    activeStaffNames: ["Alex", "Blake", "Casey"],
    totalLaborHours: 18,
    laborCost: 324,
    totalRevenue: 1800,
    laborPercent: 18,
    scheduledLaborCost: 432,
    scheduledLaborPercent: 24,
    targetLaborPercent: 30,
    hourlyRate: 18,
    status: "UNDER",
    overtimePredictions: [
      {
        staffMemberId: "s1",
        staffName: "Alex",
        weekScheduledHours: 32,
        todayClockedHours: 10,
        projectedWeekHours: 42,
        overtimeHours: 2,
        severity: "critical",
      },
    ],
    updatedAtIso: "2026-06-05T14:00:00.000Z",
  };

  it("builds understaffed and overstaffed signals", () => {
    const signals = buildStaffingOptimizationSignals(basePlan, 18);
    const monday = signals.find((row) => row.dateIso === "2026-06-02");
    const tuesday = signals.find((row) => row.dateIso === "2026-06-03");
    expect(monday?.type).toBe("understaffed");
    expect(monday?.gap).toBe(2);
    expect(tuesday?.type).toBe("overstaffed");
  });

  it("builds overtime alerts with premium cost", () => {
    const alerts = buildOvertimeAlerts(baseRealtime.overtimePredictions, 18);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.severity).toBe("critical");
    expect(alerts[0]?.estimatedOvertimeCost).toBe(54);
  });

  it("assembles snapshot with daily brief", () => {
    const snapshot = buildLaborManagerSnapshot({
      workspaceId: "ws-1",
      weekStartIso: basePlan.weekStartIso,
      realtime: baseRealtime,
      plan: basePlan,
    });
    expect(snapshot.policyId).toBe(AI_LABOR_MANAGER_POLICY_ID);
    expect(snapshot.dailyBrief.overtimeAlertCount).toBe(1);
    expect(snapshot.summary.understaffedDays).toBeGreaterThan(0);
    expect(snapshot.aiAssisted).toBe(true);
  });
});
