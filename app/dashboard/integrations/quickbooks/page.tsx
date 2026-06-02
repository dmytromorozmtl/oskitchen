import Link from "next/link";

import { AccountingExportPanel } from "@/components/integrations/accounting-export-panel";
import { BetaBadge } from "@/components/integrations/beta-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isQuickBooksConfigured } from "@/services/integrations/quickbooks-service";

export const dynamic = "force-dynamic";

export default function QuickBooksIntegrationPage() {
  const configured = isQuickBooksConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">QuickBooks</h1>
        <BetaBadge />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {configured ? (
            <p className="text-emerald-600">QUICKBOOKS_CLIENT_ID detected</p>
          ) : (
            <p className="text-muted-foreground">Set QUICKBOOKS_CLIENT_ID for OAuth (export works without)</p>
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
