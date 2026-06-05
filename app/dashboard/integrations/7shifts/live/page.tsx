import Link from "next/link";

import { SevenShiftsLivePanel } from "@/components/integrations/seven-shifts-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getSevenShiftsLiveDashboard } from "@/services/integrations/seven-shifts/seven-shifts-live-service";

export const metadata = {
  title: "7shifts LIVE — Integrations",
  description: "OAuth, schedule import/export, and labor cost sync for 7shifts.",
};

export default async function SevenShiftsLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getSevenShiftsLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="7shifts LIVE"
          detail="Set SEVENSHIFTS_CLIENT_ID, SEVENSHIFTS_CLIENT_SECRET, and SEVENSHIFTS_COMPANY_ID."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">7shifts LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, schedule import/export, and labor cost sync.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/7shifts">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <SevenShiftsLivePanel dashboard={dashboard} staffMappings={{}} />
        </CardContent>
      </Card>
    </div>
  );
}
