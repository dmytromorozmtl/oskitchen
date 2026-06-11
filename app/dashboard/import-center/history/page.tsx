import Link from "next/link";

import { ImportCenterAttentionStrip } from "@/components/dashboard/import-center/import-center-attention-strip";
import { ImportJobRowNextAction } from "@/components/dashboard/import-center/import-job-row-next-action";
import { ImportStatusBadge } from "@/components/dashboard/import-center/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { IMPORT_TYPE_LABEL } from "@/lib/import-center/import-types";
import { buildImportCenterFocusSnapshot } from "@/lib/import-center/import-center-focus-era18";
import { importJobListWhereForOwner } from "@/lib/scope/workspace-import-export-scope";
import { prisma } from "@/lib/prisma";
import { importCenterKpis, listImportJobs } from "@/services/import-center/import-center-service";

export default async function ImportCenterHistoryPage() {
  const { dataUserId } = await getTenantActor();
  const jobWhere = await importJobListWhereForOwner(dataUserId);
  const [jobs, kpis, failedCount] = await Promise.all([
    listImportJobs(dataUserId, 100),
    importCenterKpis(dataUserId),
    prisma.importJob.count({ where: { AND: [jobWhere, { status: "FAILED" }] } }),
  ]);

  const focusSnapshot = buildImportCenterFocusSnapshot({
    failedCount,
    pendingValidation: kpis.pendingValidation,
    readyToCommit: kpis.readyToCommit,
    rowsWithErrorsThisMonth: kpis.rowsWithErrorsThisMonth,
    rollbackEligibleJobs: kpis.rollbackEligibleJobs,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import history</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every CSV upload becomes an import job. Preview rows, error reports, and rollback
          status are all linked from each row.
        </p>
      </div>

      <ImportCenterAttentionStrip snapshot={focusSnapshot} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All imports</CardTitle>
          <CardDescription>Showing the last 100 import jobs for this workspace.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {jobs.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No imports recorded yet.</div>
          ) : (
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="px-3 py-2 font-medium">File</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium tabular-nums">Rows</th>
                  <th className="px-3 py-2 font-medium tabular-nums">Valid</th>
                  <th className="px-3 py-2 font-medium tabular-nums">Errors</th>
                  <th className="px-3 py-2 font-medium tabular-nums">Created / updated</th>
                  <th className="px-3 py-2 font-medium">Rollback</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                  <th className="px-3 py-2 font-medium">Next action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const hasRollback = job.rollbacks.some((r) => r.status === "COMPLETED");
                  return (
                    <tr key={job.id} id={`import-job-${job.id}`} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <Link
                          href={`/dashboard/import-center/jobs/${job.id}`}
                          className="font-medium text-primary underline underline-offset-4"
                        >
                          {job.filename}
                        </Link>
                        {job.createdBy ? (
                          <p className="text-[11px] text-muted-foreground">
                            {job.createdBy.fullName ?? job.createdBy.email}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">{IMPORT_TYPE_LABEL[job.type]}</td>
                      <td className="px-3 py-2">
                        <ImportStatusBadge status={job.status} />
                      </td>
                      <td className="px-3 py-2 tabular-nums">{job.totalRows}</td>
                      <td className="px-3 py-2 tabular-nums text-emerald-700">{job.validRows}</td>
                      <td className="px-3 py-2 tabular-nums text-rose-700">{job.errorRows}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {job.createdRows} / {job.updatedRows}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {hasRollback ? "Rolled back" : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {job.createdAt.toISOString().slice(0, 10)}
                      </td>
                      <td className="px-3 py-2">
                        <ImportJobRowNextAction
                          job={{
                            id: job.id,
                            status: job.status,
                            errorRows: job.errorRows,
                            hasCompletedRollback: hasRollback,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
