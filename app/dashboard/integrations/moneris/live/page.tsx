import Link from "next/link";

import { MonerisLivePanel } from "@/components/integrations/moneris-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getMonerisLiveDashboard } from "@/services/integrations/moneris/moneris-live-service";

export const metadata = {
  title: "Moneris LIVE — Integrations",
  description: "OAuth and payment gateway for Moneris.",
};

export default async function MonerisLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getMonerisLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Moneris LIVE"
          detail="Set MONERIS_CLIENT_ID, MONERIS_CLIENT_SECRET, and MONERIS_STORE_ID."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Moneris LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">OAuth and payment gateway.</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/moneris">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <MonerisLivePanel dashboard={dashboard} />
        </CardContent>
      </Card>
    </div>
  );
}
