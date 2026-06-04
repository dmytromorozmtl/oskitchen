import Link from "next/link";

import { LightspeedSyncPanel } from "@/components/integrations/lightspeed-sync-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isLightspeedSyncConfigured } from "@/services/integrations/lightspeed-sync-service";

export const dynamic = "force-dynamic";

export default async function LightspeedIntegrationPage() {
  const configured = isLightspeedSyncConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Lightspeed</h1>
        <BetaBadge />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">POS order import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {configured ? (
            <p className="text-emerald-600">
              LIGHTSPEED_ACCESS_TOKEN and LIGHTSPEED_BUSINESS_LOCATION_ID detected
            </p>
          ) : (
            <p className="text-muted-foreground">
              Set LIGHTSPEED_ACCESS_TOKEN and LIGHTSPEED_BUSINESS_LOCATION_ID for order import.
              Lightspeed OAuth credentials are required for production multi-location flows.
            </p>
          )}
          <LightspeedSyncPanel configured={configured} />
          <Link href="/dashboard/orders" className="text-xs text-primary underline">
            Order hub →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
