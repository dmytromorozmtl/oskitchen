import Link from "next/link";
import { CheckCircle2, Download, FileJson, FileSpreadsheet } from "lucide-react";

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
import {
  JOURNAL_ENTRY_EXPORT_CSV_ROUTE,
  JOURNAL_ENTRY_EXPORT_JSON_ROUTE,
  JOURNAL_ENTRY_EXPORT_ROUTE,
  type JournalEntryExportModel,
} from "@/lib/accounting/journal-entry-export-absolute-final-policy";
import { JOURNAL_ENTRY_EXPORT_FORMAT_META } from "@/lib/accounting/journal-entry-export-content";
import { CHART_OF_ACCOUNTS_MAPPING_ROUTE } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";

function exportHref(
  base: string,
  period: string,
  format: "csv" | "json" | "quickbooks_csv",
): string {
  if (format === "json" && base === JOURNAL_ENTRY_EXPORT_JSON_ROUTE) {
    return `${base}?period=${period}`;
  }
  return `${JOURNAL_ENTRY_EXPORT_CSV_ROUTE}?period=${period}&format=${format}`;
}

export function JournalEntryExportPanel({ model }: { model: JournalEntryExportModel }) {
  const { entries, summary, period, periodLabel, canExport } = model;

  return (
    <div className="space-y-6" data-testid="journal-entry-export-panel">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-semibold">Journal entry export · BETA</p>
        <p className="mt-1 text-muted-foreground">
          Export balanced double-entry journals derived from operational P&L with COA mapping
          overlays. Do not claim this is a certified GL — not a certified GL export; accountant review
          before posting to QuickBooks or your ledger.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="rounded-full">
          {summary.entryCount} entries
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {summary.lineCount} lines
        </Badge>
        <Badge variant="secondary" className="rounded-full">
          {summary.mappedLineCount} QuickBooks mapped
        </Badge>
        {summary.balanced ? (
          <Badge className="rounded-full">
            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden />
            Balanced
          </Badge>
        ) : (
          <Badge variant="destructive" className="rounded-full">
            Out of balance
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(["csv", "json", "quickbooks_csv"] as const).map((format) => {
          const meta = JOURNAL_ENTRY_EXPORT_FORMAT_META[format];
          const Icon = format === "json" ? FileJson : FileSpreadsheet;
          const href =
            format === "json"
              ? exportHref(JOURNAL_ENTRY_EXPORT_JSON_ROUTE, period, format)
              : exportHref(JOURNAL_ENTRY_EXPORT_CSV_ROUTE, period, format);

          return (
            <Card key={format} className="border-border/70 shadow-sm" data-testid="journal-export-format">
              <CardHeader className="pb-2">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <CardTitle className="text-base">{meta.label}</CardTitle>
                <CardDescription className="text-xs">{meta.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {canExport ? (
                  <Button asChild size="sm" variant="outline" className="w-full rounded-full">
                    <a href={href} download>
                      <Download className="mr-1 h-3.5 w-3.5" aria-hidden />
                      Download .{meta.extension}
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">Export permission required</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Preview — {periodLabel}</CardTitle>
          <CardDescription>
            ${summary.totalDebits.toLocaleString()} debits · $
            {summary.totalCredits.toLocaleString()} credits
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border/70 p-0">
          {entries.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Memo</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>QuickBooks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.flatMap((entry) =>
                  entry.lines.map((line, idx) => (
                    <TableRow key={`${entry.id}-${idx}`} data-testid="journal-export-preview-row">
                      <TableCell className="text-xs">{idx === 0 ? entry.date : ""}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs">
                        {idx === 0 ? entry.memo : ""}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-mono text-muted-foreground">{line.accountCode}</span>{" "}
                        {line.accountName}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-xs">
                        {line.debit > 0 ? `$${line.debit.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-xs">
                        {line.credit > 0 ? `$${line.credit.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {line.externalAccountName ?? "—"}
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              No journal entries for this period — add sales or cost data first.
            </p>
          )}
        </CardContent>
      </Card>

      <Button asChild variant="ghost" size="sm" className="rounded-full">
        <Link href={CHART_OF_ACCOUNTS_MAPPING_ROUTE}>Edit COA mapping →</Link>
      </Button>

      <p className="text-xs text-muted-foreground">
        Policy: journal-entry-export-absolute-final-v1 · Route: {JOURNAL_ENTRY_EXPORT_ROUTE}
      </p>
    </div>
  );
}
