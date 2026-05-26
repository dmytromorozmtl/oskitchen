import Link from "next/link";

import { ReservationsCalendarClient } from "@/components/storefront/reservations-calendar-client";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import {
  getStorefrontReservationsForOwner,
  getStorefrontWaitlistForOwner,
} from "@/services/storefront/reservation-service";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const { sessionUser: user } = await getTenantActor();
  const sf = await findAdminStorefront(user.id, { id: true, userId: true });

  if (!sf) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Reservations</h1>
        <p className="text-sm text-muted-foreground">Table bookings, waitlist, and conflict detection.</p>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/storefront">Set up storefront</Link>
        </Button>
      </div>
    );
  }

  const [reservations, waitlist] = await Promise.all([
    getStorefrontReservationsForOwner(sf.userId, sf.id),
    getStorefrontWaitlistForOwner(sf.userId, sf.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reservations</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Calendar, waitlist, drag-reschedule, and overlap detection for your dining room.
        </p>
      </div>
      <ReservationsCalendarClient
        reservations={reservations.map((r) => ({
          id: r.id,
          guestName: r.guestName,
          guestEmail: r.guestEmail,
          partySize: r.partySize,
          reservedAt: r.reservedAt.toISOString(),
          durationMinutes: r.durationMinutes,
          status: r.status,
          notes: r.notes,
        }))}
        waitlist={waitlist.map((w) => ({
          id: w.id,
          customerName: w.customerName,
          customerPhone: w.customerPhone,
          partySize: w.partySize,
          quotedMinutes: w.quotedMinutes,
          status: w.status,
          createdAt: w.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
