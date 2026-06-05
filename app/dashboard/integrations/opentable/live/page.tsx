import Link from "next/link";

import { OpenTableLivePanel } from "@/components/integrations/opentable-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getOpenTableLiveDashboard } from "@/services/integrations/opentable/opentable-live-service";

export const metadata = {
  title: "OpenTable LIVE — Integrations",
  description: "OAuth, reservation webhooks, and table availability for OpenTable.",
};

export default async function OpenTableLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getOpenTableLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="OpenTable LIVE"
          detail="Set OPENTABLE_CLIENT_ID, OPENTABLE_CLIENT_SECRET, and OPENTABLE_WEBHOOK_SECRET."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">OpenTable LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, signed reservation webhooks, and table availability sync.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/opentable">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <OpenTableLivePanel dashboard={dashboard} />
        </CardContent>
      </Card>
    </div>
  );
}
