import Link from "next/link";

import { KlaviyoLivePanel } from "@/components/integrations/klaviyo-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getKlaviyoLiveDashboard } from "@/services/integrations/klaviyo/klaviyo-live-service";

export const metadata = {
  title: "Klaviyo LIVE — Integrations",
  description: "API key auth, campaign triggers, and segment export for Klaviyo.",
};

export default async function KlaviyoLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getKlaviyoLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Klaviyo LIVE"
          detail="Set KLAVIYO_API_KEY to enable profile sync, campaign triggers, and segment export."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Klaviyo LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            API key auth, campaign triggers, and segment export.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/klaviyo">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <KlaviyoLivePanel dashboard={dashboard} />
        </CardContent>
      </Card>
    </div>
  );
}
