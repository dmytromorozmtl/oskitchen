import { notFound } from "next/navigation";

import { PublicReservationWidget } from "@/components/storefront/public-reservation-widget";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";

export default async function StorefrontReservationsPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const user = await getSessionUser();
  const sf = await getStorefrontForPublicFromRequest(storeSlug, user?.id ?? null);
  if (!sf) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reservations</h1>
        <p className="mt-2 text-muted-foreground">
          Reserve a table at {sf.publicName}. Availability updates in real time as bookings come in.
        </p>
      </div>
      <PublicReservationWidget storeSlug={storeSlug} storeName={sf.publicName} />
    </div>
  );
}
