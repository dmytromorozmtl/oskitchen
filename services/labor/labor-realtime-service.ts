import { prisma } from "@/lib/prisma";
import {
  laborRateListWhereForOwner,
  orderListWhereForOwnerAnd,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { timeEntryListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";

async function hourlyRateForUser(userId: string): Promise<number> {
  const rateScope = await laborRateListWhereForOwner(userId);
  const rate = await prisma.laborRate.findFirst({
    where: { AND: [rateScope, { active: true }] },
    orderBy: { createdAt: "desc" },
    select: { hourlyRate: true },
  });
  return rate ? Number(rate.hourlyRate) : 18;
}

function entryHours(
  clockIn: Date,
  clockOut: Date | null,
  totalHours: { toNumber?: () => number } | number | null,
): number {
  if (totalHours != null) {
    return typeof totalHours === "number" ? totalHours : Number(totalHours);
  }
  if (!clockOut) {
    return (Date.now() - clockIn.getTime()) / 3_600_000;
  }
  return (clockOut.getTime() - clockIn.getTime()) / 3_600_000;
}

export async function getLaborRealtimeData(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [timeScope, shiftScope, orderWhere, rate] = await Promise.all([
    timeEntryListWhereForOwner(userId),
    staffShiftListWhereForOwner(userId),
    orderListWhereForOwnerAnd(userId, {
      createdAt: { gte: today, lt: tomorrow },
      status: { not: "CANCELLED" },
    }),
    hourlyRateForUser(userId),
  ]);

  const [activeEntries, todayEntries, scheduledShifts, revenue] = await Promise.all([
    prisma.timeEntry.findMany({
      where: { AND: [timeScope, { status: { in: ["ACTIVE", "ON_BREAK"] } }] },
      include: { staffMember: { select: { id: true, name: true } } },
    }),
    prisma.timeEntry.findMany({
      where: { AND: [timeScope, { clockIn: { gte: today, lt: tomorrow } }] },
      select: { clockIn: true, clockOut: true, totalHours: true },
    }),
    prisma.staffShift.findMany({
      where: { AND: [shiftScope, { shiftDate: { gte: today, lt: tomorrow } }] },
      select: { laborCost: true },
    }),
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { total: true },
    }),
  ]);

  const totalLaborHours = todayEntries.reduce(
    (sum, e) => sum + entryHours(e.clockIn, e.clockOut, e.totalHours),
    0,
  );
  const laborCost = totalLaborHours * rate;
  const totalRevenue = Number(revenue._sum.total ?? 0);
  const laborPercent = totalRevenue > 0 ? (laborCost / totalRevenue) * 100 : 0;
  const scheduledLaborCost = scheduledShifts.reduce((s, sh) => s + Number(sh.laborCost), 0);
  const scheduledLaborPercent =
    totalRevenue > 0 ? (scheduledLaborCost / totalRevenue) * 100 : 0;

  const targetLaborPercent = 30;
  const status: "OVER" | "ON_TRACK" | "UNDER" =
    laborPercent > 35 ? "OVER" : laborPercent > 25 ? "ON_TRACK" : "UNDER";

  return {
    activeStaff: activeEntries.length,
    activeStaffNames: activeEntries.map((e) => e.staffMember.name),
    totalLaborHours: Math.round(totalLaborHours * 10) / 10,
    laborCost: Math.round(laborCost * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    laborPercent: Math.round(laborPercent * 10) / 10,
    scheduledLaborCost: Math.round(scheduledLaborCost * 100) / 100,
    scheduledLaborPercent: Math.round(scheduledLaborPercent * 10) / 10,
    targetLaborPercent,
    status,
  };
}
