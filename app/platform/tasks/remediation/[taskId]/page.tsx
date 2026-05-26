import Link from "next/link";
import { notFound } from "next/navigation";

import { updateProductionIncidentRemediationTaskStatusFormAction } from "@/actions/production-incidents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PRIORITY_BADGE_VARIANT } from "@/lib/tasks/task-priority";
import { checklistCounts, parseChecklist } from "@/lib/tasks/task-checklist";
import { TASK_STATUS_LABEL, effectiveStatus } from "@/lib/tasks/task-status";
import { TASK_PRIORITY_LABEL } from "@/lib/tasks/task-types";
import { requirePlatformRole } from "@/lib/platform-admin";
import { PRODUCTION_INCIDENT_MANAGER_ROLES } from "@/services/incidents/production-incident-rollup-service";
import { getProductionIncidentRemediationTaskForPlatform } from "@/services/incidents/production-incident-platform-task-service";
import { Badge } from "@/components/ui/badge";

function fmtDate(d: Date | null) {
  return d ? d.toLocaleString() : "—";
}

function eventLabel(event: string): string {
  return event.toLowerCase().replaceAll("_", " ");
}

function StatusAction({
  taskId,
  status,
  label,
  variant = "outline",
}: {
  taskId: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING" | "DONE";
  label: string;
  variant?: "default" | "secondary" | "outline";
}) {
  return (
    <form action={updateProductionIncidentRemediationTaskStatusFormAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="status" value={status} />
      <Button size="sm" variant={variant} type="submit" className="rounded-full">
        {label}
      </Button>
    </form>
  );
}

export default async function PlatformRemediationTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  await requirePlatformRole(PRODUCTION_INCIDENT_MANAGER_ROLES);
  const { taskId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(taskId)) notFound();

  const task = await getProductionIncidentRemediationTaskForPlatform(taskId);
  if (!task) notFound();

  const checklist = parseChecklist(task.checklistJson);
  const counts = checklistCounts(checklist);
  const derivedStatus = effectiveStatus(task.status, task.dueAt);

  return (
    <div className="space-y-6 text-zinc-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/platform/incidents" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← back to incidents
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{task.title}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Platform remediation follow-up task with incident-safe access and workflow controls.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {task.status !== "DONE" && task.status !== "CANCELLED" ? (
            <>
              <StatusAction taskId={task.id} status="IN_PROGRESS" label="Start" />
              <StatusAction taskId={task.id} status="WAITING" label="Waiting" variant="secondary" />
              <StatusAction taskId={task.id} status="DONE" label="Mark done" variant="default" />
            </>
          ) : (
            <StatusAction taskId={task.id} status="OPEN" label="Reopen" variant="secondary" />
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {task.description ? (
            <Card className="border-zinc-800 bg-zinc-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Description</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm text-zinc-300">
                {task.description}
              </CardContent>
            </Card>
          ) : null}

          {checklist.length > 0 ? (
            <Card className="border-zinc-800 bg-zinc-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Checklist</CardTitle>
                <CardDescription className="text-zinc-500">
                  {counts.completed}/{counts.total} complete
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-zinc-300">
                {checklist.map((item) => (
                  <div key={item.id} className="rounded-md border border-zinc-800 px-3 py-2">
                    <span className={item.completed ? "text-zinc-500 line-through" : "text-zinc-200"}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Incident context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-300">
              {task.incident ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{task.incident.title}</span>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                      {task.incident.workflowStatus.toLowerCase()}
                    </Badge>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                      review {task.incident.reviewStatus.toLowerCase()}
                    </Badge>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                      {task.incident.remediationControlStatus.toLowerCase().replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                    <span>
                      Remediation owner{" "}
                      {task.incident.remediationOwnerName ??
                        task.incident.remediationOwnerEmail ??
                        "unassigned"}
                    </span>
                    <span>Due {task.incident.remediationDueAt?.toISOString().slice(0, 10) ?? "—"}</span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="border-zinc-700 text-zinc-100">
                    <Link href="/platform/incidents">Open incident hub</Link>
                  </Button>
                </>
              ) : (
                <p className="text-zinc-500">
                  Linked incident row is no longer available. The task remains visible for audit.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-300">
              {task.comments.length === 0 ? (
                <p className="text-zinc-500">No comments on this task.</p>
              ) : (
                task.comments.map((comment) => (
                  <div key={comment.id} className="rounded-md border border-zinc-800 px-3 py-2">
                    <p className="text-xs text-zinc-500">
                      {comment.author?.fullName ?? comment.author?.email ?? comment.authorLabel ?? "User"} ·{" "}
                      {fmtDate(comment.createdAt)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Activity</CardTitle>
              <CardDescription className="text-zinc-500">{task.events.length} events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-zinc-500">
              {task.events.length === 0 ? (
                <p>No activity yet.</p>
              ) : (
                task.events.map((event) => (
                  <div key={event.id} className="flex justify-between border-b border-zinc-800 py-1">
                    <span>
                      {eventLabel(event.eventType)}
                      {event.performedBy ? ` · ${event.performedBy}` : ""}
                    </span>
                    <span>{fmtDate(event.createdAt)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Task status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-300">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={derivedStatus === "OVERDUE" ? "destructive" : "outline"} className="rounded-full">
                  {TASK_STATUS_LABEL[derivedStatus]}
                </Badge>
                <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]} className="rounded-full">
                  {TASK_PRIORITY_LABEL[task.priority]}
                </Badge>
              </div>
              <p>Owner: {task.ownerName ?? task.ownerEmail ?? task.ownerUserId}</p>
              <p>Created: {fmtDate(task.createdAt)}</p>
              <p>Due: {fmtDate(task.dueAt)}</p>
              <p>Started: {fmtDate(task.startedAt)}</p>
              <p>
                Completed: {fmtDate(task.completedAt)}
                {task.actualMinutes ? ` · ${task.actualMinutes} min actual` : ""}
                {task.estimatedMinutes ? ` · ${task.estimatedMinutes} min est.` : ""}
              </p>
              {task.blockedReason ? <p>Blocked reason: {task.blockedReason}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-100">
                <Link href={`/dashboard/tasks/${task.id}`}>Open owner task view</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-100">
                <Link href="/platform/incidents">Open incident hub</Link>
              </Button>
              {task.incident ? (
                <Button asChild variant="ghost" size="sm" className="w-full text-zinc-300 hover:text-white">
                  <Link href={task.incident.href}>Open incident source view</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
