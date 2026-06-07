import {
  buildScheduleWeekDays,
  dailyLaborTotals,
  assessScheduleGridMove,
  shiftDurationHours,
  SCHEDULE_GRID_DRAG_DROP_POLICY_ID,
  type ScheduleGridStaffRow,
} from "@/lib/labor/schedule-grid-drag-drop-policy";
import { getWeeklySchedule } from "@/services/labor/schedule-service";
import { prisma } from "@/lib/prisma";

export type ScheduleGridDragDropModel = {
  policyId: typeof SCHEDULE_GRID_DRAG_DROP_POLICY_ID;
  weekStartIso: string;
  days: string[];
  staffRows: ScheduleGridStaffRow[];
  shifts: Array<{
    id: string;
    staffMemberId: string;
    shiftDate: string;
    startTime: string;
    endTime: string;
    roleLabel: string | null;
    status: string;
    laborCost: number;
    staffName: string;
    locationName: string | null;
  }>;
  dailyLaborTotals: Record<string, number>;
  weekLaborTotal: number;
};

export async function loadScheduleGridDragDropModel(
  userId: string,
  weekStart: Date,
): Promise<ScheduleGridDragDropModel> {
  const weekStartIso = weekStart.toISOString();
  const days = buildScheduleWeekDays(weekStartIso);

  const [shifts, staff] = await Promise.all([
    getWeeklySchedule(userId, weekStart),
    prisma.staffMember.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const shiftRows = shifts.map((s) => ({
    id: s.id,
    staffMemberId: s.staffMemberId,
    shiftDate: s.shiftDate.toISOString().slice(0, 10),
    startTime: s.startTime,
    endTime: s.endTime,
    roleLabel: s.roleLabel,
    status: s.status,
    laborCost: Number(s.laborCost),
    staffName: s.staffMember.name,
    locationName: s.location?.name ?? null,
  }));

  const staffRows: ScheduleGridStaffRow[] = staff.map((member) => {
    const memberShifts = shiftRows.filter((shift) => shift.staffMemberId === member.id);
    return {
      id: member.id,
      name: member.name,
      weeklyHours: memberShifts.reduce(
        (sum, shift) => sum + shiftDurationHours(shift.startTime, shift.endTime),
        0,
      ),
      weeklyLaborCost: memberShifts.reduce((sum, shift) => sum + shift.laborCost, 0),
    };
  });

  const laborByDay = dailyLaborTotals(shiftRows, days);
  const weekLaborTotal = Object.values(laborByDay).reduce((sum, value) => sum + value, 0);

  return {
    policyId: SCHEDULE_GRID_DRAG_DROP_POLICY_ID,
    weekStartIso,
    days,
    staffRows,
    shifts: shiftRows,
    dailyLaborTotals: laborByDay,
    weekLaborTotal,
  };
}

export function assessScheduleGridMoveFromModel(
  shifts: ReadonlyArray<ScheduleGridDragDropModel["shifts"][number]>,
  move: { shiftId: string; staffMemberId: string; shiftDate: string },
) {
  return assessScheduleGridMove(
    shifts.map((shift) => ({
      id: shift.id,
      staffMemberId: shift.staffMemberId,
      shiftDate: shift.shiftDate,
      startTime: shift.startTime,
      endTime: shift.endTime,
      roleLabel: shift.roleLabel,
      laborCost: shift.laborCost,
    })),
    move,
  );
}
