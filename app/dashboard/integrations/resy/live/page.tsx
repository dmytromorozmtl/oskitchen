import Link from "next/link";

import { ResyLivePanel } from "@/components/integrations/resy-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getResyLiveDashboard } from "@/services/integrations/resy/resy-live-service";

export const metadata = {
  title: "Resy LIVE — Integrations",
  description: "OAuth, reservation sync, and waitlist for Resy.",
};

export default async function ResyLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getResyLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Resy LIVE"
          detail="Set RESY_CLIENT_ID, RESY_CLIENT_SECRET, and RESY_WEBHOOK_SECRET."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Resy LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, reservation sync, and waitlist management.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/resy">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <ResyLivePanel dashboard={dashboard} />
        </CardContent>
      </Card>
    </div>
  );
}
