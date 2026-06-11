import Link from "next/link";

import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function MonerisIntegrationPage() {
  const configured = Boolean(
    process.env.MONERIS_CLIENT_ID?.trim() && process.env.MONERIS_CLIENT_SECRET?.trim(),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">Moneris</h1>
          <LiveBadge title="LIVE — OAuth and payment gateway" />
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/moneris/live">Open LIVE dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment gateway</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {configured ? (
            <p className="text-emerald-600">MONERIS_CLIENT_ID detected</p>
          ) : (
            <p className="text-muted-foreground">
              Set MONERIS_CLIENT_ID, MONERIS_CLIENT_SECRET, and MONERIS_STORE_ID
            </p>
          )}
          <p className="text-muted-foreground">
            Canadian card processing via Moneris gateway with OAuth partner connect.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
