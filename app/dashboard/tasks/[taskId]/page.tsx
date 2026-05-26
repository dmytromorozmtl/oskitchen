import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addTaskCommentFormAction,
  assignTaskFormAction,
  rescheduleTaskFormAction,
  updateTaskPriorityFormAction,
} from "@/actions/kitchen-task";
import { QuickStatusButton } from "@/components/dashboard/tasks/quick-status-form";
import { ChecklistToggle } from "@/components/dashboard/tasks/checklist-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { parseChecklist, checklistCounts } from "@/lib/tasks/task-checklist";
import { PRIORITY_BADGE_VARIANT } from "@/lib/tasks/task-priority";
import { TASK_STATUS_LABEL, effectiveStatus } from "@/lib/tasks/task-status";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_VALUES,
  TASK_SOURCE_LABEL,
  TASK_TYPE_LABEL,
  hrefForTaskSource,
} from "@/lib/tasks/task-types";
import { getTaskForUser } from "@/services/tasks/task-service";

function fmtDate(d: Date | null) {
  return d ? d.toLocaleString() : "—";
}

function eventLabel(event: string): string {
  return event.toLowerCase().replaceAll("_", " ");
}

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { userId } = await getTenantActor();
  const { taskId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(taskId)) notFound();

  const task = await getTaskForUser({ userId }, taskId);
  if (!task) notFound();

  const checklist = parseChecklist(task.checklistJson);
  const counts = checklistCounts(checklist);
  const derived = effectiveStatus(task.status, task.dueAt);

  const staff = await prisma.staffMember.findMany({
    where: { userId, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-2">
        <div>
          <Link href="/dashboard/tasks" className="text-sm text-muted-foreground hover:underline">
            ← back to tasks
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{task.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {TASK_TYPE_LABEL[task.taskType]} ·{" "}
            <Badge variant={derived === "OVERDUE" ? "destructive" : "outline"} className="rounded-full">
              {TASK_STATUS_LABEL[derived]}
            </Badge>{" "}
            ·{" "}
            <Badge variant={PRIORITY_BADGE_VARIANT[task.priority]} className="rounded-full">
              {TASK_PRIORITY_LABEL[task.priority]}
            </Badge>
            {task.sourceType !== "MANUAL" ? (
              <>
                {" · "}
                from <Badge variant="secondary" className="rounded-full">{TASK_SOURCE_LABEL[task.sourceType]}</Badge>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {task.status !== "DONE" && task.status !== "CANCELLED" ? (
            <>
              <QuickStatusButton taskId={task.id} to="IN_PROGRESS" label="Start" />
              <QuickStatusButton taskId={task.id} to="BLOCKED" variant="secondary" label="Block" />
              <QuickStatusButton taskId={task.id} to="WAITING" variant="outline" label="Waiting" />
              <QuickStatusButton taskId={task.id} to="DONE" variant="default" label="Mark done" />
              <QuickStatusButton taskId={task.id} to="CANCELLED" variant="destructive" label="Cancel" />
            </>
          ) : (
            <QuickStatusButton taskId={task.id} to="OPEN" variant="secondary" label="Reopen" />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {task.description ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm">{task.description}</CardContent>
            </Card>
          ) : null}

          {checklist.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Checklist</CardTitle>
                <CardDescription>{counts.completed}/{counts.total} complete</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {checklist.map((item) => (
                  <ChecklistToggle
                    key={item.id}
                    taskId={task.id}
                    itemId={item.id}
                    completed={item.completed}
                    label={item.title}
                  />
                ))}
              </CardContent>
            </Card>
          ) : null}

          {task.sourceType !== "MANUAL" ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Source</CardTitle>
                <CardDescription>
                  {TASK_SOURCE_LABEL[task.sourceType]}{task.sourceLabel ? ` · ${task.sourceLabel}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href={hrefForTaskSource(task.sourceType, task.sourceId)}>Open source</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.comments.length === 0 ? (
                <p className="text-xs text-muted-foreground">No comments yet.</p>
              ) : (
                task.comments.map((c) => (
                  <div key={c.id} className="rounded-md border border-border/60 p-2 text-sm">
                    <p className="text-xs text-muted-foreground">
                      {c.author?.fullName ?? c.authorLabel ?? "User"} · {fmtDate(c.createdAt)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}

              <form action={addTaskCommentFormAction} className="space-y-2">
                <input type="hidden" name="taskId" value={task.id} />
                <Label htmlFor="content" className="text-xs">Add comment</Label>
                <Textarea id="content" name="content" rows={2} required maxLength={4000} />
                <Button type="submit" size="sm">Post</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activity</CardTitle>
              <CardDescription>{task.events.length} events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              {task.events.length === 0 ? (
                <p>No activity yet.</p>
              ) : (
                task.events.map((e) => (
                  <div key={e.id} className="flex justify-between border-b border-border/40 py-1">
                    <span>{eventLabel(e.eventType)}{e.performedBy ? ` · ${e.performedBy}` : ""}</span>
                    <span>{fmtDate(e.createdAt)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={assignTaskFormAction} className="space-y-3">
                <input type="hidden" name="taskId" value={task.id} />
                <div className="space-y-1">
                  <Label htmlFor="assignedToId">Assignee</Label>
                  <select
                    id="assignedToId"
                    name="assignedToId"
                    defaultValue={task.assignedToId ?? ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="assignedRole">Role</Label>
                  <Input
                    id="assignedRole"
                    name="assignedRole"
                    defaultValue={task.assignedRole ?? ""}
                    placeholder="e.g. kitchen"
                    maxLength={64}
                  />
                </div>
                <Button type="submit" size="sm">Save</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={rescheduleTaskFormAction} className="space-y-2">
                <input type="hidden" name="taskId" value={task.id} />
                <Label htmlFor="dueAt" className="text-xs">Due</Label>
                <Input
                  id="dueAt"
                  name="dueAt"
                  type="datetime-local"
                  defaultValue={task.dueAt ? task.dueAt.toISOString().slice(0, 16) : ""}
                />
                <Button type="submit" size="sm">Reschedule</Button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">
                Started: {fmtDate(task.startedAt)}<br />
                Completed: {fmtDate(task.completedAt)}
                {task.actualMinutes ? ` · ${task.actualMinutes} min actual` : ""}
                {task.estimatedMinutes ? ` · ${task.estimatedMinutes} min est.` : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateTaskPriorityFormAction} className="space-y-2">
                <input type="hidden" name="taskId" value={task.id} />
                <select
                  name="priority"
                  defaultValue={task.priority}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {TASK_PRIORITY_VALUES.map((p) => (
                    <option key={p} value={p}>{TASK_PRIORITY_LABEL[p]}</option>
                  ))}
                </select>
                <Button type="submit" size="sm">Update</Button>
              </form>
            </CardContent>
          </Card>

          {(task.brand || task.location) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {task.brand ? <p>Brand: {task.brand.name}</p> : null}
                {task.location ? <p>Location: {task.location.name}</p> : null}
              </CardContent>
            </Card>
          )}

          {task.recurrence ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recurrence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>{task.recurrence.rule}</p>
                <p className="text-xs text-muted-foreground">
                  Next: {task.recurrence.nextRunAt ? fmtDate(task.recurrence.nextRunAt) : "not scheduled"}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
