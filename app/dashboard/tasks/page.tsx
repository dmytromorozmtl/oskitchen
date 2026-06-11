import Link from "next/link";

import { createKitchenTaskFormAction } from "@/actions/kitchen-task";
import { QuickStatusButton } from "@/components/dashboard/tasks/quick-status-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { effectiveStatus, TASK_STATUS_LABEL } from "@/lib/tasks/task-status";
import {
  TASK_PRIORITY_LABEL,
  TASK_SOURCE_LABEL,
  TASK_TYPE_LABEL,
  TASK_TYPE_VALUES,
  hrefForTaskSource,
  tasksTerminologyForMode,
} from "@/lib/tasks/task-types";
import { loadTaskOverviewKpis } from "@/services/tasks/task-service";

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

export default async function TasksTodayPage() {
  const { userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const businessType = profile?.kitchenSettings?.businessType ?? null;
  const terminology = tasksTerminologyForMode(businessType);

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);

  const [kpis, todayTasks, overdueTasks, staff] = await Promise.all([
    loadTaskOverviewKpis(userId, now),
    prisma.kitchenTask.findMany({
      where: {
        userId,
        OR: [
          { dueAt: { gte: dayStart, lte: dayEnd } },
          { status: { in: ["IN_PROGRESS", "BLOCKED"] } },
          { dueAt: null, assignedToId: null, status: { notIn: ["DONE", "CANCELLED"] } },
        ],
      },
      include: { assignedTo: { select: { name: true, role: true } } },
      orderBy: [{ priority: "asc" }, { dueAt: "asc" }],
      take: 80,
    }),
    prisma.kitchenTask.findMany({
      where: { userId, dueAt: { lt: dayStart }, status: { notIn: ["DONE", "CANCELLED"] } },
      include: { assignedTo: { select: { name: true } } },
      orderBy: { dueAt: "asc" },
      take: 30,
    }),
    prisma.staffMember.findMany({ where: { userId, active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{terminology.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{terminology.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/tasks/new">New task</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/tasks/templates">Task templates</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Due today" value={kpis.dueToday} />
        <Kpi label="Overdue" value={kpis.overdue} />
        <Kpi label="Blocked" value={kpis.blocked} />
        <Kpi label="In progress" value={kpis.inProgress} />
        <Kpi label="Completed today" value={kpis.completedToday} />
        <Kpi label="Unassigned" value={kpis.unassigned} />
        <Kpi label="Urgent / critical" value={kpis.urgent} />
        <Kpi label="From playbooks" value={kpis.fromPlaybooks} />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick task</CardTitle>
          <CardDescription>The original quick-create form — kept working unchanged.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createKitchenTaskFormAction} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="Blanch vegetables for Sunday" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Notes</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskType">Type</Label>
              <select
                id="taskType"
                name="taskType"
                defaultValue={terminology.defaultType}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {TASK_TYPE_VALUES.map((t) => (
                  <option key={t} value={t}>
                    {TASK_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedToId">Assignee</Label>
              <select
                id="assignedToId"
                name="assignedToId"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dueAt">Due</Label>
              <Input id="dueAt" name="dueAt" type="datetime-local" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">
                Create task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {overdueTasks.length > 0 ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-lg">Overdue ({overdueTasks.length})</CardTitle>
            <CardDescription>Past due and not done — handle these first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today</CardTitle>
          <CardDescription>
            Due today, in progress, blocked, or unassigned without a due date — the daily standup view.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayTasks.length === 0 ? (
            <EmptyState terminology={terminology} />
          ) : (
            todayTasks.map((t) => <TaskRow key={t.id} task={t} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type RowTask = Awaited<ReturnType<typeof prisma.kitchenTask.findMany>>[number] & {
  assignedTo?: { name: string; role?: string | null } | null;
};

function TaskRow({ task }: { task: RowTask }) {
  const derived = effectiveStatus(task.status, task.dueAt);
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link href={`/dashboard/tasks/${task.id}`} className="text-sm font-medium hover:underline">
          {task.title}
        </Link>
        <p className="text-xs text-muted-foreground">
          {TASK_TYPE_LABEL[task.taskType]} · {TASK_PRIORITY_LABEL[task.priority]}
          {task.assignedTo ? ` · ${task.assignedTo.name}` : task.assignedRole ? ` · ${task.assignedRole}` : " · unassigned"}
          {task.dueAt ? ` · due ${task.dueAt.toLocaleString()}` : ""}
          {task.sourceType !== "MANUAL" ? ` · from ${TASK_SOURCE_LABEL[task.sourceType]}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={derived === "OVERDUE" ? "destructive" : "outline"}
          className="rounded-full"
        >
          {TASK_STATUS_LABEL[derived]}
        </Badge>
        {task.sourceType !== "MANUAL" ? (
          <Button asChild size="sm" variant="ghost">
            <Link href={hrefForTaskSource(task.sourceType, task.sourceId)}>Open source</Link>
          </Button>
        ) : null}
        {task.status !== "DONE" && task.status !== "CANCELLED" ? (
          <>
            <QuickStatusButton taskId={task.id} to="IN_PROGRESS" label="Start" />
            <QuickStatusButton taskId={task.id} to="DONE" variant="default" label="Done" />
          </>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ terminology }: { terminology: ReturnType<typeof tasksTerminologyForMode> }) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 p-6 text-center">
      <p className="text-sm font-medium">No tasks for today.</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Create a {terminology.defaultType.toLowerCase().replace("_", " ")} task or apply a template.
      </p>
      <div className="mt-3 flex justify-center gap-2">
        <Button asChild size="sm">
          <Link href="/dashboard/tasks/new">New task</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/dashboard/tasks/templates">Templates</Link>
        </Button>
      </div>
    </div>
  );
}
