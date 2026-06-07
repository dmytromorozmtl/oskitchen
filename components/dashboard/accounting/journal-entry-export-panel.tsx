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
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_BADGE_ROW_CLASS,
  DESIGN_POLISH_CARD_CLASS,
  DESIGN_POLISH_HERO_BANNER_CLASS,
  DESIGN_POLISH_ROW_SURFACE_CLASS,
  DESIGN_POLISH_STRIPE_OK_CLASS,
} from "@/lib/design/absolute-final-design-polish-tokens";
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
      <div className={DESIGN_POLISH_HERO_BANNER_CLASS} role="note">
        <p className="font-medium text-foreground">Journal entry export · BETA</p>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground/90">
          Export balanced double-entry journals derived from operational P&L with COA mapping
          overlays. Do not claim this is a certified GL — not a certified GL export; accountant review
          before posting to QuickBooks or your ledger.
        </p>
      </div>

      <div className={DESIGN_POLISH_BADGE_ROW_CLASS}>
        <Badge variant="outline" className="rounded-full tabular-nums">
          {summary.entryCount} entries
        </Badge>
        <Badge variant="outline" className="rounded-full tabular-nums">
          {summary.lineCount} lines
        </Badge>
        <Badge variant="secondary" className="rounded-full tabular-nums">
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
            <Card
              key={format}
              className={DESIGN_POLISH_CARD_CLASS}
              data-testid="journal-export-format"
            >
              <CardHeader className="pb-2">
                <Icon className={`h-5 w-5 ${DESIGN_POLISH_STRIPE_OK_CLASS}`} aria-hidden />
                <CardTitle className="text-base">{meta.label}</CardTitle>
                <CardDescription className="text-xs dark:text-muted-foreground/90">
                  {meta.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {canExport ? (
                  <Button asChild size="sm" variant="outline" className="w-full rounded-full">
                    <a href={href} download>
                      <Download
                        className={`mr-1 h-3.5 w-3.5 ${DESIGN_POLISH_STRIPE_OK_CLASS}`}
                        aria-hidden
                      />
                      Download .{meta.extension}
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground/90">
                    Export permission required
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg">Preview — {periodLabel}</CardTitle>
          <CardDescription className="dark:text-muted-foreground/90">
            ${summary.totalDebits.toLocaleString()} debits · $
            {summary.totalCredits.toLocaleString()} credits
          </CardDescription>
        </CardHeader>
        <CardContent
          className={`overflow-x-auto rounded-xl border border-border/70 p-0 dark:border-border/50 ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}
        >
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
                        <span className="font-mono text-muted-foreground dark:text-muted-foreground/90">
                          {line.accountCode}
                        </span>{" "}
                        {line.accountName}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-xs">
                        {line.debit > 0 ? `$${line.debit.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-xs">
                        {line.credit > 0 ? `$${line.credit.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground dark:text-muted-foreground/90">
                        {line.externalAccountName ?? "—"}
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="p-4 text-sm text-muted-foreground dark:text-muted-foreground/90">
              No journal entries for this period — add sales or cost data first.
            </p>
          )}
        </CardContent>
      </Card>

      <div className={`p-3 ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href={CHART_OF_ACCOUNTS_MAPPING_ROUTE}>Edit COA mapping →</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground dark:text-muted-foreground/90">
        Policy: journal-entry-export-absolute-final-v1 · Route: {JOURNAL_ENTRY_EXPORT_ROUTE}
      </p>
      <p className="sr-only">{DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}</p>
    </div>
  );
}
