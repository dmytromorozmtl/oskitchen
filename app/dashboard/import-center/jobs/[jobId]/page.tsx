import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CancelJobButton,
  CommitJobButton,
  RollbackJobButton,
} from "@/components/dashboard/import-center/job-actions";
import { ImportStatusBadge } from "@/components/dashboard/import-center/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  PREVIEW_ROW_ACTION_LABEL,
  PREVIEW_ROW_STATUS_LABEL,
} from "@/lib/import-center/import-status";
import { isCommittableType, commitNotSupportedReason } from "@/lib/import-center/import-commit";
import {
  parseRollbackPlan,
  rollbackAvailability,
} from "@/lib/import-center/import-rollback";
import { IMPORT_TYPE_LABEL } from "@/lib/import-center/import-types";
import { getImportJob } from "@/services/import-center/import-center-service";
import { prisma } from "@/lib/prisma";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

const STATUS_TONE: Record<string, Tone> = {
  VALID: "success",
  WARNING: "warning",
  ERROR: "danger",
  DUPLICATE: "info",
  SKIPPED: "neutral",
};

const ACTION_TONE: Record<string, Tone> = {
  CREATE: "success",
  UPDATE: "info",
  SKIP: "neutral",
  REJECT: "danger",
};

function StatBlock({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default async function ImportJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const detail = await getImportJob(dataUserId, jobId);
  if (!detail) notFound();
  const { job, rows, rollbacks } = detail;

  const fullJob = await prisma.importJob.findUnique({
    where: { id: jobId },
    select: { rollbackJson: true },
  });
  const rollbackPlan = parseRollbackPlan(fullJob?.rollbackJson);
  const rollback = rollbackAvailability(rollbackPlan, job.rolledBackAt !== null);
  const committable = isCommittableType(job.type);
  const errorRowCount = rows.filter((r) => r.validationStatus === "ERROR").length;
  const warningRowCount = rows.filter((r) => r.validationStatus === "WARNING").length;
  const validRowCount = rows.filter((r) => r.validationStatus === "VALID").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Import job</p>
          <h1 className="text-2xl font-semibold tracking-tight">{job.filename}</h1>
          <p className="text-sm text-muted-foreground">
            {IMPORT_TYPE_LABEL[job.type]} · {job.totalRows} rows ·
            {" "}
            {job.commitMode ?? "CREATE_ONLY"} · {job.createdAt.toISOString().slice(0, 19)}
          </p>
          {job.createdByLabel ? (
            <p className="text-xs text-muted-foreground">Created by {job.createdByLabel}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ImportStatusBadge status={job.status as never} />
          <Link
            href="/dashboard/import-center"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            ← All imports
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock label="Valid" value={job.validRows} hint="No errors, no warnings" />
        <StatBlock label="Warnings" value={job.warningRows} hint="Commit requires explicit opt-in" />
        <StatBlock label="Errors" value={job.errorRows} hint="Never committed" />
        <StatBlock label="Duplicates" value={job.duplicateRows} hint="Matched existing or earlier rows" />
        <StatBlock label="Will create" value={job.createdRows} />
        <StatBlock label="Will update" value={job.updatedRows} />
        <StatBlock label="Will skip" value={job.skippedRows} />
        <StatBlock label="Will reject" value={job.rejectedRows} />
      </div>

      {!committable ? (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardHeader>
            <CardTitle className="text-base">Preview-only import type</CardTitle>
            <CardDescription>{commitNotSupportedReason(job.type)}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {job.status === "VALIDATED" && committable && validRowCount > 0 ? (
          <CommitJobButton jobId={job.id} hasWarnings={warningRowCount > 0} />
        ) : null}
        {job.status === "IMPORTED" && rollback.available ? (
          <RollbackJobButton jobId={job.id} recordsAvailable={rollback.count} />
        ) : null}
        {job.status !== "IMPORTED" && job.status !== "CANCELLED" ? (
          <div className="flex flex-col justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Cancel import</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Marks this job as cancelled. Preview rows are preserved for review.
              </p>
            </div>
            <CancelJobButton jobId={job.id} />
          </div>
        ) : null}
        {job.status === "IMPORTED" && !rollback.available ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Rollback unavailable</CardTitle>
              <CardDescription>{rollback.reason}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>

      {rollbacks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rollback history</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {rollbacks.map((rb) => (
                <li key={rb.id} className="flex items-center justify-between">
                  <span>
                    {rb.createdAt.toISOString().slice(0, 19)} · {rb.recordsRolledBack} records
                  </span>
                  <Badge variant="outline">{rb.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {job.errorMessage ? (
        <Card className="border-rose-200 bg-rose-50/40">
          <CardHeader>
            <CardTitle className="text-base text-rose-700">Job error</CardTitle>
            <CardDescription>{job.errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Row preview</CardTitle>
            <CardDescription>
              Showing {rows.length} of {job.totalRows} rows (first 500 persisted).
            </CardDescription>
          </div>
          {errorRowCount > 0 ? (
            <Link
              href={`/api/import-center/${job.id}/errors.csv`}
              className="text-sm font-medium text-primary underline underline-offset-4"
            >
              Download error CSV
            </Link>
          ) : null}
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Errors / warnings</th>
                <th className="px-3 py-2 font-medium">Normalized</th>
                <th className="px-3 py-2 font-medium">Duplicate of</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b align-top last:border-0">
                  <td className="px-3 py-2 tabular-nums">{r.rowNumber}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE_CLASS[STATUS_TONE[r.validationStatus]]}`}>
                      {PREVIEW_ROW_STATUS_LABEL[r.validationStatus]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE_CLASS[ACTION_TONE[r.action]]}`}>
                      {PREVIEW_ROW_ACTION_LABEL[r.action]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {r.errors.length > 0 ? (
                      <ul className="space-y-0.5">
                        {r.errors.map((e, idx) => (
                          <li key={idx} className="text-rose-700">{e.message}</li>
                        ))}
                      </ul>
                    ) : null}
                    {r.warnings.length > 0 ? (
                      <ul className="mt-1 space-y-0.5">
                        {r.warnings.map((w, idx) => (
                          <li key={idx} className="text-amber-700">{w.message}</li>
                        ))}
                      </ul>
                    ) : null}
                    {r.errors.length === 0 && r.warnings.length === 0 ? "—" : null}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <code className="text-[11px]">{r.normalized ? JSON.stringify(r.normalized) : "—"}</code>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {r.targetEntityId ? <code className="text-[11px]">{r.targetEntityId}</code> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
