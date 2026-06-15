import { describe, expect, it } from "vitest";

import {
  buildLaborRealtimeSnapshot,
  buildOvertimePredictions,
  entryHours,
  shiftHours,
} from "@/services/labor/labor-realtime-service";

describe("labor realtime service", () => {
  const now = new Date("2026-05-07T18:00:00.000Z");

  it("computes shift and entry hours", () => {
    expect(shiftHours("09:00", "17:00")).toBe(8);
    const hrs = entryHours(
      new Date("2026-05-07T10:00:00.000Z"),
      null,
      null,
      new Date("2026-05-07T14:00:00.000Z"),
    );
    expect(hrs).toBe(4);
  });

  it("predicts overtime when projected week hours exceed threshold", () => {
    const predictions = buildOvertimePredictions({
      now,
      shifts: [
        {
          staffMemberId: "s1",
          staffName: "Alex",
          shiftDate: new Date("2026-05-05"),
          startTime: "08:00",
          endTime: "16:00",
        },
        {
          staffMemberId: "s1",
          staffName: "Alex",
          shiftDate: new Date("2026-05-06"),
          startTime: "08:00",
          endTime: "16:00",
        },
        {
          staffMemberId: "s1",
          staffName: "Alex",
          shiftDate: new Date("2026-05-07"),
          startTime: "08:00",
          endTime: "16:00",
        },
        {
          staffMemberId: "s1",
          staffName: "Alex",
          shiftDate: new Date("2026-05-08"),
          startTime: "08:00",
          endTime: "16:00",
        },
        {
          staffMemberId: "s1",
          staffName: "Alex",
          shiftDate: new Date("2026-05-09"),
          startTime: "08:00",
          endTime: "16:00",
        },
        {
          staffMemberId: "s1",
          staffName: "Alex",
          shiftDate: new Date("2026-05-10"),
          startTime: "08:00",
          endTime: "16:00",
        },
      ],
      timeEntries: [
        {
          staffId: "s1",
          staffName: "Alex",
          clockIn: new Date("2026-05-07T08:00:00.000Z"),
          clockOut: new Date("2026-05-07T18:00:00.000Z"),
          totalHours: 10,
          status: "COMPLETED",
        },
      ],
    });

    expect(predictions.length).toBeGreaterThan(0);
    expect(predictions[0]?.staffName).toBe("Alex");
    expect(predictions[0]?.projectedWeekHours).toBeGreaterThan(36);
  });

  it("builds labor snapshot with status and overtime list", () => {
    const snapshot = buildLaborRealtimeSnapshot({
      now,
      hourlyRate: 20,
      totalRevenue: 1000,
      targetLaborPercent: 30,
      timeEntries: [
        {
          staffId: "s1",
          staffName: "Alex",
          clockIn: new Date("2026-05-07T08:00:00.000Z"),
          clockOut: new Date("2026-05-07T16:00:00.000Z"),
          totalHours: 8,
          status: "COMPLETED",
        },
      ],
      todayShifts: [
        {
          staffMemberId: "s1",
          staffName: "Alex",
          shiftDate: new Date("2026-05-07"),
          startTime: "08:00",
          endTime: "16:00",
          laborCost: 160,
        },
      ],
      weekShifts: [
        {
          staffMemberId: "s1",
          staffName: "Alex",
          shiftDate: new Date("2026-05-07"),
          startTime: "08:00",
          endTime: "16:00",
          laborCost: 160,
        },
      ],
    });

    expect(snapshot.laborCost).toBe(160);
    expect(snapshot.laborPercent).toBe(16);
    expect(snapshot.status).toBe("UNDER");
    expect(snapshot.updatedAtIso).toBeTruthy();
  });
});
