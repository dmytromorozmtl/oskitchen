import type { PlaybookRun, PlaybookRunStep, PlaybookRunStepStatus } from "@prisma/client";

export type RunProgress = {
  total: number;
  completed: number;
  skipped: number;
  blocked: number;
  inProgress: number;
  notStarted: number;
  percent: number;
};

export function progressForRun(
  steps: Pick<PlaybookRunStep, "status">[],
): RunProgress {
  const total = steps.length;
  const stat = (s: PlaybookRunStepStatus) =>
    steps.filter((x) => x.status === s).length;
  const completed = stat("COMPLETED");
  const skipped = stat("SKIPPED");
  const blocked = stat("BLOCKED");
  const inProgress = stat("IN_PROGRESS");
  const notStarted = stat("NOT_STARTED");
  const percent =
    total === 0 ? 0 : Math.round(((completed + skipped) / total) * 100);
  return { total, completed, skipped, blocked, inProgress, notStarted, percent };
}

export function isOverdue(run: Pick<PlaybookRun, "dueAt" | "status">): boolean {
  if (!run.dueAt) return false;
  if (run.status === "COMPLETED" || run.status === "CANCELLED" || run.status === "ARCHIVED") {
    return false;
  }
  return run.dueAt.getTime() < Date.now();
}
