import Link from "next/link";

import { ResySyncPanel } from "@/components/integrations/resy-sync-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { isResySyncConfigured } from "@/services/integrations/resy-sync-service";

export const dynamic = "force-dynamic";

export default async function ResyIntegrationPage() {
  const { userId } = await getTenantActor();
  const configured = isResySyncConfigured();
  const sf = await findAdminStorefront(userId, { id: true });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Resy</h1>
        <BetaBadge />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reservation sync</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {configured ? (
            <p className="text-emerald-600">RESY_API_KEY and RESY_VENUE_ID detected</p>
          ) : (
            <p className="text-muted-foreground">
              Set RESY_API_KEY and RESY_VENUE_ID for venue reservation sync
            </p>
          )}
          {!sf ? (
            <p className="text-amber-600">Create a storefront before syncing reservations.</p>
          ) : null}
          <ResySyncPanel configured={configured} storefrontId={sf?.id ?? null} />
          <Link href="/dashboard/reservations" className="text-xs text-primary underline">
            Reservations calendar →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
