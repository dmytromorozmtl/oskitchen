import Link from "next/link";

import { HomebaseLivePanel } from "@/components/integrations/homebase-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getHomebaseLiveDashboard } from "@/services/integrations/homebase/homebase-live-service";

export const metadata = {
  title: "Homebase LIVE — Integrations",
  description: "OAuth, schedule import/export, and time clock sync for Homebase.",
};

export default async function HomebaseLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getHomebaseLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Homebase LIVE"
          detail="Set HOMEBASE_CLIENT_ID, HOMEBASE_CLIENT_SECRET, and HOMEBASE_LOCATION_ID."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Homebase LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, schedule import/export, and time clock sync.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/homebase">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <HomebaseLivePanel dashboard={dashboard} staffMappings={{}} />
        </CardContent>
      </Card>
    </div>
  );
}
