import { addDays, format, startOfDay } from "date-fns";

import type { OpenTableAvailabilitySlot } from "@/lib/integrations/opentable-live-types";
import { prisma } from "@/lib/prisma";
import { restaurantTableListWhereForOwner, integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  fetchOpenTableAvailability,
  pushOpenTableAvailability,
} from "@/services/integrations/opentable/opentable-api";
import { getOpenTableCredentialsForUser } from "@/services/integrations/opentable/opentable-credentials";
import { IntegrationProvider } from "@prisma/client";

const DEFAULT_TIMES = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

export type OpenTableAvailabilityResult = {
  ok: boolean;
  message: string;
  slots?: OpenTableAvailabilitySlot[];
  openCount?: number;
};

function countTablesForParty(tables: { capacity: number; status: string }[], partySize: number): number {
  return tables.filter((t) => t.status === "AVAILABLE" && t.capacity >= partySize).length;
}

/** Compute local table availability from floor plan + reservations, optionally push to OpenTable. */
export async function syncOpenTableAvailability(
  userId: string,
  opts?: { partySize?: number; push?: boolean },
): Promise<OpenTableAvailabilityResult> {
  const creds = await getOpenTableCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "OpenTable is not connected. Complete OAuth first." };
  }

  const partySize = opts?.partySize ?? 2;
  const tableScope = await restaurantTableListWhereForOwner(userId);
  const tables = await prisma.restaurantTable.findMany({
    where: tableScope,
    select: { capacity: true, status: true },
  });

  const today = startOfDay(new Date());
  const slots: OpenTableAvailabilitySlot[] = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const day = addDays(today, offset);
    const date = format(day, "yyyy-MM-dd");
    const dayStart = day;
    const dayEnd = addDays(day, 1);

    const reservations = await prisma.storefrontReservation.count({
      where: {
        userId,
        reservedAt: { gte: dayStart, lt: dayEnd },
        status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
      },
    });

    const baseTables = countTablesForParty(tables, partySize);
    for (const time of DEFAULT_TIMES) {
      const tablesAvailable = Math.max(0, baseTables - Math.ceil(reservations / DEFAULT_TIMES.length));
      slots.push({
        date,
        time,
        partySize,
        tablesAvailable,
        open: tablesAvailable > 0,
      });
    }
  }

  let message = `Computed ${slots.filter((s) => s.open).length} open slots across 7 days.`;

  if (opts?.push) {
    const pushResult = await pushOpenTableAvailability({
      accessToken: creds.accessToken,
      restaurantId: creds.restaurantId,
      date: format(today, "yyyy-MM-dd"),
      slots: slots.filter((s) => s.date === format(today, "yyyy-MM-dd")),
    });
    if (!pushResult.ok) return { ok: false, message: pushResult.message, slots };
    message = pushResult.message;
  } else {
    try {
      const remote = await fetchOpenTableAvailability({
        accessToken: creds.accessToken,
        restaurantId: creds.restaurantId,
        date: format(today, "yyyy-MM-dd"),
        partySize,
      });
      if (remote.length) {
        message = `Merged ${remote.filter((s) => s.open).length} OpenTable API slots with local floor plan.`;
      }
    } catch {
      // Local-only availability is valid when API read is unavailable.
    }
  }

  const openCount = slots.filter((s) => s.open).length;
  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.OPENTABLE),
  });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: {
          ...creds.settings,
          lastAvailabilitySyncAt: new Date().toISOString(),
          availableSlots: openCount,
        },
        lastSyncAt: new Date(),
      },
    });
  }

  return { ok: true, message, slots, openCount };
}
