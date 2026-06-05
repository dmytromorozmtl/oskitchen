import { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  externalOpenTableNote,
  mapOpenTableStatus,
  parseOpenTableDateTime,
  parseOpenTableReservationRows,
} from "@/services/integrations/opentable-sync-service";
import { parseOpenTableSettings } from "@/services/integrations/opentable/opentable-credentials";

export type OpenTableWebhookResult = {
  ok: boolean;
  message: string;
  imported?: number;
  updated?: number;
  skipped?: number;
};

export function extractOpenTableWebhookTopic(payload: Record<string, unknown>): string {
  const event =
    (typeof payload.event === "string" && payload.event) ||
    (typeof payload.event_type === "string" && payload.event_type) ||
    (typeof payload.type === "string" && payload.type) ||
    "reservation.updated";
  return event;
}

/** Upsert reservations from an OpenTable webhook payload into the storefront calendar. */
export async function processOpenTableReservationWebhook(input: {
  connectionId: string;
  userId: string;
  payload: Record<string, unknown>;
}): Promise<OpenTableWebhookResult> {
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: input.connectionId,
      userId: input.userId,
      provider: IntegrationProvider.OPENTABLE,
    },
  });
  if (!conn) return { ok: false, message: "OpenTable connection not found." };

  const settings = parseOpenTableSettings(conn.settingsJson);
  const storefrontId = settings.storefrontId?.trim();
  if (!storefrontId) {
    return { ok: false, message: "Link a storefront on the OpenTable LIVE dashboard first." };
  }

  const topic = extractOpenTableWebhookTopic(input.payload);
  const reservationPayload =
    input.payload.reservation && typeof input.payload.reservation === "object"
      ? input.payload.reservation
      : input.payload.data && typeof input.payload.data === "object"
        ? input.payload.data
        : input.payload;

  const rows = parseOpenTableReservationRows({ items: [reservationPayload] });
  if (!rows.length) {
    return { ok: false, message: "Webhook payload missing reservation fields." };
  }

  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const tag = externalOpenTableNote(row.id);
    const reservedAt = parseOpenTableDateTime(row.reservedAt);
    const status = mapOpenTableStatus(row.status);

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
      } else {
        skipped += 1;
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
        lastWebhookAt: new Date().toISOString(),
        lastWebhookEvent: topic,
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
    skipped,
  };
}
