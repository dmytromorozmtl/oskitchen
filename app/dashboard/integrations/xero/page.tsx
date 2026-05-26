import Link from "next/link";

import { AccountingExportPanel } from "@/components/integrations/accounting-export-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isXeroConfigured } from "@/services/integrations/xero-service";

export const dynamic = "force-dynamic";

export default function XeroIntegrationPage() {
  const configured = isXeroConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Xero</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          {configured ? (
            <p className="text-emerald-600">XERO_CLIENT_ID detected</p>
          ) : (
            <p className="text-muted-foreground">Set XERO_CLIENT_ID for OAuth (CSV export works without)</p>
          )}
          <AccountingExportPanel provider="xero" pnlFormat="csv" />
          <Link href="/dashboard/reports/financial/pnl" className="text-xs text-primary underline">
            Restaurant P&L →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
