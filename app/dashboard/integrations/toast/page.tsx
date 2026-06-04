import Link from "next/link";

import { ToastSyncPanel } from "@/components/integrations/toast-sync-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isToastSyncConfigured } from "@/services/integrations/toast-sync-service";

export const dynamic = "force-dynamic";

export default async function ToastIntegrationPage() {
  const configured = isToastSyncConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">Toast</h1>
        <BetaBadge />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">POS order import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {configured ? (
            <p className="text-emerald-600">TOAST_ACCESS_TOKEN and TOAST_RESTAURANT_GUID detected</p>
          ) : (
            <p className="text-muted-foreground">
              Set TOAST_ACCESS_TOKEN and TOAST_RESTAURANT_GUID for order import. Toast partner API
              approval is required for production traffic — OS Kitchen does not claim Toast partnership.
            </p>
          )}
          <ToastSyncPanel configured={configured} />
          <Link href="/dashboard/orders" className="text-xs text-primary underline">
            Order hub →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
