import { addDays, startOfDay } from "date-fns";

import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { staffMemberListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  buildHomebaseUserMap,
  parseHomebaseDateTime,
} from "@/services/integrations/homebase-import-service";
import { fetchHomebaseShiftsApi } from "@/services/integrations/homebase/homebase-api";
import { getHomebaseCredentialsForUser } from "@/services/integrations/homebase/homebase-credentials";

export type HomebaseScheduleImportResult = {
  ok: boolean;
  message: string;
  imported?: number;
  updated?: number;
};

function externalShiftNote(shiftId: string): string {
  return `homebase:shift:${shiftId}`;
}

export async function syncHomebaseScheduleImport(
  userId: string,
  staffMappings?: Record<string, string>,
): Promise<HomebaseScheduleImportResult> {
  const creds = await getHomebaseCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "Homebase is not connected. Complete OAuth first." };
  }

  const mappings = staffMappings ?? creds.settings.staffMappings ?? {};
  const userMap = buildHomebaseUserMap(mappings);
  if (userMap.size === 0) {
    return {
      ok: false,
      message: "Map at least one staff member to a Homebase employee ID before importing.",
    };
  }

  const rangeStart = startOfDay(new Date());
  const rangeEnd = addDays(rangeStart, 14);
  const fetched = await fetchHomebaseShiftsApi({
    accessToken: creds.accessToken,
    locationId: creds.locationId,
    start: rangeStart,
    end: rangeEnd,
  });
  if (!fetched.ok) return { ok: false, message: fetched.message };

  const staffScope = await staffMemberListWhereForOwner(userId);
  const allowedStaff = await prisma.staffMember.findMany({
    where: { AND: [staffScope, { id: { in: [...userMap.values()] }, status: "ACTIVE" }] },
    select: { id: true },
  });
  const allowedIds = new Set(allowedStaff.map((s) => s.id));
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  let imported = 0;
  let updated = 0;

  for (const shift of fetched.shifts) {
    const staffMemberId = userMap.get(shift.userId);
    if (!staffMemberId || !allowedIds.has(staffMemberId)) continue;

    const start = parseHomebaseDateTime(shift.startAt);
    const end = parseHomebaseDateTime(shift.endAt);
    const tag = externalShiftNote(shift.id);
    const existing = await prisma.staffShift.findFirst({
      where: { userId, staffMemberId, notes: { contains: tag } },
      select: { id: true },
    });

    const data = {
      shiftDate: start.shiftDate,
      startTime: start.time,
      endTime: end.time,
      status: "SCHEDULED" as const,
      notes: shift.notes ? `${tag} — ${shift.notes}` : tag,
      laborCost: 0,
    };

    if (existing) {
      await prisma.staffShift.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.staffShift.create({
        data: {
          userId,
          workspaceId: workspaceId ?? undefined,
          staffMemberId,
          ...data,
        },
      });
      imported += 1;
    }
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: { userId, provider: IntegrationProvider.HOMEBASE },
  });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: {
          ...creds.settings,
          staffMappings: mappings,
          lastScheduleImportAt: new Date().toISOString(),
        },
        lastSyncAt: new Date(),
        lastError: null,
      },
    });
  }

  return {
    ok: true,
    message: `Imported ${imported} shift(s), updated ${updated} (${fetched.shifts.length} fetched from Homebase).`,
    imported,
    updated,
  };
}
