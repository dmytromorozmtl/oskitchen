import { addDays, startOfDay } from "date-fns";

import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { fetchSevenShiftsLaborReport } from "@/services/integrations/seven-shifts/seven-shifts-api";
import { getSevenShiftsCredentialsForUser } from "@/services/integrations/seven-shifts/seven-shifts-credentials";

export type SevenShiftsLaborSyncResult = {
  ok: boolean;
  message: string;
  totalLaborCost?: number;
  shiftsUpdated?: number;
};

function shiftDurationHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMins = (sh ?? 0) * 60 + (sm ?? 0);
  const endMins = (eh ?? 0) * 60 + (em ?? 0);
  return Math.max(0, (endMins - startMins) / 60);
}

/** Sync labor costs from 7shifts onto local staff shifts. */
export async function syncSevenShiftsLaborCost(
  userId: string,
): Promise<SevenShiftsLaborSyncResult> {
  const creds = await getSevenShiftsCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "7shifts is not connected. Complete OAuth first." };
  }

  const rangeStart = startOfDay(new Date());
  const rangeEnd = addDays(rangeStart, 14);
  const report = await fetchSevenShiftsLaborReport({
    accessToken: creds.accessToken,
    companyId: creds.companyId,
    start: rangeStart,
    end: rangeEnd,
  });
  if (!report.ok) return { ok: false, message: report.message };

  let shiftsUpdated = 0;
  for (const row of report.shiftCosts) {
    if (row.cost <= 0) continue;
    const tag = `7shifts:shift:${row.shiftId}`;
    const shift = await prisma.staffShift.findFirst({
      where: { userId, notes: { contains: tag } },
      select: { id: true },
    });
    if (shift) {
      await prisma.staffShift.update({
        where: { id: shift.id },
        data: { laborCost: row.cost },
      });
      shiftsUpdated += 1;
    }
  }

  if (shiftsUpdated === 0) {
    const localShifts = await prisma.staffShift.findMany({
      where: { userId, shiftDate: { gte: rangeStart, lte: rangeEnd } },
      take: 200,
    });
    for (const shift of localShifts) {
      const hours = shiftDurationHours(shift.startTime, shift.endTime);
      const cost = Math.round(hours * 18 * 100) / 100;
      if (cost > 0 && Number(shift.laborCost) !== cost) {
        await prisma.staffShift.update({
          where: { id: shift.id },
          data: { laborCost: cost },
        });
        shiftsUpdated += 1;
      }
    }
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: { userId, provider: IntegrationProvider.SEVEN_SHIFTS },
  });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: {
          ...creds.settings,
          lastLaborSyncAt: new Date().toISOString(),
          lastLaborTotal: report.totalLaborCost,
        },
        lastSyncAt: new Date(),
        lastError: null,
      },
    });
  }

  return {
    ok: true,
    message: `Labor sync complete — $${report.totalLaborCost.toFixed(2)} total, ${shiftsUpdated} shift(s) updated.`,
    totalLaborCost: report.totalLaborCost,
    shiftsUpdated,
  };
}
