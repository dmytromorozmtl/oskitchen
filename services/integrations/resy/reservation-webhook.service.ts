import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  externalResyNote,
  mapResyStatus,
  parseResyDateTime,
  parseResyReservationRows,
} from "@/services/integrations/resy-sync-service";
import { parseResySettings } from "@/services/integrations/resy/resy-credentials";

export type ResyWebhookResult = {
  ok: boolean;
  message: string;
  imported?: number;
  updated?: number;
};

export function extractResyWebhookTopic(payload: Record<string, unknown>): string {
  return (
    (typeof payload.event === "string" && payload.event) ||
    (typeof payload.event_type === "string" && payload.event_type) ||
    (typeof payload.type === "string" && payload.type) ||
    "reservation.updated"
  );
}

export async function processResyReservationWebhook(input: {
  connectionId: string;
  userId: string;
  payload: Record<string, unknown>;
}): Promise<ResyWebhookResult> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.RESY,
    },
  });
  if (!conn) return { ok: false, message: "Resy connection not found." };

  const settings = parseResySettings(conn.settingsJson);
  const storefrontId = settings.storefrontId?.trim();
  if (!storefrontId) {
    return { ok: false, message: "Link a storefront on the Resy LIVE dashboard first." };
  }

  const topic = extractResyWebhookTopic(input.payload);
  const reservationPayload =
    input.payload.reservation && typeof input.payload.reservation === "object"
      ? input.payload.reservation
      : input.payload.data && typeof input.payload.data === "object"
        ? input.payload.data
        : input.payload;

  const rows = parseResyReservationRows({ data: [reservationPayload] });
  if (!rows.length) {
    return { ok: false, message: "Webhook payload missing reservation fields." };
  }

  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  let imported = 0;
  let updated = 0;

  for (const row of rows) {
    const tag = externalResyNote(row.id);
    const reservedAt = parseResyDateTime(row.reservedAt);
    const status = mapResyStatus(row.status);

    if (topic.includes("cancel") || status === "CANCELLED" || status === "NO_SHOW") {
      const existing = await prisma.storefrontReservation.findFirst({
        where: { storefrontId, notes: { contains: tag } },
        select: { id: true },
      });
      if (existing) {
        await prisma.storefrontReservation.update({
          where: { id: existing.id },
          data: { status: status === "NO_SHOW" ? "NO_SHOW" : "CANCELLED" },
        });
        updated += 1;
      }
      continue;
    }

    const existing = await prisma.storefrontReservation.findFirst({
      where: { storefrontId, notes: { contains: tag } },
      select: { id: true },
    });

    const data = {
      guestName: row.guestName,
      guestEmail: row.guestEmail ?? null,
      guestPhone: row.guestPhone ?? null,
      partySize: row.partySize,
      reservedAt,
      status,
      notes: row.notes ? `${tag} — ${row.notes}` : tag,
    };

    if (existing) {
      await prisma.storefrontReservation.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.storefrontReservation.create({
        data: {
          userId: input.userId,
          workspaceId: workspaceId ?? undefined,
          storefrontId,
          ...data,
        },
      });
      imported += 1;
    }
  }

  await prisma.integrationConnection.update({
    where: { id: conn.id },
    data: {
      settingsJson: {
        ...settings,
        lastReservationSyncAt: new Date().toISOString(),
      },
      lastSyncAt: new Date(),
      lastError: null,
    },
  });

  return {
    ok: true,
    message: `Webhook processed — ${imported} imported, ${updated} updated (${topic}).`,
    imported,
    updated,
  };
}
