import Link from "next/link";

import { ImportCenterAttentionStrip } from "@/components/dashboard/import-center/import-center-attention-strip";
import { DataMigrationWizardStrip } from "@/components/dashboard/import-center/data-migration-wizard-strip";
import { ImportJobRowNextAction } from "@/components/dashboard/import-center/import-job-row-next-action";
import { ImportCenterKpiGrid } from "@/components/dashboard/import-center/kpi-grid";
import { ImportStatusBadge } from "@/components/dashboard/import-center/status-badge";
import { ImportCenterUploadForm } from "@/components/dashboard/import-center/upload-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  importCenterKpis,
  listImportJobs,
} from "@/services/import-center/import-center-service";
import { IMPORT_TYPE_LABEL } from "@/lib/import-center/import-types";
import { buildImportCenterFocusSnapshot } from "@/lib/import-center/import-center-focus-era18";
import { importJobListWhereForOwner } from "@/lib/scope/workspace-import-export-scope";
import { prisma } from "@/lib/prisma";

export default async function ImportCenterPage() {
  const { dataUserId } = await getTenantActor();
  const jobWhere = await importJobListWhereForOwner(dataUserId);
  const [kpis, jobs, failedCount] = await Promise.all([
    importCenterKpis(dataUserId),
    listImportJobs(dataUserId, 12),
    prisma.importJob.count({
      where: { AND: [jobWhere, { status: "FAILED" }] },
    }),
  ]);

  const focusSnapshot = buildImportCenterFocusSnapshot({
    failedCount,
    pendingValidation: kpis.pendingValidation,
    readyToCommit: kpis.readyToCommit,
    rowsWithErrorsThisMonth: kpis.rowsWithErrorsThisMonth,
    rollbackEligibleJobs: kpis.rollbackEligibleJobs,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Data Import Center</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Upload, map, validate, preview, commit, and rollback CSV imports safely.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/import-center/upload">Upload CSV</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/import-center/templates">Download templates</Link>
          </Button>
        </div>
      </div>

      <ImportCenterKpiGrid tiles={kpis} />

      <DataMigrationWizardStrip />

      <ImportCenterAttentionStrip snapshot={focusSnapshot} />

      <ImportCenterUploadForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent imports</CardTitle>
          <CardDescription>Click a row to open its preview, commit, and rollback controls.</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No imports yet</p>
              <p className="mt-1">
                Upload a CSV to validate, preview, and safely commit business data.
              </p>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm">
                  <Link href="/dashboard/import-center/upload">Upload CSV</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/import-center/templates">Download templates</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  id={`import-job-${job.id}`}
                  className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={`/dashboard/import-center/jobs/${job.id}`}
                      className="font-medium text-primary underline underline-offset-4"
                    >
                      {job.filename}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {IMPORT_TYPE_LABEL[job.type]} · {job.totalRows} rows · {job.validRows} valid · {job.errorRows} errors ·
                      {" "}
                      {job.createdAt.toISOString().slice(0, 10)}
                    </span>
                    <ImportJobRowNextAction
                      job={{
                        id: job.id,
                        status: job.status,
                        errorRows: job.errorRows,
                        hasCompletedRollback: job.rollbacks.some((r) => r.status === "COMPLETED"),
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {job.rollbacks.some((r) => r.status === "COMPLETED") ? (
                      <span className="text-xs text-muted-foreground">Rolled back</span>
                    ) : null}
                    <ImportStatusBadge status={job.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
