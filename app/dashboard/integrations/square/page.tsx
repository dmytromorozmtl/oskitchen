import Link from "next/link";

import { SquareSyncPanel } from "@/components/integrations/square-sync-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSquareSyncConfigured } from "@/services/integrations/square-sync-service";

export const dynamic = "force-dynamic";

export default async function SquareIntegrationPage() {
  const configured = isSquareSyncConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Square</h1>
        <BetaBadge />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">POS order import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {configured ? (
            <p className="text-emerald-600">SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID detected</p>
          ) : (
            <p className="text-muted-foreground">
              Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID for order import. Square OAuth app
              credentials are required for production multi-tenant flows.
            </p>
          )}
          <SquareSyncPanel configured={configured} />
          <Link href="/dashboard/orders" className="text-xs text-primary underline">
            Order hub →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
