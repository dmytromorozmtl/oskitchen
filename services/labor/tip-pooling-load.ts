import { tipPoolRulesFromSettingsCenter } from "@/lib/labor/tip-pool-settings";
import { prisma } from "@/lib/prisma";
import {
  posTransactionListWhereForOwner,
  staffMemberListWhereForOwner,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import {
  buildTipPoolReport,
  type TipPoolReportSnapshot,
} from "@/services/labor/tip-pooling-service";

export async function loadTipPoolReport(
  userId: string,
  from: Date,
  to: Date,
): Promise<TipPoolReportSnapshot> {
  const dayEnd = new Date(to);
  dayEnd.setHours(23, 59, 59, 999);

  const [txWhere, shiftWhere, kitchen] = await Promise.all([
    posTransactionListWhereForOwner(userId),
    staffShiftListWhereForOwner(userId),
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { settingsCenterJson: true },
    }),
  ]);

  const rules = tipPoolRulesFromSettingsCenter(kitchen?.settingsCenterJson);

  const [transactions, shifts, staff] = await Promise.all([
    prisma.pOSTransaction.findMany({
      where: {
        AND: [
          txWhere,
          { createdAt: { gte: from, lte: dayEnd } },
          { status: { not: "VOIDED" } },
        ],
      },
      select: { staffId: true, tip: true, createdAt: true },
    }),
    prisma.staffShift.findMany({
      where: {
        AND: [shiftWhere, { shiftDate: { gte: from, lte: dayEnd } }],
      },
      select: { staffMemberId: true, shiftDate: true, startTime: true, endTime: true },
    }),
    prisma.staffMember.findMany({
      where: { AND: [await staffMemberListWhereForOwner(userId), { status: "ACTIVE" }] },
      select: { id: true, name: true, roleType: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return buildTipPoolReport({
    from,
    to,
    rules,
    tips: transactions.map((t) => ({
      staffId: t.staffId,
      tip: Number(t.tip),
      createdAt: t.createdAt,
    })),
    shifts: shifts.map((s) => ({
      staffMemberId: s.staffMemberId,
      shiftDate: s.shiftDate,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
    staff: staff.map((s) => ({
      id: s.id,
      name: s.name,
      roleType: s.roleType,
    })),
  });
}
