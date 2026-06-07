import Link from "next/link";
import { BookOpen, CheckCircle2, FileSpreadsheet, Scale } from "lucide-react";

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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GL_DEPTH_ACCOUNTING_EXPORT_ROUTE } from "@/lib/accounting/gl-depth-accounting-policy";
import type { GlDepthAccountingModel } from "@/services/accounting/gl-depth-accounting-service";

function typeBadge(type: string) {
  const variant =
    type === "asset"
      ? "default"
      : type === "liability"
        ? "secondary"
        : type === "revenue"
          ? "outline"
          : "outline";
  return (
    <Badge variant={variant} className="rounded-full text-[10px] font-normal capitalize">
      {type}
    </Badge>
  );
}

export function GlDepthSyncPanel({
  model,
  canExport,
}: {
  model: GlDepthAccountingModel;
  canExport: boolean;
}) {
  const { summary, chartOfAccounts, journalEntries, pnlReconciliation, period, periodLabel } =
    model;

  return (
    <div className="space-y-6" data-testid="gl-depth-sync-panel">
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="rounded-full">
          {summary.accountCount} GL accounts
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          {summary.journalEntryCount} journal entries
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {summary.syncedLineCount} P&L lines synced
        </Badge>
        {summary.balanced ? (
          <Badge className="rounded-full">
            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden />
            Debits = credits
          </Badge>
        ) : (
          <Badge variant="destructive" className="rounded-full">
            Out of balance
          </Badge>
        )}
        {canExport ? (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={`${GL_DEPTH_ACCOUNTING_EXPORT_ROUTE}?period=${period}`}>
              <FileSpreadsheet className="mr-1 h-3.5 w-3.5" aria-hidden />
              Export journal CSV
            </Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <CardTitle className="text-lg">Chart of accounts</CardTitle>
              <CardDescription>
                Restaurant-standard COA mapped to operational P&L lines — syncs to QuickBooks/Xero
                export formats when integrations are connected.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Normal</TableHead>
                <TableHead>P&L line</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartOfAccounts.map((account) => (
                <TableRow key={account.code} data-testid="gl-coa-row">
                  <TableCell className="font-mono text-xs">{account.code}</TableCell>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>{typeBadge(account.type)}</TableCell>
                  <TableCell className="text-xs capitalize">{account.normalBalance}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {account.pnlLineKey ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-xs text-muted-foreground">
                    {account.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <CardTitle className="text-lg">Journal entries</CardTitle>
              <CardDescription>
                {periodLabel} double-entry postings derived from live operational P&L — not a
                certified GL; export for accountant review or QuickBooks import.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {journalEntries.length ? (
            journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-border/70 p-3"
                data-testid="gl-journal-entry"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{entry.memo}</span>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entry.lines.map((line, idx) => (
                      <TableRow key={`${entry.id}-${idx}`}>
                        <TableCell className="text-xs">
                          <span className="font-mono text-muted-foreground">{line.accountCode}</span>{" "}
                          {line.accountName}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {line.debit > 0 ? `$${line.debit.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {line.credit > 0 ? `$${line.credit.toLocaleString()}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No journal entries for this period — add sales or cost data to generate balanced
              postings.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Totals: ${summary.totalDebits.toLocaleString()} debits · $
            {summary.totalCredits.toLocaleString()} credits
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <CardTitle className="text-lg">P&L reconciliation</CardTitle>
              <CardDescription>
                Compares operational P&L statement amounts to journal-derived GL totals line by
                line.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line</TableHead>
                <TableHead className="text-right">P&L statement</TableHead>
                <TableHead className="text-right">Journal GL</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pnlReconciliation.map((row) => (
                <TableRow key={row.pnlLineKey} data-testid="gl-pnl-reconciliation-row">
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    ${row.statementAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    ${row.journalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${row.variance !== 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
                  >
                    {row.variance >= 0 ? "+" : ""}
                    {row.variance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.status === "synced" ? "secondary" : "destructive"}
                      className="rounded-full text-[10px] font-normal"
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!pnlReconciliation.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No reconcilable P&L lines for this period.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
