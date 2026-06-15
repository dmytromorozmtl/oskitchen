import { NextResponse } from "next/server";
import { z } from "zod";

import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import {
  createPublicStorefrontReservation,
  loadPublicReservationAvailability,
} from "@/services/storefront/reservation-public-service";

const availabilityQuery = z.object({
  storeSlug: z.string().min(1).max(128),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  partySize: z.coerce.number().int().min(1).max(50).default(2),
});

const createBody = z.object({
  storeSlug: z.string().min(1).max(128),
  guestName: z.string().min(1).max(255),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestPhone: z.string().max(64).optional(),
  partySize: z.coerce.number().int().min(1).max(50),
  reservedAt: z.string().datetime(),
  notes: z.string().max(2000).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = availabilityQuery.safeParse({
    storeSlug: url.searchParams.get("storeSlug"),
    date: url.searchParams.get("date"),
    partySize: url.searchParams.get("partySize") ?? "2",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const { storeSlug, date, partySize } = parsed.data;
  const rate = await enforceStorefrontRateLimitFromRequest(request, "storefront_cart_sync", storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const availability = await loadPublicReservationAvailability(storeSlug, date, partySize);
  if (!availability) {
    return NextResponse.json({ error: "Storefront not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true as const, ...availability });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reservation payload." }, { status: 400 });
  }

  const { storeSlug, guestName, guestEmail, guestPhone, partySize, reservedAt, notes } = parsed.data;
  const rate = await enforceStorefrontRateLimitFromRequest(request, "storefront_contact_submit", storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  try {
    const reservation = await createPublicStorefrontReservation(storeSlug, {
      guestName,
      guestEmail: guestEmail || null,
      guestPhone: guestPhone ?? null,
      partySize,
      reservedAt: new Date(reservedAt),
      notes: notes ?? null,
    });

    return NextResponse.json({
      ok: true as const,
      reservationId: reservation.id,
      status: reservation.status,
      reservedAt: reservation.reservedAt.toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create reservation.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
