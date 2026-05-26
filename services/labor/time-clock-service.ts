import { prisma } from "@/lib/prisma";
import { staffMemberListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { timeEntryListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";

const ACTIVE: ("ACTIVE" | "ON_BREAK")[] = ["ACTIVE", "ON_BREAK"];

export async function clockIn(userId: string, staffId: string, notes?: string) {
  const staffScope = await staffMemberListWhereForOwner(userId);
  const staff = await prisma.staffMember.findFirst({
    where: { AND: [staffScope, { id: staffId, status: "ACTIVE" }] },
  });
  if (!staff) throw new Error("Staff member not found");

  return prisma.timeEntry.create({
    data: { userId, staffId, notes: notes ?? null },
  });
}

export async function clockOut(entryId: string, userId: string) {
  const timeScope = await timeEntryListWhereForOwner(userId);
  const entry = await prisma.timeEntry.findFirst({
    where: { AND: [timeScope, { id: entryId, status: { in: ACTIVE } }] },
  });
  if (!entry) throw new Error("Entry not found");

  const now = new Date();
  const totalMs = now.getTime() - entry.clockIn.getTime();
  const breakMs =
    entry.breakEnd && entry.breakStart
      ? entry.breakEnd.getTime() - entry.breakStart.getTime()
      : 0;
  const totalHours = Math.max(0, (totalMs - (breakMs > 0 ? breakMs : 0)) / 3_600_000);

  return prisma.timeEntry.update({
    where: { id: entryId },
    data: { clockOut: now, totalHours, status: "CLOCKED_OUT" },
  });
}

export async function getActiveEntries(userId: string) {
  const timeScope = await timeEntryListWhereForOwner(userId);
  return prisma.timeEntry.findMany({
    where: { AND: [timeScope, { status: { in: ACTIVE } }] },
    include: { staffMember: { select: { id: true, name: true } } },
    orderBy: { clockIn: "desc" },
  });
}

export async function getTodayTimeEntries(userId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const timeScope = await timeEntryListWhereForOwner(userId);
  return prisma.timeEntry.findMany({
    where: { AND: [timeScope, { clockIn: { gte: start } }] },
    include: { staffMember: { select: { id: true, name: true } } },
    orderBy: { clockIn: "desc" },
  });
}

export async function getTimeEntriesForPeriod(userId: string, since: Date, until: Date) {
  const timeScope = await timeEntryListWhereForOwner(userId);
  return prisma.timeEntry.findMany({
    where: {
      AND: [
        timeScope,
        {
          clockIn: { gte: since, lte: until },
          clockOut: { not: null },
        },
      ],
    },
    include: { staffMember: { select: { id: true, name: true } } },
    orderBy: { clockIn: "desc" },
  });
}
