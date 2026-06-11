import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { PRIORITY_BADGE_VARIANT } from "@/lib/tasks/task-priority";
import { TASK_STATUS_LABEL, TASK_STATUS_VALUES, effectiveStatus } from "@/lib/tasks/task-status";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_VALUES,
  TASK_SOURCE_LABEL,
  TASK_SOURCE_VALUES,
  TASK_TYPE_LABEL,
  TASK_TYPE_VALUES,
  isTaskPriority,
  isTaskSource,
  isTaskType,
} from "@/lib/tasks/task-types";
import { listTasksForUser } from "@/services/tasks/task-service";
import type { KitchenTaskStatus } from "@prisma/client";

type SearchProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function readParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function TasksListPage({ searchParams }: SearchProps) {
  const { userId } = await getTenantActor();
  const sp = (await searchParams) ?? {};

  const status = readParam(sp.status);
  const taskType = readParam(sp.type);
  const priority = readParam(sp.priority);
  const source = readParam(sp.source);
  const search = readParam(sp.q);

  const tasks = await listTasksForUser(
    { userId },
    {
      status: status === "OVERDUE" || status === "ALL" ? (status as "OVERDUE" | "ALL") : (status as KitchenTaskStatus | undefined),
      taskType: isTaskType(taskType) ? taskType : undefined,
      priority: isTaskPriority(priority) ? priority : undefined,
      source: isTaskSource(source) ? source : undefined,
      search: search || undefined,
      take: 500,
    },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">All tasks</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Full task list with filters and search.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="grid gap-3 md:grid-cols-6" method="get">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" defaultValue={search ?? ""} placeholder="Title…" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={status ?? "ALL"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="ALL">All</option>
                <option value="OVERDUE">Overdue</option>
                {TASK_STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" defaultValue={taskType ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Any</option>
                {TASK_TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>{TASK_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="priority">Priority</Label>
              <select id="priority" name="priority" defaultValue={priority ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Any</option>
                {TASK_PRIORITY_VALUES.map((p) => (
                  <option key={p} value={p}>{TASK_PRIORITY_LABEL[p]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="source">Source</Label>
              <select id="source" name="source" defaultValue={source ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Any</option>
                {TASK_SOURCE_VALUES.map((s) => (
                  <option key={s} value={s}>{TASK_SOURCE_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-6">
              <Button type="submit" size="sm">Apply</Button>
              <Button type="button" asChild size="sm" variant="ghost" className="ml-2">
                <Link href="/dashboard/tasks/list">Reset</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border/70">
                    <th className="py-2 pr-2">Title</th>
                    <th className="py-2 pr-2">Type</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Priority</th>
                    <th className="py-2 pr-2">Assignee</th>
                    <th className="py-2 pr-2">Due</th>
                    <th className="py-2 pr-2">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => {
                    const derived = effectiveStatus(t.status, t.dueAt);
                    return (
                      <tr key={t.id} className="border-b border-border/40">
                        <td className="py-2 pr-2">
                          <Link href={`/dashboard/tasks/${t.id}`} className="font-medium hover:underline">
                            {t.title}
                          </Link>
                        </td>
                        <td className="py-2 pr-2">{TASK_TYPE_LABEL[t.taskType]}</td>
                        <td className="py-2 pr-2">
                          <Badge variant={derived === "OVERDUE" ? "destructive" : "outline"} className="rounded-full">
                            {TASK_STATUS_LABEL[derived]}
                          </Badge>
                        </td>
                        <td className="py-2 pr-2">
                          <Badge variant={PRIORITY_BADGE_VARIANT[t.priority]} className="rounded-full">
                            {TASK_PRIORITY_LABEL[t.priority]}
                          </Badge>
                        </td>
                        <td className="py-2 pr-2 text-muted-foreground">
                          {t.assignedTo?.name ?? t.assignedRole ?? "—"}
                        </td>
                        <td className="py-2 pr-2 text-muted-foreground">
                          {t.dueAt ? t.dueAt.toLocaleString() : "—"}
                        </td>
                        <td className="py-2 pr-2 text-muted-foreground">{TASK_SOURCE_LABEL[t.sourceType]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
