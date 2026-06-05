import Link from "next/link";

import { XeroLivePanel } from "@/components/integrations/xero-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getXeroLiveDashboard } from "@/services/integrations/xero/xero-live-service";

export const metadata = {
  title: "Xero LIVE — Integrations",
  description: "OAuth, supplier invoice sync, and bank reconciliation for Xero.",
};

export default async function XeroLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getXeroLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Xero LIVE"
          detail="Set XERO_CLIENT_ID and XERO_CLIENT_SECRET to enable OAuth."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Xero LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, supplier invoice sync, and bank reconciliation.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/xero">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <XeroLivePanel dashboard={dashboard} />
        </CardContent>
      </Card>
    </div>
  );
}
