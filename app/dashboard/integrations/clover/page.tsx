import Link from "next/link";

import { CloverSyncPanel } from "@/components/integrations/clover-sync-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isCloverSyncConfigured } from "@/services/integrations/clover-sync-service";

export const dynamic = "force-dynamic";

export default async function CloverIntegrationPage() {
  const configured = isCloverSyncConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Clover</h1>
        <BetaBadge />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">POS order import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {configured ? (
            <p className="text-emerald-600">CLOVER_ACCESS_TOKEN and CLOVER_MERCHANT_ID detected</p>
          ) : (
            <p className="text-muted-foreground">
              Set CLOVER_ACCESS_TOKEN and CLOVER_MERCHANT_ID for order import. OAuth app credentials
              are required for production multi-merchant flows.
            </p>
          )}
          <CloverSyncPanel configured={configured} />
          <Link href="/dashboard/orders" className="text-xs text-primary underline">
            Order hub →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
