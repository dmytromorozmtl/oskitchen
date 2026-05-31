"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  addStorefrontWaitlistEntry,
  createStorefrontReservation,
  rescheduleStorefrontReservation,
  updateStorefrontReservationStatus,
  updateWaitlistStatus,
  type ReservationStatus,
  type WaitlistStatus,
} from "@/services/storefront/reservation-service";
import { loadOwnerReservationAvailability } from "@/services/storefront/reservation-public-service";

const createSchema = z.object({
  guestName: z.string().min(1).max(255),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestPhone: z.string().max(64).optional(),
  partySize: z.coerce.number().int().min(1).max(50),
  reservedAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().min(30).max(240).optional(),
  tableId: z.string().max(64).optional(),
  notes: z.string().max(2000).optional(),
});

const statusSchema = z.object({
  reservationId: z.string().uuid(),
  status: z.enum(["PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

const rescheduleSchema = z.object({
  reservationId: z.string().uuid(),
  reservedAt: z.string().datetime(),
});

const waitlistSchema = z.object({
  customerName: z.string().min(1).max(255),
  customerPhone: z.string().min(5).max(64),
  partySize: z.coerce.number().int().min(1).max(50),
  quotedMinutes: z.coerce.number().int().min(5).max(180).optional(),
});

const waitlistStatusSchema = z.object({
  entryId: z.string().uuid(),
  status: z.enum(["WAITING", "NOTIFIED", "SEATED", "CANCELLED"]),
});

const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  partySize: z.coerce.number().int().min(1).max(50).default(2),
});

async function requireStorefrontForReservations() {
  const { sf } = await requireAdminStorefrontRow("storefront.settings", {
    id: true,
    userId: true,
    settingsCenterJson: true,
  });
  return sf;
}

export async function getReservationAvailabilityAction(raw: z.infer<typeof availabilitySchema>) {
  try {
    await requireTenantActor();
    const input = availabilitySchema.parse(raw);
    const sf = await requireStorefrontForReservations();
    const availability = await loadOwnerReservationAvailability(
      sf.id,
      sf.settingsCenterJson,
      input.date,
      input.partySize,
    );
    return { ok: true as const, availability };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Failed to load availability.",
    };
  }
}

export async function createReservationAction(raw: z.infer<typeof createSchema>) {
  try {
    await requireTenantActor();
    const input = createSchema.parse(raw);
    const sf = await requireStorefrontForReservations();

    await createStorefrontReservation(sf.userId, sf.id, {
      guestName: input.guestName,
      guestEmail: input.guestEmail || null,
      guestPhone: input.guestPhone ?? null,
      partySize: input.partySize,
      reservedAt: new Date(input.reservedAt),
      durationMinutes: input.durationMinutes,
      tableId: input.tableId ?? null,
      notes: input.notes ?? null,
    });

    revalidatePath("/dashboard/reservations");
    revalidatePath("/dashboard/storefront/reservations");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed to create reservation." };
  }
}

export async function updateReservationStatusAction(raw: z.infer<typeof statusSchema>) {
  try {
    await requireTenantActor();
    const input = statusSchema.parse(raw);
    const sf = await requireStorefrontForReservations();

    await updateStorefrontReservationStatus(
      sf.userId,
      input.reservationId,
      input.status as ReservationStatus,
    );

    revalidatePath("/dashboard/reservations");
    revalidatePath("/dashboard/storefront/reservations");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed to update reservation." };
  }
}

export async function rescheduleReservationAction(raw: z.infer<typeof rescheduleSchema>) {
  try {
    await requireTenantActor();
    const input = rescheduleSchema.parse(raw);
    const sf = await requireStorefrontForReservations();

    await rescheduleStorefrontReservation(sf.userId, input.reservationId, new Date(input.reservedAt));

    revalidatePath("/dashboard/reservations");
    revalidatePath("/dashboard/storefront/reservations");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed to reschedule." };
  }
}

export async function addWaitlistEntryAction(raw: z.infer<typeof waitlistSchema>) {
  try {
    await requireTenantActor();
    const input = waitlistSchema.parse(raw);
    const sf = await requireStorefrontForReservations();

    await addStorefrontWaitlistEntry(sf.userId, sf.id, input);

    revalidatePath("/dashboard/reservations");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed to add waitlist entry." };
  }
}

export async function updateWaitlistStatusAction(raw: z.infer<typeof waitlistStatusSchema>) {
  try {
    await requireTenantActor();
    const input = waitlistStatusSchema.parse(raw);
    const sf = await requireStorefrontForReservations();

    await updateWaitlistStatus(sf.userId, input.entryId, input.status as WaitlistStatus);

    revalidatePath("/dashboard/reservations");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Failed to update waitlist." };
  }
}
