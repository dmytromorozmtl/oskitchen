import { prisma } from "@/lib/prisma";

export type ReservationStatus = "PENDING" | "CONFIRMED" | "SEATED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type WaitlistStatus = "WAITING" | "NOTIFIED" | "SEATED" | "CANCELLED";

const DEFAULT_DURATION_MIN = 90;

export async function getStorefrontReservationsForOwner(ownerUserId: string, storefrontId: string) {
  return prisma.storefrontReservation.findMany({
    where: { storefrontId, userId: ownerUserId },
    orderBy: { reservedAt: "asc" },
    take: 200,
  });
}

export async function getStorefrontWaitlistForOwner(ownerUserId: string, storefrontId: string) {
  return prisma.storefrontWaitlistEntry.findMany({
    where: { storefrontId, userId: ownerUserId, status: { in: ["WAITING", "NOTIFIED"] } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
}

export type CreateReservationInput = {
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  partySize: number;
  reservedAt: Date;
  durationMinutes?: number;
  tableId?: string | null;
  notes?: string | null;
};

export async function detectReservationConflict(
  storefrontId: string,
  reservedAt: Date,
  durationMinutes: number,
  excludeId?: string,
): Promise<boolean> {
  const windowStart = new Date(reservedAt.getTime() - durationMinutes * 60_000);
  const windowEnd = new Date(reservedAt.getTime() + durationMinutes * 60_000);

  const overlap = await prisma.storefrontReservation.count({
    where: {
      storefrontId,
      status: { notIn: ["CANCELLED", "NO_SHOW", "COMPLETED"] },
      id: excludeId ? { not: excludeId } : undefined,
      reservedAt: { gte: windowStart, lte: windowEnd },
    },
  });
  return overlap > 0;
}

export async function createStorefrontReservation(
  ownerUserId: string,
  storefrontId: string,
  input: CreateReservationInput,
) {
  const duration = input.durationMinutes ?? DEFAULT_DURATION_MIN;
  const conflict = await detectReservationConflict(storefrontId, input.reservedAt, duration);
  if (conflict) {
    throw new Error("This time slot overlaps an existing reservation.");
  }

  const reservation = await prisma.storefrontReservation.create({
    data: {
      userId: ownerUserId,
      storefrontId,
      guestName: input.guestName.trim(),
      guestEmail: input.guestEmail?.trim() || null,
      guestPhone: input.guestPhone?.trim() || null,
      partySize: input.partySize,
      reservedAt: input.reservedAt,
      durationMinutes: duration,
      tableId: input.tableId ?? null,
      notes: input.notes?.trim() || null,
      status: "PENDING",
    },
  });

  const { emitReservationCreatedOutboundWebhook } = await import(
    "@/services/webhooks/outbound-webhook-emitters"
  );
  await emitReservationCreatedOutboundWebhook({
    ownerUserId,
    reservationId: reservation.id,
    storefrontId,
    partySize: reservation.partySize,
    reservedAt: reservation.reservedAt,
    status: reservation.status,
  }).catch(() => undefined);

  return reservation;
}

export async function updateStorefrontReservationStatus(
  ownerUserId: string,
  reservationId: string,
  status: ReservationStatus,
) {
  const row = await prisma.storefrontReservation.findFirst({
    where: { id: reservationId, userId: ownerUserId },
  });
  if (!row) throw new Error("Reservation not found.");

  return prisma.storefrontReservation.update({
    where: { id: reservationId },
    data: { status },
  });
}

export async function rescheduleStorefrontReservation(
  ownerUserId: string,
  reservationId: string,
  reservedAt: Date,
) {
  const row = await prisma.storefrontReservation.findFirst({
    where: { id: reservationId, userId: ownerUserId },
  });
  if (!row) throw new Error("Reservation not found.");

  const duration = row.durationMinutes ?? DEFAULT_DURATION_MIN;
  const conflict = await detectReservationConflict(row.storefrontId, reservedAt, duration, reservationId);
  if (conflict) {
    throw new Error("This time slot overlaps an existing reservation.");
  }

  return prisma.storefrontReservation.update({
    where: { id: reservationId },
    data: { reservedAt },
  });
}

export async function addStorefrontWaitlistEntry(
  ownerUserId: string,
  storefrontId: string,
  input: { customerName: string; customerPhone: string; partySize: number; quotedMinutes?: number },
) {
  return prisma.storefrontWaitlistEntry.create({
    data: {
      userId: ownerUserId,
      storefrontId,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      partySize: input.partySize,
      quotedMinutes: input.quotedMinutes ?? 20,
      status: "WAITING",
    },
  });
}

export async function updateWaitlistStatus(
  ownerUserId: string,
  entryId: string,
  status: WaitlistStatus,
) {
  const row = await prisma.storefrontWaitlistEntry.findFirst({
    where: { id: entryId, userId: ownerUserId },
  });
  if (!row) throw new Error("Waitlist entry not found.");

  const updated = await prisma.storefrontWaitlistEntry.update({
    where: { id: entryId },
    data: { status },
  });

  if (status === "SEATED") {
    const { emitWaitlistSeatedOutboundWebhook } = await import(
      "@/services/webhooks/outbound-webhook-emitters"
    );
    await emitWaitlistSeatedOutboundWebhook({
      ownerUserId,
      entryId: updated.id,
      storefrontId: updated.storefrontId,
      partySize: updated.partySize,
    }).catch(() => undefined);
  }

  return updated;
}
