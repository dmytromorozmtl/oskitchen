import type { StaffShiftStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  laborRateListWhereForOwner,
  orderListWhereForOwnerAnd,
  staffShiftByIdWhereForOwner,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { normalizeTime } from "@/lib/staff/staff-availability";
import { createShift } from "@/services/staff/staff-service";

function shiftHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

async function hourlyRateForUser(userId: string): Promise<number> {
  const rateWhere = await laborRateListWhereForOwner(userId);
  const rate = await prisma.laborRate.findFirst({
    where: { AND: [rateWhere, { active: true }] },
    orderBy: { createdAt: "desc" },
    select: { hourlyRate: true },
  });
  return rate ? Number(rate.hourlyRate) : 18;
}

export async function calculateShiftLaborCost(
  startTime: string,
  endTime: string,
  userId: string,
): Promise<number> {
  const hours = shiftHours(startTime, endTime);
  const rate = await hourlyRateForUser(userId);
  return Math.round(hours * rate * 100) / 100;
}

export function weekStartMonday(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export async function getWeeklySchedule(userId: string, weekStart: Date) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  const shiftWhere = await staffShiftListWhereForOwner(userId);
  return prisma.staffShift.findMany({
    where: { AND: [shiftWhere, { shiftDate: { gte: weekStart, lt: end } }] },
    orderBy: [{ shiftDate: "asc" }, { startTime: "asc" }],
    include: {
      staffMember: { select: { id: true, name: true, roleType: true } },
      location: { select: { id: true, name: true } },
    },
  });
}

export async function createScheduledShift(
  userId: string,
  data: {
    staffMemberId: string;
    shiftDate: Date;
    startTime: string;
    endTime: string;
    roleLabel?: string;
    locationId?: string;
    notes?: string;
    performedById?: string;
  },
) {
  const laborCost = await calculateShiftLaborCost(data.startTime, data.endTime, userId);
  const result = await createShift({
    userId,
    performedById: data.performedById,
    staffMemberId: data.staffMemberId,
    shiftDate: data.shiftDate,
    startTime: data.startTime,
    endTime: data.endTime,
    roleLabel: data.roleLabel,
    locationId: data.locationId,
    notes: data.notes,
  });
  if (!result.ok) return result;
  const updated = await prisma.staffShift.update({
    where: { id: result.shift.id },
    data: { laborCost },
  });
  return { ok: true as const, shift: updated };
}

export async function updateScheduledShift(
  shiftId: string,
  userId: string,
  data: {
    shiftDate?: Date;
    startTime?: string;
    endTime?: string;
    roleLabel?: string;
    status?: StaffShiftStatus;
  },
) {
  const shiftWhere = await staffShiftByIdWhereForOwner(userId, shiftId);
  const existing = await prisma.staffShift.findFirst({ where: shiftWhere });
  if (!existing) throw new Error("Shift not found");

  const startTime = data.startTime ? normalizeTime(data.startTime) : existing.startTime;
  const endTime = data.endTime ? normalizeTime(data.endTime) : existing.endTime;
  const laborCost = await calculateShiftLaborCost(startTime, endTime, userId);

  return prisma.staffShift.update({
    where: { id: existing.id },
    data: {
      shiftDate: data.shiftDate,
      startTime,
      endTime,
      roleLabel: data.roleLabel,
      status: data.status,
      laborCost,
    },
    include: {
      staffMember: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
  });
}

export async function deleteScheduledShift(shiftId: string, userId: string) {
  const shiftWhere = await staffShiftByIdWhereForOwner(userId, shiftId);
  const existing = await prisma.staffShift.findFirst({ where: shiftWhere });
  if (!existing) throw new Error("Shift not found");
  await prisma.staffShift.delete({ where: { id: existing.id } });
}

export async function getLaborVsSales(userId: string, date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const weekStart = weekStartMonday(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [shiftWhere, orderWhere] = await Promise.all([
    staffShiftListWhereForOwner(userId),
    orderListWhereForOwnerAnd(userId, {
      createdAt: { gte: dayStart, lt: dayEnd },
      status: { not: "CANCELLED" },
    }),
  ]);

  const [dayShifts, weekShifts, revenue] = await Promise.all([
    prisma.staffShift.findMany({
      where: { AND: [shiftWhere, { shiftDate: { gte: dayStart, lt: dayEnd } }] },
      select: { laborCost: true, startTime: true, endTime: true },
    }),
    prisma.staffShift.findMany({
      where: { AND: [shiftWhere, { shiftDate: { gte: weekStart, lt: weekEnd } }] },
      include: { staffMember: { select: { id: true, name: true } } },
    }),
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { total: true },
    }),
  ]);

  const scheduledLabor = dayShifts.reduce((s, sh) => s + Number(sh.laborCost), 0);
  const sales = Number(revenue._sum.total ?? 0);
  const laborPct = sales > 0 ? (scheduledLabor / sales) * 100 : 0;

  const hoursByStaff = new Map<string, { name: string; hours: number }>();
  for (const sh of weekShifts) {
    const hrs = shiftHours(sh.startTime, sh.endTime);
    const cur = hoursByStaff.get(sh.staffMemberId) ?? {
      name: sh.staffMember.name,
      hours: 0,
    };
    cur.hours += hrs;
    hoursByStaff.set(sh.staffMemberId, cur);
  }
  const overtimeAlerts = [...hoursByStaff.values()].filter((s) => s.hours > 40);

  return {
    scheduledLabor,
    sales,
    laborPct: Math.round(laborPct * 10) / 10,
    overtimeAlerts,
  };
}
