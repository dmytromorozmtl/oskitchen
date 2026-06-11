import Link from "next/link";

import { OpenTableSyncPanel } from "@/components/integrations/opentable-sync-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { isOpenTableSyncConfigured } from "@/services/integrations/opentable-sync-service";

export const dynamic = "force-dynamic";

export default async function OpenTableIntegrationPage() {
  const { userId } = await getTenantActor();
  const configured = isOpenTableSyncConfigured();
  const sf = await findAdminStorefront(userId, { id: true });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">OpenTable</h1>
          <LiveBadge title="LIVE — OAuth, reservation webhooks, table availability" />
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/opentable/live">Open LIVE dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reservation sync</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {configured ? (
            <p className="text-emerald-600">OPENTABLE_API_KEY and OPENTABLE_RID detected</p>
          ) : (
            <p className="text-muted-foreground">
              Set OPENTABLE_CLIENT_ID, OPENTABLE_CLIENT_SECRET, and OPENTABLE_RID for LIVE OAuth
            </p>
          )}
          {!sf ? (
            <p className="text-amber-600">Create a storefront before syncing reservations.</p>
          ) : null}
          <OpenTableSyncPanel configured={configured} storefrontId={sf?.id ?? null} />
          <Link href="/dashboard/reservations" className="text-xs text-primary underline">
            Reservations calendar →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
