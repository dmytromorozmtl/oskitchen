import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { listDeliveryZonesWithSlots } from "@/services/delivery/delivery-slots-service";

export default async function DeliveryZonesSlotsPage() {
  const { userId } = await requireTenantActor();
  const zones = await listDeliveryZonesWithSlots(userId);

  return (
    <PageShell>
      <h1 className="text-2xl font-semibold tracking-tight">Delivery zones & slots</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Capacity limits per geo-zone and time window for checkout slot picker.
      </p>
      <ul className="mt-6 space-y-4">
        {zones.map((z) => (
          <li key={z.id} className="rounded-xl border p-4 text-sm">
            <p className="font-medium">{z.name}</p>
            <p className="text-muted-foreground">
              Max per slot: {z.maxDeliveriesPerSlot} · Active slots: {z.deliverySlots.length}
            </p>
          </li>
        ))}
        {!zones.length ? <p className="text-muted-foreground">No delivery zones yet.</p> : null}
      </ul>
      <p className="mt-6 text-sm">
        <Link href="/dashboard/settings" className="text-primary underline-offset-4 hover:underline">
          ← Settings
        </Link>
      </p>
    </PageShell>
  );
}
