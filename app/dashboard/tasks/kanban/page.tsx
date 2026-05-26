import Link from "next/link";

import { QuickStatusButton } from "@/components/dashboard/tasks/quick-status-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { PRIORITY_BADGE_VARIANT } from "@/lib/tasks/task-priority";
import { KANBAN_LANES, effectiveStatus } from "@/lib/tasks/task-status";
import { TASK_PRIORITY_LABEL, TASK_TYPE_LABEL } from "@/lib/tasks/task-types";
import { listTasksForUser } from "@/services/tasks/task-service";

export default async function TasksKanbanPage() {
  const { userId } = await getTenantActor();
  const tasks = await listTasksForUser({ userId }, { take: 300 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Kanban</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Lanes by status. Use the buttons on each card to move it. Drag-and-drop ships behind the same actions next.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {KANBAN_LANES.map((lane) => {
          const items = tasks.filter((t) => t.status === lane.id);
          return (
            <Card key={lane.id} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{lane.label}</CardTitle>
                <CardDescription>{items.length} tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks.</p>
                ) : (
                  items.map((t) => {
                    const derived = effectiveStatus(t.status, t.dueAt);
                    return (
                      <div key={t.id} className="space-y-2 rounded-xl border border-border/70 p-2">
                        <Link href={`/dashboard/tasks/${t.id}`} className="block text-sm font-medium hover:underline">
                          {t.title}
                        </Link>
                        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                          <Badge variant={PRIORITY_BADGE_VARIANT[t.priority]} className="rounded-full">
                            {TASK_PRIORITY_LABEL[t.priority]}
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            {TASK_TYPE_LABEL[t.taskType]}
                          </Badge>
                          {derived === "OVERDUE" ? (
                            <Badge variant="destructive" className="rounded-full">
                              Overdue
                            </Badge>
                          ) : null}
                          {t.assignedTo ? <span>· {t.assignedTo.name}</span> : null}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {lane.id !== "IN_PROGRESS" && lane.id !== "DONE" ? (
                            <QuickStatusButton taskId={t.id} to="IN_PROGRESS" label="Start" />
                          ) : null}
                          {lane.id !== "BLOCKED" && lane.id !== "DONE" ? (
                            <QuickStatusButton taskId={t.id} to="BLOCKED" variant="secondary" label="Block" />
                          ) : null}
                          {lane.id !== "DONE" ? (
                            <QuickStatusButton taskId={t.id} to="DONE" variant="default" label="Done" />
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
