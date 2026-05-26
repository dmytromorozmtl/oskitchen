import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { TASK_SOURCE_LABEL } from "@/lib/tasks/task-types";

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default async function TaskReportsPage() {
  const { userId } = await getTenantActor();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [total, completed, overdue, blocked, byAssignee, bySource, recurrent] = await Promise.all([
    prisma.kitchenTask.count({ where: { userId, createdAt: { gte: since } } }),
    prisma.kitchenTask.count({
      where: { userId, status: "DONE", completedAt: { gte: since } },
    }),
    prisma.kitchenTask.count({
      where: { userId, status: { notIn: ["DONE", "CANCELLED"] }, dueAt: { lt: new Date() } },
    }),
    prisma.kitchenTask.count({ where: { userId, status: "BLOCKED" } }),
    prisma.kitchenTask.groupBy({
      by: ["assignedToId"],
      where: { userId, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.kitchenTask.groupBy({
      by: ["sourceType"],
      where: { userId, createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.kitchenTaskRecurrence.count({ where: { task: { userId }, active: true } }),
  ]);

  const staff = await prisma.staffMember.findMany({
    where: { userId, id: { in: byAssignee.map((g) => g.assignedToId).filter((id): id is string => Boolean(id)) } },
    select: { id: true, name: true },
  });
  const staffMap = new Map(staff.map((s) => [s.id, s.name]));

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Task reports</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Last 30 days. Completion rate, overdue, blocked, and breakdowns by assignee / source.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Created (30d)" value={total} />
        <Kpi label="Completed (30d)" value={completed} />
        <Kpi label="Completion rate" value={`${completionRate}%`} />
        <Kpi label="Currently overdue" value={overdue} />
        <Kpi label="Active recurring" value={recurrent} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By assignee (30d)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {byAssignee.length === 0 ? (
            <p className="text-muted-foreground">No data.</p>
          ) : (
            byAssignee
              .sort((a, b) => b._count._all - a._count._all)
              .map((g) => (
                <div key={g.assignedToId ?? "unassigned"} className="flex justify-between border-b border-border/40 py-1">
                  <span>{g.assignedToId ? staffMap.get(g.assignedToId) ?? "Unknown" : "Unassigned"}</span>
                  <span className="tabular-nums">{g._count._all}</span>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By source (30d)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {bySource
            .sort((a, b) => b._count._all - a._count._all)
            .map((g) => (
              <div key={g.sourceType} className="flex justify-between border-b border-border/40 py-1">
                <span>{TASK_SOURCE_LABEL[g.sourceType]}</span>
                <span className="tabular-nums">{g._count._all}</span>
              </div>
            ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Blocked currently: {blocked}. Use the Kanban to unblock or reassign.
      </p>
    </div>
  );
}
