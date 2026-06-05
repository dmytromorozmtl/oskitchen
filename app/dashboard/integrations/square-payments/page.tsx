import Link from "next/link";

import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function SquarePaymentsIntegrationPage() {
  const configured = Boolean(
    process.env.SQUARE_PAYMENTS_CLIENT_ID?.trim() &&
      process.env.SQUARE_PAYMENTS_CLIENT_SECRET?.trim(),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">Square Payments</h1>
          <LiveBadge title="LIVE — OAuth, payment processing, refund sync" />
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/square-payments/live">Open LIVE dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payments connector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {configured ? (
            <p className="text-emerald-600">SQUARE_PAYMENTS_CLIENT_ID detected</p>
          ) : (
            <p className="text-muted-foreground">
              Set SQUARE_PAYMENTS_CLIENT_ID, SQUARE_PAYMENTS_CLIENT_SECRET, and
              SQUARE_PAYMENTS_LOCATION_ID
            </p>
          )}
          <p className="text-muted-foreground">
            Separate from Square POS order import (BETA). Use OAuth for card-present and online
            payments with refund reconciliation.
          </p>
          <Link href="/dashboard/integrations/square" className="text-xs text-primary underline">
            Square order sync (BETA) →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
