import { notFound } from "next/navigation";

import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { getPublicDeliveryTracking } from "@/services/delivery/gps-tracking-service";

export default async function StorefrontTrackOrderPage({
  params,
}: {
  params: Promise<{ storeSlug: string; orderId: string }>;
}) {
  const { storeSlug, orderId } = await params;
  const sf = await getStorefrontForPublicFromRequest(storeSlug, null);
  if (!sf) notFound();

  const tracking = await getPublicDeliveryTracking({
    storeSlug,
    orderPublicToken: orderId,
  });

  if (!tracking.ok) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12">
        <h1 className="text-2xl font-semibold">Delivery tracking</h1>
        <p className="text-muted-foreground">{tracking.error}</p>
      </div>
    );
  }

  const last = tracking.last;

  return (
    <div className="mx-auto max-w-lg space-y-6 py-12">
      <h1 className="text-2xl font-semibold">Delivery tracking</h1>
      <p className="text-sm text-muted-foreground">
        Order status: <span className="font-medium text-foreground">{tracking.status}</span>
      </p>
      {tracking.trackingUrl ? (
        <p>
          <a
            href={tracking.trackingUrl}
            className="text-primary underline-offset-4 hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Open carrier tracking
          </a>
        </p>
      ) : null}
      {last ? (
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-sm">
          <p className="font-medium">Last driver location</p>
          <p className="mt-2 text-muted-foreground">
            {last.lat.toFixed(5)}, {last.lng.toFixed(5)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Updated {new Date(last.recordedAt).toLocaleString()}
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground">GPS location not available yet.</p>
      )}
    </div>
  );
}
