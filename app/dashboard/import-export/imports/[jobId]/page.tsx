import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getImportJobForUser } from "@/services/import-export/import-job-queries";

function jsonCell(value: unknown) {
  if (value == null) return "—";
  return JSON.stringify(value);
}

export default async function ImportJobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const job = await getImportJobForUser(dataUserId, jobId);
  if (!job) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Import job</p>
          <h1 className="text-2xl font-semibold tracking-tight">{job.filename}</h1>
          <p className="text-sm text-muted-foreground">
            {job.type} · {job.status} · {job.createdAt.toISOString().slice(0, 19)}
          </p>
        </div>
        <Link href="/dashboard/import-export/imports" className="text-sm font-medium text-primary underline underline-offset-4">
          ← All imports
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total rows</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{job.totalRows}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valid / warnings / errors</CardDescription>
            <CardTitle className="text-base tabular-nums">
              {job.validRows} / {job.warningRows} / {job.errorRows}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Create / update / skip / dup</CardDescription>
            <CardTitle className="text-base tabular-nums">
              {job.createdRows} / {job.updatedRows} / {job.skippedRows} / {job.duplicateRows}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Created by</CardDescription>
            <CardTitle className="text-sm font-medium leading-snug">
              {job.createdBy?.fullName ?? job.createdBy?.email ?? "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {job.resultJson != null ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Result summary</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{jsonCell(job.resultJson)}</pre>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview rows (first 500)</CardTitle>
          <CardDescription>Row-level validation persisted for review — not a live grid of production tables.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Errors</th>
                <th className="px-3 py-2 font-medium">Normalized</th>
              </tr>
            </thead>
            <tbody>
              {job.previewRows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top last:border-0">
                  <td className="px-3 py-2 tabular-nums">{r.rowNumber}</td>
                  <td className="px-3 py-2">{r.action}</td>
                  <td className="px-3 py-2">{r.validationStatus}</td>
                  <td className="px-3 py-2 text-muted-foreground">{jsonCell(r.errorsJson)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{jsonCell(r.normalizedJson)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-dashed border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Rollback</CardTitle>
          <CardDescription>
            Rollback will restore created rows (and optionally captured updates) once transactional import execution ships.
            Destructive rollback will always require a reason and impact preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {job.rollbacks.length === 0 ? (
            <p>No rollback records for this job yet.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {job.rollbacks.map((rb) => (
                <li key={rb.id}>
                  {rb.status} · {rb.recordsRolledBack} rows · {rb.createdAt.toISOString().slice(0, 16)}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
