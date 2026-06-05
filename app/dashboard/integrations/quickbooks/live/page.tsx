import Link from "next/link";

import { QuickBooksLivePanel } from "@/components/integrations/quickbooks-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getQuickBooksLiveDashboard } from "@/services/integrations/quickbooks/quickbooks-live-service";

export const metadata = {
  title: "QuickBooks LIVE — Integrations",
  description: "OAuth, chart of accounts, and daily sales journal for QuickBooks Online.",
};

export default async function QuickBooksLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getQuickBooksLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="QuickBooks LIVE"
          detail="Set QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET to enable OAuth."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">QuickBooks LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, chart of accounts mapping, and daily sales journal sync.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/quickbooks">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickBooksLivePanel dashboard={dashboard} />
        </CardContent>
      </Card>
    </div>
  );
}
