import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  integrationConnectionByProviderWhereForOwner,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { createSevenShiftsShift } from "@/services/integrations/seven-shifts/seven-shifts-api";
import { getSevenShiftsCredentialsForUser } from "@/services/integrations/seven-shifts/seven-shifts-credentials";

export type SevenShiftsScheduleExportResult = {
  ok: boolean;
  message: string;
  exported?: number;
  failed?: number;
};

function shiftDurationHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMins = (sh ?? 0) * 60 + (sm ?? 0);
  const endMins = (eh ?? 0) * 60 + (em ?? 0);
  return Math.max(0, (endMins - startMins) / 60);
}

/** Export upcoming OS Kitchen shifts to 7shifts. */
export async function syncSevenShiftsScheduleExport(
  userId: string,
): Promise<SevenShiftsScheduleExportResult> {
  const creds = await getSevenShiftsCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "7shifts is not connected. Complete OAuth first." };
  }

  const mappings = creds.settings.staffMappings ?? {};
  const reverseMap = new Map<string, number>();
  for (const [staffMemberId, externalId] of Object.entries(mappings)) {
    const userIdNum = Number(externalId.trim());
    if (staffMemberId && Number.isFinite(userIdNum) && userIdNum > 0) {
      reverseMap.set(staffMemberId, userIdNum);
    }
  }
  if (reverseMap.size === 0) {
    return { ok: false, message: "Configure staff mappings before exporting schedules." };
  }

  const exportedIds = new Set(creds.settings.exportedShiftIds ?? []);
  const shiftScope = await staffShiftListWhereForOwner(userId);
  const upcoming = await prisma.staffShift.findMany({
    where: {
      AND: [shiftScope, { shiftDate: { gte: new Date() }, status: "SCHEDULED" }],
    },
    take: 100,
    orderBy: { shiftDate: "asc" },
  });

  let exported = 0;
  let failed = 0;

  for (const shift of upcoming) {
    if (exportedIds.has(shift.id)) continue;
    const sevenUserId = reverseMap.get(shift.staffMemberId);
    if (!sevenUserId) continue;

    const date = shift.shiftDate.toISOString().slice(0, 10);
    const result = await createSevenShiftsShift({
      accessToken: creds.accessToken,
      companyId: creds.companyId,
      userId: sevenUserId,
      start: `${date} ${shift.startTime}:00`,
      end: `${date} ${shift.endTime}:00`,
      notes: shift.notes,
    });

    if (!result.ok) {
      failed += 1;
      continue;
    }

    exportedIds.add(shift.id);
    exported += 1;

    const hours = shiftDurationHours(shift.startTime, shift.endTime);
    if (hours > 0 && Number(shift.laborCost) === 0) {
      await prisma.staffShift.update({
        where: { id: shift.id },
        data: { laborCost: hours * 18 },
      });
    }
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.SEVEN_SHIFTS),
  });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: {
          ...creds.settings,
          exportedShiftIds: [...exportedIds],
          lastScheduleExportAt: new Date().toISOString(),
        },
        lastSyncAt: new Date(),
      },
    });
  }

  return {
    ok: failed === 0,
    message: `Exported ${exported} shift(s) to 7shifts (${failed} failed).`,
    exported,
    failed,
  };
}
