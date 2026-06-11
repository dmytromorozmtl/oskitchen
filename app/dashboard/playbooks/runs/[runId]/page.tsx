import Link from "next/link";
import { notFound } from "next/navigation";

import { RunActions } from "@/components/dashboard/playbooks/run-actions";
import { RunStatusBadge } from "@/components/dashboard/playbooks/playbook-status-badge";
import { RunStepRow } from "@/components/dashboard/playbooks/run-step-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isOverdue, progressForRun } from "@/lib/playbooks/playbook-runner";
import { requirePlaybooksPageAccess } from "@/lib/playbooks/playbook-page-access";
import { isTerminalRunStatus } from "@/lib/playbooks/playbook-status";
import { getRun } from "@/services/playbooks/playbook-service";

type Params = { runId: string };

export default async function PlaybookRunPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { runId } = await params;
  const access = await requirePlaybooksPageAccess("playbooks.view");
  if (!access.ok) return access.deny;
  const { tenantScope: scope } = access;
  const run = await getRun(scope, runId);
  if (!run) notFound();

  const progress = progressForRun(run.steps);
  const overdue = isOverdue(run);
  const completed = isTerminalRunStatus(run.status);

  const stepRows = run.steps
    .sort((a, b) => a.step.sortOrder - b.step.sortOrder)
    .map((rs) => ({
      runStepId: rs.id,
      title: rs.step.title,
      description: rs.step.description,
      status: rs.status,
      role: rs.assignedRole ?? rs.step.recommendedRole ?? null,
      moduleKey: rs.step.moduleKey,
      actionRoute: rs.step.actionRoute,
      estimatedMinutes: rs.step.estimatedMinutes,
      required: rs.step.required,
      hasTask: rs.taskId !== null,
      taskId: rs.taskId,
      blockedReason: rs.blockedReason,
      notes: rs.notes,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{run.title}</h1>
            <RunStatusBadge status={run.status} />
            {overdue ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                Overdue
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-muted-foreground">
            From playbook <strong>{run.playbook.title}</strong>
            {run.brand ? ` · Brand ${run.brand.name}` : ""}
            {run.location ? ` · Location ${run.location.name}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Started {run.startedAt.toLocaleString()}{" "}
            {run.dueAt ? ` · Due ${run.dueAt.toLocaleString()}` : ""}
            {run.completedAt ? ` · Completed ${run.completedAt.toLocaleString()}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/playbooks/active">Back to runs</Link>
          </Button>
        </div>
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Progress</CardTitle>
          <CardDescription>
            {progress.completed} completed · {progress.inProgress} in progress ·{" "}
            {progress.blocked} blocked · {progress.skipped} skipped · {progress.notStarted} not started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-sm tabular-nums">{progress.percent}%</p>
          {!completed ? (
            <RunActions
              runId={run.id}
              canGenerateTasks={progress.total > 0}
              tasksGenerated={run.tasksGenerated}
              canComplete={
                progress.notStarted === 0 && progress.inProgress === 0
              }
            />
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Steps</CardTitle>
          <CardDescription>
            Move each step through the workflow as the team works.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {stepRows.map((s) => (
              <RunStepRow key={s.runStepId} runId={run.id} {...s} />
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {run.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {run.events.map((e) => (
                <li key={e.id} className="text-muted-foreground">
                  <span className="font-mono text-xs">
                    {e.createdAt.toLocaleString()}
                  </span>{" "}
                  · {e.eventType} · {e.performedBy}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
