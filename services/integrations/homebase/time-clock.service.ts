import { addDays, startOfDay } from "date-fns";

import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { buildHomebaseUserMap } from "@/services/integrations/homebase-import-service";
import { fetchHomebaseTimePunches } from "@/services/integrations/homebase/homebase-api";
import { getHomebaseCredentialsForUser } from "@/services/integrations/homebase/homebase-credentials";

export type HomebaseTimeClockSyncResult = {
  ok: boolean;
  message: string;
  synced?: number;
  skipped?: number;
};

export function externalHomebaseTimecardNote(timecardId: string): string {
  return `homebase:timecard:${timecardId}`;
}

/** Import Homebase time punches into OS Kitchen time entries. */
export async function syncHomebaseTimeClock(
  userId: string,
): Promise<HomebaseTimeClockSyncResult> {
  const creds = await getHomebaseCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "Homebase is not connected. Complete OAuth first." };
  }

  const mappings = creds.settings.staffMappings ?? {};
  const userMap = buildHomebaseUserMap(mappings);
  if (userMap.size === 0) {
    return { ok: false, message: "Map staff to Homebase employee IDs before syncing time clock." };
  }

  const rangeStart = startOfDay(new Date());
  const rangeEnd = addDays(rangeStart, 7);
  const fetched = await fetchHomebaseTimePunches({
    accessToken: creds.accessToken,
    locationId: creds.locationId,
    start: rangeStart,
    end: rangeEnd,
  });
  if (!fetched.ok) return { ok: false, message: fetched.message };

  const alreadySynced = new Set(creds.settings.syncedTimecardIds ?? []);
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  let synced = 0;
  let skipped = 0;

  for (const punch of fetched.punches) {
    if (alreadySynced.has(punch.id)) {
      skipped += 1;
      continue;
    }

    const staffMemberId = userMap.get(punch.userId);
    if (!staffMemberId) {
      skipped += 1;
      continue;
    }

    const clockIn = new Date(punch.clockIn);
    const clockOut = punch.clockOut ? new Date(punch.clockOut) : null;
    const totalHours =
      clockOut && !Number.isNaN(clockOut.getTime())
        ? Math.max(0, (clockOut.getTime() - clockIn.getTime()) / 3_600_000)
        : null;

    const tag = externalHomebaseTimecardNote(punch.id);
    const existing = await prisma.timeEntry.findFirst({
      where: { userId, staffId: staffMemberId, notes: { contains: tag } },
      select: { id: true },
    });

    if (existing) {
      await prisma.timeEntry.update({
        where: { id: existing.id },
        data: {
          clockOut: clockOut ?? undefined,
          totalHours: totalHours ?? undefined,
          status: clockOut ? "CLOCKED_OUT" : "ACTIVE",
        },
      });
    } else {
      await prisma.timeEntry.create({
        data: {
          userId,
          workspaceId: workspaceId ?? undefined,
          staffId: staffMemberId,
          clockIn,
          clockOut: clockOut ?? undefined,
          totalHours: totalHours ?? undefined,
          status: clockOut ? "CLOCKED_OUT" : "ACTIVE",
          notes: tag,
        },
      });
    }

    alreadySynced.add(punch.id);
    synced += 1;

    const shift = await prisma.staffShift.findFirst({
      where: {
        userId,
        staffMemberId,
        shiftDate: { gte: startOfDay(clockIn), lte: addDays(startOfDay(clockIn), 1) },
      },
      select: { id: true },
    });
    if (shift) {
      await prisma.staffShift.update({
        where: { id: shift.id },
        data: {
          checkedInAt: clockIn,
          completedAt: clockOut ?? undefined,
          status: clockOut ? "COMPLETED" : "CHECKED_IN",
        },
      });
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
          syncedTimecardIds: [...alreadySynced],
          lastTimeClockSyncAt: new Date().toISOString(),
          lastTimeClockSynced: synced,
        },
        lastSyncAt: new Date(),
        lastError: null,
      },
    });
  }

  return {
    ok: true,
    message: `Time clock sync complete — ${synced} punch(es) synced (${skipped} skipped).`,
    synced,
    skipped,
  };
}
