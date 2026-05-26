import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/dashboard/reports/print-button";
import { ReportFilterBar } from "@/components/dashboard/reports/report-filter-bar";
import { SaveReportForm } from "@/components/dashboard/reports/save-report-form";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import {
  parseReportFilters,
  serialiseReportFilters,
} from "@/lib/reports/report-filters";
import { canDoReports } from "@/lib/reports/report-permissions";
import {
  getReportDefinition,
  isReportKey,
} from "@/lib/reports/report-registry";
import {
  PREVIEW_ROW_LIMIT,
  previewSlice,
  runReport,
} from "@/services/reports/report-service";

export default async function ReportGeneratorPage({
  params,
  searchParams,
}: {
  params: Promise<{ reportKey: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { reportKey } = await params;
  if (!isReportKey(reportKey)) notFound();
  const sp = (await searchParams) ?? {};
  const actor = await requireWorkspacePermissionActor();
  const { userId } = actor;
  const scope = createReportActorScope(actor);
  const definition = getReportDefinition(reportKey);

  const filters = parseReportFilters(sp);
  const basePath = `/dashboard/reports/${reportKey}`;
  const filtersQuery = serialiseReportFilters(filters).toString();

  const [result, brands, locations] = await Promise.all([
    runReport(reportKey, { userId, scope, filters }),
    prisma.brand.findMany({
      where: { workspace: { ownerUserId: userId } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.location.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (result.status === "permission_denied") {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You do not have permission to view this report.
        </CardContent>
      </Card>
    );
  }

  const canExport = canDoReports(scope, "reports.export");
  const canSave = canDoReports(scope, "reports.saved.manage");
  const exportHref = `/api/export/report?key=${reportKey}&${filtersQuery}`;
  const preview = previewSlice(result.rows);

  return (
    <div className="space-y-6">
      <header className="space-y-2 print:break-after-avoid">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{definition.title}</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">{definition.description}</p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            {canExport && (
              <Link
                href={exportHref}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                Export CSV
              </Link>
            )}
            <PrintButton />
            {definition.legacyExportHref && (
              <Link
                href={definition.legacyExportHref}
                className="rounded-md border border-border px-3 py-1.5 text-sm"
              >
                Legacy export
              </Link>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{result.rangeLabel}</p>
      </header>

      <ReportFilterBar
        filters={filters}
        basePath={basePath}
        definition={definition}
        brands={brands}
        locations={locations}
      />

      {result.summary.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {result.summary.map((k) => (
            <Card key={k.label} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>{k.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold">{k.value}</CardTitle>
              </CardHeader>
              {k.sub && (
                <CardContent className="pt-0 text-xs text-muted-foreground">{k.sub}</CardContent>
              )}
            </Card>
          ))}
        </section>
      )}

      {result.warnings.length > 0 && (
        <Card className="border-amber-300/60 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40">
          <CardContent className="py-4 text-sm">
            <ul className="list-disc space-y-1 pl-5 text-amber-900 dark:text-amber-100">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>
            {result.totalRows.toLocaleString()} row{result.totalRows === 1 ? "" : "s"}
            {result.truncated ? " (truncated to maximum export size)" : ""}
            {result.totalRows > PREVIEW_ROW_LIMIT
              ? ` · showing first ${PREVIEW_ROW_LIMIT}`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {preview.length === 0 ? (
            <div className="space-y-2 py-8 text-center text-sm text-muted-foreground">
              <p className="text-base font-medium text-foreground">No rows for this filter</p>
              <p>Adjust filters or extend the date range to populate the report.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/80 text-left">
                  {result.columns.map((c) => (
                    <th
                      key={c.key}
                      className={`px-3 py-2 font-medium ${c.numeric ? "text-right" : ""}`}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-b border-border/40">
                    {result.columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-3 py-2 ${c.numeric ? "text-right tabular-nums" : ""}`}
                      >
                        {String((row as Record<string, unknown>)[c.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {canSave && (
        <SaveReportForm
          reportKey={reportKey}
          filtersQuery={filtersQuery}
          defaultName={`${definition.title} — ${result.rangeLabel}`}
        />
      )}

      <p className="text-xs text-muted-foreground print:hidden">
        Tip: use your browser&apos;s print dialog (Cmd/Ctrl-P) to save this report as a PDF.
      </p>
    </div>
  );
}

