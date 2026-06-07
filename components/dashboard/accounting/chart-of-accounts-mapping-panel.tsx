import Link from "next/link";
import { BookMarked, Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CHART_OF_ACCOUNTS_MAPPING_ROUTE,
  type CoaMappingModel,
} from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import { GL_DEPTH_ACCOUNTING_ROUTE } from "@/lib/accounting/gl-depth-accounting-policy";

import { ChartOfAccountsMappingRowForm } from "./chart-of-accounts-mapping-row-form";

export function ChartOfAccountsMappingPanel({ model }: { model: CoaMappingModel }) {
  const { mappings, summary, quickBooksConnected, quickBooksAccounts } = model;

  return (
    <div className="space-y-6" data-testid="chart-of-accounts-mapping-panel">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-semibold">Chart of accounts mapping · BETA</p>
        <p className="mt-1 text-muted-foreground">
          Maps operational P&L lines to internal GL codes and optional QuickBooks accounts for
          journal export. Do not claim this is a certified GL — not a certified GL export layer;
          accountant review before posting.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="rounded-full">
          {summary.mappedCount}/{summary.totalLines} lines mapped
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          {summary.coveragePercent}% coverage
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {summary.quickBooksLinkedCount} QuickBooks linked
        </Badge>
        {quickBooksConnected ? (
          <Badge className="rounded-full">QuickBooks connected</Badge>
        ) : (
          <Badge variant="outline" className="rounded-full">
            QuickBooks not connected
          </Badge>
        )}
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <CardTitle className="text-lg">P&L line → GL account mapping</CardTitle>
              <CardDescription>
                Restaurant-standard COA template with per-line overrides — feeds GL-depth journal
                entries and QuickBooks daily sales journal when linked.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border/70 p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>P&L line</TableHead>
                <TableHead>Key</TableHead>
                <TableHead colSpan={3}>Mapping</TableHead>
                <TableHead>External</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((row) => (
                <ChartOfAccountsMappingRowForm
                  key={row.pnlLineKey}
                  row={row}
                  quickBooksConnected={quickBooksConnected}
                  quickBooksAccounts={quickBooksAccounts}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={GL_DEPTH_ACCOUNTING_ROUTE}>
            <Link2 className="mr-1 h-3.5 w-3.5" aria-hidden />
            Open GL-depth sync
          </Link>
        </Button>
        {!quickBooksConnected ? (
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/integrations/quickbooks/live">Connect QuickBooks →</Link>
          </Button>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Policy: chart-of-accounts-mapping-absolute-final-v1 · Route: {CHART_OF_ACCOUNTS_MAPPING_ROUTE}
      </p>
    </div>
  );
}
