import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { importReservationsFromResy } from "@/services/integrations/resy-sync-service";
import { getResyCredentialsForUser } from "@/services/integrations/resy/resy-credentials";

export type ResyReservationSyncResult = {
  ok: boolean;
  message: string;
  imported?: number;
  updated?: number;
  skipped?: number;
};

/** Pull Resy reservations into the linked storefront calendar. */
export async function syncResyReservations(userId: string): Promise<ResyReservationSyncResult> {
  const creds = await getResyCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "Resy is not connected. Complete OAuth first." };
  }

  const storefrontId = creds.settings.storefrontId?.trim();
  if (!storefrontId) {
    return { ok: false, message: "Link a storefront on the Resy LIVE dashboard first." };
  }

  const result = await importReservationsFromResy(userId, storefrontId);
  if (!result.ok) return { ok: false, message: result.message };

  const conn = await prisma.integrationConnection.findFirst({
    where: await integrationConnectionByProviderWhereForOwner(userId, IntegrationProvider.RESY),
  });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: {
          ...creds.settings,
          lastReservationSyncAt: new Date().toISOString(),
          lastReservationsSynced: result.imported + result.updated,
        },
        lastSyncAt: new Date(),
        lastError: null,
      },
    });
  }

  return {
    ok: true,
    message: result.message,
    imported: result.imported,
    updated: result.updated,
    skipped: result.skipped,
  };
}
