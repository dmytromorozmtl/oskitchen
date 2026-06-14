import { prisma } from "@/lib/prisma";
import { laborRateListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
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

export async function generatePayrollExport(
  userId: string,
  periodStart: Date,
  periodEnd: Date,
) {
  const end = new Date(periodEnd);
  end.setHours(23, 59, 59, 999);

  const timeScope = await timeEntryListWhereForOwner(userId);
  const entries = await prisma.timeEntry.findMany({
    where: {
      AND: [
        timeScope,
        {
          clockIn: { gte: periodStart, lte: end },
          clockOut: { not: null },
          status: "CLOCKED_OUT",
        },
      ],
    },
    include: { staffMember: { select: { id: true, name: true } } },
    orderBy: [{ staffId: "asc" }, { clockIn: "asc" }],
  });

  const hourlyRate = await hourlyRateForUser(userId);
  const byStaff = new Map<string, typeof entries>();

  for (const e of entries) {
    const list = byStaff.get(e.staffId) ?? [];
    list.push(e);
    byStaff.set(e.staffId, list);
  }

  const payroll: Array<{
    staffName: string;
    totalHours: number;
    hourlyRate: number;
    grossPay: number;
    shifts: number;
  }> = [];

  for (const shifts of byStaff.values()) {
    const totalHours = shifts.reduce((s, e) => s + Number(e.totalHours ?? 0), 0);
    payroll.push({
      staffName: shifts[0]!.staffMember.name,
      totalHours: Math.round(totalHours * 100) / 100,
      hourlyRate,
      grossPay: Math.round(totalHours * hourlyRate * 100) / 100,
      shifts: shifts.length,
    });
  }

  return {
    period: {
      start: periodStart.toISOString().slice(0, 10),
      end: periodEnd.toISOString().slice(0, 10),
    },
    totalLaborCost: payroll.reduce((s, p) => s + p.grossPay, 0),
    totalHours: payroll.reduce((s, p) => s + p.totalHours, 0),
    payroll,
  };
}

export function payrollToCSV(
  payroll: Awaited<ReturnType<typeof generatePayrollExport>>,
): string {
  const header = "Staff Name,Total Hours,Hourly Rate,Gross Pay,Shifts";
  const rows = payroll.payroll.map(
    (p) =>
      `"${p.staffName.replace(/"/g, '""')}",${p.totalHours},${p.hourlyRate},${p.grossPay},${p.shifts}`,
  );
  return [header, ...rows].join("\n");
}
