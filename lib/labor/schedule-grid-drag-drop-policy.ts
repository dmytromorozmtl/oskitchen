/**
 * Absolute Final Task 45 — schedule grid drag-drop (7shifts parity).
 */

export const SCHEDULE_GRID_DRAG_DROP_POLICY_ID =
  "schedule-grid-drag-drop-absolute-final-v1" as const;

export const SCHEDULE_GRID_ROUTE = "/dashboard/staff/schedule" as const;

export const SCHEDULE_GRID_PANEL_PATH =
  "components/dashboard/staff/schedule-grid-drag-drop.tsx" as const;

export const SCHEDULE_GRID_SERVICE_PATH =
  "services/labor/schedule-grid-drag-drop-service.ts" as const;

export const SCHEDULE_GRID_CI_SCRIPTS = ["test:ci:schedule-grid-drag-drop"] as const;

export const SCHEDULE_GRID_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type ScheduleGridShift = {
  id: string;
  staffMemberId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  roleLabel: string | null;
  laborCost: number;
};

export type ScheduleGridStaffRow = {
  id: string;
  name: string;
  weeklyHours: number;
  weeklyLaborCost: number;
};

export type ScheduleGridConflictKind = "overlap" | "weekly_overtime";

export type ScheduleGridConflict = {
  kind: ScheduleGridConflictKind;
  shiftId: string;
  message: string;
};

export function scheduleGridCellId(staffMemberId: string, shiftDate: string): string {
  return `cell:${staffMemberId}:${shiftDate}`;
}

export function parseScheduleGridCellId(
  cellId: string,
): { staffMemberId: string; shiftDate: string } | null {
  if (!cellId.startsWith("cell:")) return null;
  const parts = cellId.slice(5).split(":");
  if (parts.length < 2) return null;
  const shiftDate = parts[parts.length - 1]!;
  const staffMemberId = parts.slice(0, -1).join(":");
  if (!staffMemberId || !/^\d{4}-\d{2}-\d{2}$/.test(shiftDate)) return null;
  return { staffMemberId, shiftDate };
}

export function buildScheduleWeekDays(weekStartIso: string): string[] {
  const weekStart = new Date(weekStartIso);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function shiftMinutes(startTime: string, endTime: string): { start: number; end: number } {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const start = sh * 60 + sm;
  let end = eh * 60 + em;
  if (end <= start) end += 24 * 60;
  return { start, end };
}

export function shiftDurationHours(startTime: string, endTime: string): number {
  const { start, end } = shiftMinutes(startTime, endTime);
  return (end - start) / 60;
}

export function shiftsTimeOverlap(
  a: Pick<ScheduleGridShift, "startTime" | "endTime">,
  b: Pick<ScheduleGridShift, "startTime" | "endTime">,
): boolean {
  const left = shiftMinutes(a.startTime, a.endTime);
  const right = shiftMinutes(b.startTime, b.endTime);
  return left.start < right.end && right.start < left.end;
}

export function detectScheduleGridConflicts(
  shifts: readonly ScheduleGridShift[],
  move: { shiftId: string; staffMemberId: string; shiftDate: string },
  options?: { weeklyOvertimeHours?: number },
): ScheduleGridConflict[] {
  const overtimeThreshold = options?.weeklyOvertimeHours ?? 40;
  const moving = shifts.find((shift) => shift.id === move.shiftId);
  if (!moving) return [];

  const conflicts: ScheduleGridConflict[] = [];
  const sameDay = shifts.filter(
    (shift) =>
      shift.id !== move.shiftId &&
      shift.staffMemberId === move.staffMemberId &&
      shift.shiftDate === move.shiftDate,
  );

  for (const other of sameDay) {
    if (shiftsTimeOverlap(moving, other)) {
      conflicts.push({
        kind: "overlap",
        shiftId: move.shiftId,
        message: `Overlaps ${other.startTime}–${other.endTime} on ${move.shiftDate}`,
      });
    }
  }

  const weekHours = shifts
    .filter((shift) => shift.staffMemberId === move.staffMemberId && shift.id !== move.shiftId)
    .reduce((sum, shift) => sum + shiftDurationHours(shift.startTime, shift.endTime), 0);
  const movedHours = shiftDurationHours(moving.startTime, moving.endTime);
  if (weekHours + movedHours > overtimeThreshold) {
    conflicts.push({
      kind: "weekly_overtime",
      shiftId: move.shiftId,
      message: `Weekly hours would reach ${(weekHours + movedHours).toFixed(1)}h (>${overtimeThreshold}h)`,
    });
  }

  return conflicts;
}

export function dailyLaborTotals(
  shifts: readonly ScheduleGridShift[],
  days: readonly string[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const day of days) totals[day] = 0;
  for (const shift of shifts) {
    totals[shift.shiftDate] = (totals[shift.shiftDate] ?? 0) + shift.laborCost;
  }
  return totals;
}

export function assessScheduleGridMove(
  shifts: readonly ScheduleGridShift[],
  move: { shiftId: string; staffMemberId: string; shiftDate: string },
): ScheduleGridConflict[] {
  return detectScheduleGridConflicts(shifts, move);
}
