import type { ImportStatus } from "@prisma/client";

import {
  IMPORT_CENTER_HISTORY_ROUTE,
  IMPORT_CENTER_UPLOAD_ROUTE,
  IMPORT_JOB_DETAIL_ROUTE,
} from "@/lib/import-center/import-center-focus-era18-policy";
import { isPendingValidation, isReadyToCommit } from "@/lib/import-center/import-status";

export type ImportCenterFocusSnapshot = {
  failedCount: number;
  pendingValidation: number;
  readyToCommit: number;
  rowsWithErrorsThisMonth: number;
  rollbackEligibleJobs: number;
};

export type ImportCenterAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type ImportJobFocusRow = {
  id: string;
  status: ImportStatus;
  errorRows: number;
  hasCompletedRollback: boolean;
};

export type ImportJobRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

export function importJobDetailHref(jobId: string): string {
  return `${IMPORT_JOB_DETAIL_ROUTE}/${jobId}`;
}

export function importJobAnchor(jobId: string): string {
  return `#import-job-${jobId}`;
}

export function buildImportCenterFocusSnapshot(input: {
  failedCount: number;
  pendingValidation: number;
  readyToCommit: number;
  rowsWithErrorsThisMonth: number;
  rollbackEligibleJobs: number;
}): ImportCenterFocusSnapshot {
  return {
    failedCount: input.failedCount,
    pendingValidation: input.pendingValidation,
    readyToCommit: input.readyToCommit,
    rowsWithErrorsThisMonth: input.rowsWithErrorsThisMonth,
    rollbackEligibleJobs: input.rollbackEligibleJobs,
  };
}

export function summarizeImportCenterFocus(snapshot: ImportCenterFocusSnapshot): {
  totalSignals: number;
  hasUrgent: boolean;
} {
  const totalSignals =
    snapshot.failedCount +
    snapshot.pendingValidation +
    snapshot.readyToCommit +
    (snapshot.rowsWithErrorsThisMonth > 0 ? 1 : 0) +
    snapshot.rollbackEligibleJobs;

  const hasUrgent = snapshot.failedCount > 0 || snapshot.readyToCommit > 0;

  return { totalSignals, hasUrgent };
}

/** Import pipeline categories — failed and commit-ready jobs first. */
export function pickImportCenterAttentionItems(
  snapshot: ImportCenterFocusSnapshot,
): ImportCenterAttentionItem[] {
  const items: ImportCenterAttentionItem[] = [];

  if (snapshot.failedCount > 0) {
    items.push({
      id: "failed-imports",
      title: `${snapshot.failedCount} failed import job${snapshot.failedCount === 1 ? "" : "s"}`,
      detail: "Upload or validation failed — open the job to download errors and fix rows.",
      href: IMPORT_CENTER_HISTORY_ROUTE,
      priority: 1,
      tone: "urgent",
    });
  }

  if (snapshot.readyToCommit > 0) {
    items.push({
      id: "ready-to-commit",
      title: `${snapshot.readyToCommit} import${snapshot.readyToCommit === 1 ? "" : "s"} ready to commit`,
      detail: "Validated rows waiting for operator commit — finish before starting new uploads.",
      href: IMPORT_CENTER_HISTORY_ROUTE,
      priority: 2,
      tone: "urgent",
    });
  }

  if (snapshot.pendingValidation > 0) {
    items.push({
      id: "pending-validation",
      title: `${snapshot.pendingValidation} import${snapshot.pendingValidation === 1 ? "" : "s"} need mapping`,
      detail: "Column mapping or validation incomplete — operators cannot commit yet.",
      href: IMPORT_CENTER_HISTORY_ROUTE,
      priority: 3,
      tone: "normal",
    });
  }

  if (snapshot.rowsWithErrorsThisMonth > 0) {
    items.push({
      id: "row-errors-month",
      title: `${snapshot.rowsWithErrorsThisMonth} row error${snapshot.rowsWithErrorsThisMonth === 1 ? "" : "s"} this month`,
      detail: "Partial commits or validation warnings — review error CSVs before re-uploading.",
      href: IMPORT_CENTER_HISTORY_ROUTE,
      priority: 4,
      tone: snapshot.rowsWithErrorsThisMonth >= 25 ? "urgent" : "normal",
    });
  }

  if (snapshot.rollbackEligibleJobs > 0) {
    items.push({
      id: "rollback-eligible",
      title: `${snapshot.rollbackEligibleJobs} rollback-eligible commit${snapshot.rollbackEligibleJobs === 1 ? "" : "s"}`,
      detail: "Imported jobs that can still be rolled back — verify before the rollback window closes.",
      href: IMPORT_CENTER_HISTORY_ROUTE,
      priority: 5,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Per-job next action for history and recent import lists. */
export function resolveImportJobRowNextAction(
  job: ImportJobFocusRow,
): ImportJobRowNextAction | null {
  const detailHref = importJobDetailHref(job.id);

  if (job.status === "FAILED") {
    return { label: "Review failed import", href: detailHref, tone: "urgent" };
  }

  if (isPendingValidation(job.status)) {
    return { label: "Complete column mapping", href: detailHref, tone: "normal" };
  }

  if (isReadyToCommit(job.status)) {
    return { label: "Commit validated rows", href: detailHref, tone: "urgent" };
  }

  if (job.status === "IMPORTED" && job.errorRows > 0) {
    return { label: "Fix row errors", href: detailHref, tone: "urgent" };
  }

  return null;
}

/** Hero next step when import center is empty or all clear. */
export function resolveImportCenterEmptyNextAction(): ImportJobRowNextAction {
  return {
    label: "Upload first CSV",
    href: IMPORT_CENTER_UPLOAD_ROUTE,
    tone: "normal",
  };
}
