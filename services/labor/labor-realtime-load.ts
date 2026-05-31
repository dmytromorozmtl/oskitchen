import { prisma } from "@/lib/prisma";
import {
  laborRateListWhereForOwner,
  orderListWhereForOwnerAnd,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { timeEntryListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";
import {
  buildLaborRealtimeSnapshot,
  type LaborRealtimeSnapshot,
} from "@/services/labor/labor-realtime-service";
import { weekStartMonday } from "@/services/labor/schedule-service";

async function hourlyRateForUser(userId: string): Promise<number> {
  const rateScope = await laborRateListWhereForOwner(userId);
  const rate = await prisma.laborRate.findFirst({
    where: { AND: [rateScope, { active: true }] },
    orderBy: { createdAt: "desc" },
    select: { hourlyRate: true },
  });
  return rate ? Number(rate.hourlyRate) : 18;
}

export async function getLaborRealtimeData(userId: string): Promise<LaborRealtimeSnapshot> {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekStart = weekStartMonday(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [timeScope, shiftScope, orderWhere, rate] = await Promise.all([
    timeEntryListWhereForOwner(userId),
    staffShiftListWhereForOwner(userId),
    orderListWhereForOwnerAnd(userId, {
      createdAt: { gte: today, lt: tomorrow },
      status: { not: "CANCELLED" },
    }),
    hourlyRateForUser(userId),
  ]);

  const [timeEntries, todayShifts, weekShifts, revenue] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        AND: [
          timeScope,
          {
            OR: [
              { clockIn: { gte: today, lt: tomorrow } },
              { status: { in: ["ACTIVE", "ON_BREAK"] } },
              { clockIn: { gte: weekStart, lt: weekEnd } },
            ],
          },
        ],
      },
      include: { staffMember: { select: { id: true, name: true } } },
    }),
    prisma.staffShift.findMany({
      where: { AND: [shiftScope, { shiftDate: { gte: today, lt: tomorrow } }] },
      include: { staffMember: { select: { id: true, name: true } } },
    }),
    prisma.staffShift.findMany({
      where: { AND: [shiftScope, { shiftDate: { gte: weekStart, lt: weekEnd } }] },
      include: { staffMember: { select: { id: true, name: true } } },
    }),
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { total: true },
    }),
  ]);

  return buildLaborRealtimeSnapshot({
    timeEntries: timeEntries.map((e) => ({
      staffId: e.staffId,
      staffName: e.staffMember.name,
      clockIn: e.clockIn,
      clockOut: e.clockOut,
      totalHours: e.totalHours != null ? Number(e.totalHours) : null,
      status: e.status,
    })),
    todayShifts: todayShifts.map((s) => ({
      staffMemberId: s.staffMemberId,
      staffName: s.staffMember.name,
      shiftDate: s.shiftDate,
      startTime: s.startTime,
      endTime: s.endTime,
      laborCost: Number(s.laborCost),
    })),
    weekShifts: weekShifts.map((s) => ({
      staffMemberId: s.staffMemberId,
      staffName: s.staffMember.name,
      shiftDate: s.shiftDate,
      startTime: s.startTime,
      endTime: s.endTime,
      laborCost: Number(s.laborCost),
    })),
    totalRevenue: Number(revenue._sum.total ?? 0),
    hourlyRate: rate,
    now,
  });
}
