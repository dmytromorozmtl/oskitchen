import Link from "next/link";

import { AccountingExportPanel } from "@/components/integrations/accounting-export-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isQuickBooksConfigured } from "@/services/integrations/quickbooks-service";

export const dynamic = "force-dynamic";

export default function QuickBooksIntegrationPage() {
  const configured = isQuickBooksConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">QuickBooks</h1>
          <LiveBadge title="LIVE — OAuth, chart of accounts, daily sales journal" />
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/quickbooks/live">Open LIVE dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {configured ? (
            <p className="text-emerald-600">QUICKBOOKS_CLIENT_ID detected — OAuth ready</p>
          ) : (
            <p className="text-muted-foreground">
              Set QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET for OAuth (IIF export works without)
            </p>
          )}
          <AccountingExportPanel provider="quickbooks" pnlFormat="iif" />
          <Link href="/dashboard/reports/financial/pnl" className="text-xs text-primary underline">
            Restaurant P&L →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
