import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  assessScheduleGridMove,
  buildScheduleWeekDays,
  dailyLaborTotals,
  detectScheduleGridConflicts,
  parseScheduleGridCellId,
  scheduleGridCellId,
  SCHEDULE_GRID_CI_SCRIPTS,
  SCHEDULE_GRID_DRAG_DROP_POLICY_ID,
  SCHEDULE_GRID_PANEL_PATH,
  SCHEDULE_GRID_ROUTE,
  SCHEDULE_GRID_SERVICE_PATH,
  shiftsTimeOverlap,
} from "@/lib/labor/schedule-grid-drag-drop-policy";

const ROOT = process.cwd();

const SAMPLE_SHIFTS = [
  {
    id: "s1",
    staffMemberId: "staff-a",
    shiftDate: "2026-06-02",
    startTime: "09:00",
    endTime: "17:00",
    roleLabel: "Line",
    laborCost: 144,
  },
  {
    id: "s2",
    staffMemberId: "staff-a",
    shiftDate: "2026-06-03",
    startTime: "10:00",
    endTime: "18:00",
    roleLabel: "Line",
    laborCost: 144,
  },
  {
    id: "s3",
    staffMemberId: "staff-b",
    shiftDate: "2026-06-02",
    startTime: "12:00",
    endTime: "20:00",
    roleLabel: "Expo",
    laborCost: 144,
  },
];

describe("schedule grid drag-drop (Absolute Final Task 45)", () => {
  it("locks 7shifts-parity policy, route, and wiring paths", () => {
    expect(SCHEDULE_GRID_DRAG_DROP_POLICY_ID).toBe("schedule-grid-drag-drop-absolute-final-v1");
    expect(SCHEDULE_GRID_ROUTE).toBe("/dashboard/staff/schedule");
    expect(SCHEDULE_GRID_CI_SCRIPTS).toEqual(["test:ci:schedule-grid-drag-drop"]);
  });

  it("builds week days from Monday week start", () => {
    const days = buildScheduleWeekDays("2026-06-01T12:00:00.000Z");
    expect(days).toHaveLength(7);
    expect(days[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("encodes and parses staff × day drop cell ids", () => {
    const cellId = scheduleGridCellId("11111111-1111-4111-8111-111111111111", "2026-06-02");
    expect(parseScheduleGridCellId(cellId)).toEqual({
      staffMemberId: "11111111-1111-4111-8111-111111111111",
      shiftDate: "2026-06-02",
    });
  });

  it("detects overlapping shifts on the same day", () => {
    expect(shiftsTimeOverlap({ startTime: "09:00", endTime: "13:00" }, { startTime: "12:00", endTime: "16:00" })).toBe(
      true,
    );
    expect(shiftsTimeOverlap({ startTime: "09:00", endTime: "12:00" }, { startTime: "12:00", endTime: "16:00" })).toBe(
      false,
    );

    const conflicts = detectScheduleGridConflicts(
      [
        ...SAMPLE_SHIFTS,
        {
          id: "s4",
          staffMemberId: "staff-a",
          shiftDate: "2026-06-02",
          startTime: "14:00",
          endTime: "18:00",
          roleLabel: "Line",
          laborCost: 72,
        },
      ],
      { shiftId: "s4", staffMemberId: "staff-a", shiftDate: "2026-06-02" },
    );
    expect(conflicts.some((c) => c.kind === "overlap")).toBe(true);
  });

  it("warns on weekly overtime when moving shifts", () => {
    const heavyWeek = Array.from({ length: 5 }, (_, i) => ({
      id: `h${i}`,
      staffMemberId: "staff-a",
      shiftDate: `2026-06-0${i + 2}`,
      startTime: "08:00",
      endTime: "17:00",
      roleLabel: "Line",
      laborCost: 162,
    }));

    const conflicts = assessScheduleGridMove(heavyWeek, {
      shiftId: "h0",
      staffMemberId: "staff-a",
      shiftDate: "2026-06-08",
    });
    expect(conflicts.some((c) => c.kind === "weekly_overtime")).toBe(true);
  });

  it("sums daily labor totals for footer row", () => {
    const days = ["2026-06-02", "2026-06-03"];
    expect(dailyLaborTotals(SAMPLE_SHIFTS, days)).toEqual({
      "2026-06-02": 288,
      "2026-06-03": 144,
    });
  });

  it("ships grid panel, move action, and schedule page wiring", () => {
    expect(readFileSync(join(ROOT, SCHEDULE_GRID_PANEL_PATH), "utf8")).toContain("ScheduleGridDragDrop");
    expect(readFileSync(join(ROOT, SCHEDULE_GRID_SERVICE_PATH), "utf8")).toContain(
      "loadScheduleGridDragDropModel",
    );
    expect(readFileSync(join(ROOT, "actions/labor/schedule.ts"), "utf8")).toContain(
      "moveScheduleGridShiftAction",
    );
    expect(readFileSync(join(ROOT, "app/dashboard/staff/schedule/page.tsx"), "utf8")).toContain(
      "ScheduleGridDragDrop",
    );
  });
});
