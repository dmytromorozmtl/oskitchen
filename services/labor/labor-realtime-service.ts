import { weekStartMonday } from "@/services/labor/schedule-service";

export type OvertimePrediction = {
  staffMemberId: string;
  staffName: string;
  weekScheduledHours: number;
  todayClockedHours: number;
  projectedWeekHours: number;
  overtimeHours: number;
  severity: "warning" | "critical";
};

export type LaborRealtimeSnapshot = {
  activeStaff: number;
  activeStaffNames: string[];
  totalLaborHours: number;
  laborCost: number;
  totalRevenue: number;
  laborPercent: number;
  scheduledLaborCost: number;
  scheduledLaborPercent: number;
  targetLaborPercent: number;
  hourlyRate: number;
  status: "OVER" | "ON_TRACK" | "UNDER";
  overtimePredictions: OvertimePrediction[];
  updatedAtIso: string;
};

const OT_THRESHOLD = 40;
const OT_WARNING = 36;

export type TimeEntryRow = {
  staffId: string;
  staffName: string;
  clockIn: Date;
  clockOut: Date | null;
  totalHours: number | null;
  status: string;
};

export type ShiftRow = {
  staffMemberId: string;
  staffName: string;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  laborCost: number;
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function shiftHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

export function entryHours(
  clockIn: Date,
  clockOut: Date | null,
  totalHours: number | null,
  now = new Date(),
): number {
  if (totalHours != null && Number.isFinite(totalHours)) return totalHours;
  if (!clockOut) return (now.getTime() - clockIn.getTime()) / 3_600_000;
  return (clockOut.getTime() - clockIn.getTime()) / 3_600_000;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export function buildOvertimePredictions(params: {
  shifts: ShiftRow[];
  timeEntries: TimeEntryRow[];
  now?: Date;
}): OvertimePrediction[] {
  const now = params.now ?? new Date();
  const today = startOfDay(now);
  const weekStart = weekStartMonday(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekShifts = params.shifts.filter(
    (s) => s.shiftDate >= weekStart && s.shiftDate < weekEnd,
  );

  const scheduledByStaff = new Map<string, { name: string; hours: number; todayScheduled: number }>();
  for (const shift of weekShifts) {
    const hrs = shiftHours(shift.startTime, shift.endTime);
    const cur = scheduledByStaff.get(shift.staffMemberId) ?? {
      name: shift.staffName,
      hours: 0,
      todayScheduled: 0,
    };
    cur.hours = round1(cur.hours + hrs);
    if (isSameDay(shift.shiftDate, today)) cur.todayScheduled = round1(cur.todayScheduled + hrs);
    scheduledByStaff.set(shift.staffMemberId, cur);
  }

  const clockedTodayByStaff = new Map<string, { name: string; hours: number }>();
  for (const entry of params.timeEntries) {
    if (!isSameDay(entry.clockIn, today)) continue;
    const hrs = entryHours(entry.clockIn, entry.clockOut, entry.totalHours, now);
    const cur = clockedTodayByStaff.get(entry.staffId) ?? { name: entry.staffName, hours: 0 };
    cur.hours = round1(cur.hours + hrs);
    clockedTodayByStaff.set(entry.staffId, cur);
  }

  const staffIds = new Set([...scheduledByStaff.keys(), ...clockedTodayByStaff.keys()]);
  const predictions: OvertimePrediction[] = [];

  for (const staffMemberId of staffIds) {
    const scheduled = scheduledByStaff.get(staffMemberId);
    const clocked = clockedTodayByStaff.get(staffMemberId);
    const staffName = scheduled?.name ?? clocked?.name ?? "Staff";
    const weekScheduledHours = scheduled?.hours ?? 0;
    const todayClockedHours = clocked?.hours ?? 0;
    const todayScheduled = scheduled?.todayScheduled ?? 0;
    const todayDelta = Math.max(0, todayClockedHours - todayScheduled);
    const projectedWeekHours = round1(weekScheduledHours + todayDelta);
    const overtimeHours = round1(Math.max(0, projectedWeekHours - OT_THRESHOLD));

    if (projectedWeekHours < OT_WARNING) continue;

    predictions.push({
      staffMemberId,
      staffName,
      weekScheduledHours,
      todayClockedHours,
      projectedWeekHours,
      overtimeHours,
      severity: projectedWeekHours >= OT_THRESHOLD + 4 || overtimeHours > 0 ? "critical" : "warning",
    });
  }

  return predictions.sort((a, b) => b.projectedWeekHours - a.projectedWeekHours);
}

export function buildLaborRealtimeSnapshot(params: {
  timeEntries: TimeEntryRow[];
  todayShifts: ShiftRow[];
  weekShifts: ShiftRow[];
  totalRevenue: number;
  hourlyRate: number;
  targetLaborPercent?: number;
  now?: Date;
}): LaborRealtimeSnapshot {
  const now = params.now ?? new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetLaborPercent = params.targetLaborPercent ?? 30;

  const todayEntries = params.timeEntries.filter(
    (e) => e.clockIn >= today && e.clockIn < tomorrow,
  );
  const activeEntries = params.timeEntries.filter((e) =>
    ["ACTIVE", "ON_BREAK"].includes(e.status),
  );

  const totalLaborHours = round1(
    todayEntries.reduce(
      (sum, e) => sum + entryHours(e.clockIn, e.clockOut, e.totalHours, now),
      0,
    ),
  );

  const laborCost = round2(totalLaborHours * params.hourlyRate);
  const totalRevenue = round2(params.totalRevenue);
  const laborPercent = totalRevenue > 0 ? round1((laborCost / totalRevenue) * 100) : 0;

  const scheduledLaborCost = round2(
    params.todayShifts.reduce((sum, shift) => sum + shift.laborCost, 0),
  );
  const scheduledLaborPercent =
    totalRevenue > 0 ? round1((scheduledLaborCost / totalRevenue) * 100) : 0;

  const status: LaborRealtimeSnapshot["status"] =
    laborPercent > targetLaborPercent + 5
      ? "OVER"
      : laborPercent >= targetLaborPercent - 5
        ? "ON_TRACK"
        : "UNDER";

  const overtimePredictions = buildOvertimePredictions({
    shifts: params.weekShifts,
    timeEntries: params.timeEntries,
    now,
  });

  return {
    activeStaff: activeEntries.length,
    activeStaffNames: activeEntries.map((e) => e.staffName),
    totalLaborHours,
    laborCost,
    totalRevenue,
    laborPercent,
    scheduledLaborCost,
    scheduledLaborPercent,
    targetLaborPercent,
    hourlyRate: params.hourlyRate,
    status,
    overtimePredictions,
    updatedAtIso: now.toISOString(),
  };
}
