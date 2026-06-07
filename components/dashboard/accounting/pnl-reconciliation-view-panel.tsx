import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, Scale } from "lucide-react";

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
  PNL_RECONCILIATION_VIEW_EXPORT_ROUTE,
  PNL_RECONCILIATION_VIEW_ROUTE,
  type PnlReconciliationSeverity,
  type PnlReconciliationViewModel,
} from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";
import { PNL_RECONCILIATION_SEVERITY_META } from "@/lib/accounting/pnl-reconciliation-view-content";
import { GL_DEPTH_ACCOUNTING_ROUTE } from "@/lib/accounting/gl-depth-accounting-policy";
import { JOURNAL_ENTRY_EXPORT_ROUTE } from "@/lib/accounting/journal-entry-export-absolute-final-policy";

function severityBadge(severity: PnlReconciliationSeverity) {
  if (severity === "synced") {
    return (
      <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
        synced
      </Badge>
    );
  }
  if (severity === "material") {
    return (
      <Badge variant="destructive" className="rounded-full text-[10px] font-normal">
        material
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full text-[10px] font-normal text-amber-700 dark:text-amber-400">
      minor
    </Badge>
  );
}

export function PnlReconciliationViewPanel({ model }: { model: PnlReconciliationViewModel }) {
  const { rows, summary, period, periodLabel, canExport } = model;

  return (
    <div className="space-y-6" data-testid="pnl-reconciliation-view-panel">
      <div className={DESIGN_POLISH_HERO_BANNER_CLASS} role="note">
        <p className="font-medium text-foreground">P&L reconciliation view · BETA</p>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground/90">
          Line-by-line comparison of operational P&L statement amounts vs journal-derived GL totals.
          not a certified GL — accountant review before period close. Do not claim audit-grade
          reconciliation.
        </p>
      </div>

      <div className={DESIGN_POLISH_BADGE_ROW_CLASS}>
        <Badge variant="outline" className="rounded-full tabular-nums">
          {summary.reconciliationPercent}% reconciled
        </Badge>
        <Badge variant="secondary" className="rounded-full tabular-nums">
          {summary.syncedCount}/{summary.totalLines} synced
        </Badge>
        <Badge variant="destructive" className="rounded-full tabular-nums">
          {summary.materialVarianceCount} material
        </Badge>
        <Badge variant="outline" className="rounded-full tabular-nums">
          {summary.minorVarianceCount} minor
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className={DESIGN_POLISH_CARD_CLASS}>
          <CardHeader className="pb-2">
            <CardDescription>Reconciliation</CardDescription>
            <CardTitle className="text-3xl">{summary.reconciliationPercent}%</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground dark:text-muted-foreground/90">
            {summary.syncedCount}/{summary.totalLines} lines synced
          </CardContent>
        </Card>
        <Card className={DESIGN_POLISH_CARD_CLASS}>
          <CardHeader className="pb-2">
            <CardDescription>Material variances</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl text-destructive">
              {summary.materialVarianceCount}
              {summary.materialVarianceCount > 0 ? (
                <AlertTriangle className="h-5 w-5" aria-hidden />
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground dark:text-muted-foreground/90">
            {summary.minorVarianceCount} minor · ≥5% threshold
          </CardContent>
        </Card>
        <Card className={DESIGN_POLISH_CARD_CLASS}>
          <CardHeader className="pb-2">
            <CardDescription>Net variance</CardDescription>
            <CardTitle
              className={`text-3xl ${summary.netVariance !== 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
            >
              {summary.netVariance >= 0 ? "+" : ""}${summary.netVariance.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground dark:text-muted-foreground/90">
            Statement ${summary.totalStatementAmount.toLocaleString()} vs journal $
            {summary.totalJournalAmount.toLocaleString()}
          </CardContent>
        </Card>
        <Card className={DESIGN_POLISH_CARD_CLASS}>
          <CardHeader className="pb-2">
            <CardDescription>Balance check</CardDescription>
            <CardTitle className="flex items-center gap-2 text-lg">
              {summary.balanced ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  Totals aligned
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
                  Review needed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground dark:text-muted-foreground/90">
            {periodLabel} period
          </CardContent>
        </Card>
      </div>

      <div className={`flex flex-wrap gap-2 ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}>
        {(["synced", "minor", "material"] as const).map((severity) => (
          <Badge key={severity} variant="outline" className="rounded-full font-normal">
            {PNL_RECONCILIATION_SEVERITY_META[severity].label}:{" "}
            {PNL_RECONCILIATION_SEVERITY_META[severity].description}
          </Badge>
        ))}
      </div>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale className={`h-5 w-5 ${DESIGN_POLISH_STRIPE_OK_CLASS}`} aria-hidden />
              <div>
                <CardTitle className="text-lg">Line-by-line reconciliation</CardTitle>
                <CardDescription className="dark:text-muted-foreground/90">
                  operational P&L vs journal GL — GL account codes from restaurant COA template
                </CardDescription>
              </div>
            </div>
            {canExport ? (
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <a href={`${PNL_RECONCILIATION_VIEW_EXPORT_ROUTE}?period=${period}`} download>
                  <Download
                    className={`mr-1 h-3.5 w-3.5 ${DESIGN_POLISH_STRIPE_OK_CLASS}`}
                    aria-hidden
                  />
                  Export CSV
                </a>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent
          className={`overflow-x-auto rounded-xl border border-border/70 p-0 dark:border-border/50 ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>P&L line</TableHead>
                <TableHead>GL code</TableHead>
                <TableHead className="text-right">Statement</TableHead>
                <TableHead className="text-right">Journal GL</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">Var %</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.pnlLineKey} data-testid="pnl-reconciliation-view-row">
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground dark:text-muted-foreground/90">
                    {row.glAccountCode ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    ${row.statementAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    ${row.journalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${row.variance !== 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
                  >
                    {row.variance >= 0 ? "+" : ""}
                    {row.variance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-muted-foreground dark:text-muted-foreground/90">
                    {row.variancePercent.toFixed(1)}%
                  </TableCell>
                  <TableCell>{severityBadge(row.severity)}</TableCell>
                </TableRow>
              ))}
              {!rows.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-muted-foreground dark:text-muted-foreground/90">
                    No reconcilable P&L lines for this period.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className={`flex flex-wrap gap-3 p-3 ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={GL_DEPTH_ACCOUNTING_ROUTE}>GL-depth sync →</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href={JOURNAL_ENTRY_EXPORT_ROUTE}>Journal export →</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground dark:text-muted-foreground/90">
        Policy: pnl-reconciliation-view-absolute-final-v1 · Route: {PNL_RECONCILIATION_VIEW_ROUTE}
      </p>
      <p className="sr-only">{DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}</p>
    </div>
  );
}
