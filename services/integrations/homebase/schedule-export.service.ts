import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  integrationConnectionByProviderWhereForOwner,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { createHomebaseShift } from "@/services/integrations/homebase/homebase-api";
import { getHomebaseCredentialsForUser } from "@/services/integrations/homebase/homebase-credentials";

export type HomebaseScheduleExportResult = {
  ok: boolean;
  message: string;
  exported?: number;
  failed?: number;
};

export async function syncHomebaseScheduleExport(
  userId: string,
): Promise<HomebaseScheduleExportResult> {
  const creds = await getHomebaseCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "Homebase is not connected. Complete OAuth first." };
  }

  const mappings = creds.settings.staffMappings ?? {};
  const reverseMap = new Map<string, string>();
  for (const [staffMemberId, externalId] of Object.entries(mappings)) {
    const employeeId = externalId.trim();
    if (staffMemberId && employeeId) reverseMap.set(staffMemberId, employeeId);
  }
  if (reverseMap.size === 0) {
    return { ok: false, message: "Configure staff mappings before exporting schedules." };
  }

  const exportedIds = new Set(creds.settings.exportedShiftIds ?? []);
  const shiftScope = await staffShiftListWhereForOwner(userId);
  const upcoming = await prisma.staffShift.findMany({
    where: { AND: [shiftScope, { shiftDate: { gte: new Date() }, status: "SCHEDULED" }] },
    take: 100,
    orderBy: { shiftDate: "asc" },
  });

  let exported = 0;
  let failed = 0;

  for (const shift of upcoming) {
    if (exportedIds.has(shift.id)) continue;
    const employeeId = reverseMap.get(shift.staffMemberId);
    if (!employeeId) continue;

    const date = shift.shiftDate.toISOString().slice(0, 10);
    const result = await createHomebaseShift({
      accessToken: creds.accessToken,
      locationId: creds.locationId,
      userId: employeeId,
      startAt: `${date}T${shift.startTime}:00`,
      endAt: `${date}T${shift.endTime}:00`,
      notes: shift.notes,
    });

    if (!result.ok) {
      failed += 1;
      continue;
    }

    exportedIds.add(shift.id);
    exported += 1;
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.HOMEBASE),
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
    message: `Exported ${exported} shift(s) to Homebase (${failed} failed).`,
    exported,
    failed,
  };
}
