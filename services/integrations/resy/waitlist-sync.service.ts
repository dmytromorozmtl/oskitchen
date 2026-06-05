import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { createResyWaitlistEntry, fetchResyWaitlist } from "@/services/integrations/resy/resy-api";
import { getResyCredentialsForUser } from "@/services/integrations/resy/resy-credentials";

export type ResyWaitlistSyncResult = {
  ok: boolean;
  message: string;
  imported?: number;
  exported?: number;
};

export function externalResyWaitlistNote(waitlistId: string): string {
  return `resy:wait:${waitlistId}`;
}

/** Two-way waitlist sync between Resy and OS Kitchen storefront waitlist. */
export async function syncResyWaitlist(userId: string): Promise<ResyWaitlistSyncResult> {
  const creds = await getResyCredentialsForUser(userId);
  if (!creds) {
    return { ok: false, message: "Resy is not connected. Complete OAuth first." };
  }

  const storefrontId = creds.settings.storefrontId?.trim();
  if (!storefrontId) {
    return { ok: false, message: "Link a storefront on the Resy LIVE dashboard first." };
  }

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const alreadySynced = new Set(creds.settings.syncedWaitlistIds ?? []);
  let imported = 0;
  let exported = 0;

  const remoteRows = await fetchResyWaitlist({
    accessToken: creds.accessToken,
    venueId: creds.venueId,
  });

  for (const row of remoteRows) {
    if (alreadySynced.has(row.id) || row.status.toUpperCase() !== "WAITING") continue;
    const tag = externalResyWaitlistNote(row.id);
    const existing = await prisma.storefrontWaitlistEntry.findFirst({
      where: { storefrontId, customerPhone: row.customerPhone, status: "WAITING" },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.storefrontWaitlistEntry.create({
      data: {
        userId,
        workspaceId: workspaceId ?? undefined,
        storefrontId,
        customerName: row.customerName,
        customerPhone: row.customerPhone || "unknown",
        partySize: row.partySize,
        quotedMinutes: row.quotedMinutes,
        status: "WAITING",
      },
    });
    alreadySynced.add(row.id);
    imported += 1;
  }

  const localWaiting = await prisma.storefrontWaitlistEntry.findMany({
    where: { userId, storefrontId, status: "WAITING" },
    take: 50,
    orderBy: { createdAt: "asc" },
  });

  for (const entry of localWaiting) {
    const phoneTag = entry.customerPhone.trim();
    const hasRemote = remoteRows.some((r) => r.customerPhone === phoneTag);
    if (hasRemote) continue;

    const result = await createResyWaitlistEntry({
      accessToken: creds.accessToken,
      venueId: creds.venueId,
      customerName: entry.customerName,
      customerPhone: entry.customerPhone,
      partySize: entry.partySize,
    });
    if (result.ok && result.waitlistId) {
      alreadySynced.add(result.waitlistId);
      exported += 1;
    }
  }

  const conn = await prisma.integrationConnection.findFirst({
    where: { userId, provider: IntegrationProvider.RESY },
  });
  if (conn) {
    await prisma.integrationConnection.update({
      where: { id: conn.id },
      data: {
        settingsJson: {
          ...creds.settings,
          syncedWaitlistIds: [...alreadySynced],
          lastWaitlistSyncAt: new Date().toISOString(),
          lastWaitlistSynced: imported + exported,
        },
        lastSyncAt: new Date(),
        lastError: null,
      },
    });
  }

  return {
    ok: true,
    message: `Waitlist sync complete — ${imported} imported, ${exported} exported.`,
    imported,
    exported,
  };
}
