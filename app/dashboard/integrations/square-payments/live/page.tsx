import Link from "next/link";

import { SquarePaymentsLivePanel } from "@/components/integrations/square-payments-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getSquarePaymentsLiveDashboard } from "@/services/integrations/square-payments/square-payments-live-service";

export const metadata = {
  title: "Square Payments LIVE — Integrations",
  description: "OAuth, payment processing, and refund sync for Square Payments.",
};

export default async function SquarePaymentsLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getSquarePaymentsLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Square Payments LIVE"
          detail="Set SQUARE_PAYMENTS_CLIENT_ID, SQUARE_PAYMENTS_CLIENT_SECRET, and SQUARE_PAYMENTS_LOCATION_ID."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Square Payments LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            OAuth, payment processing, and refund sync.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/square-payments">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <SquarePaymentsLivePanel dashboard={dashboard} />
        </CardContent>
      </Card>
    </div>
  );
}
