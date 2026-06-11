import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { TASK_PRIORITY_LABEL, TASK_TYPE_LABEL } from "@/lib/tasks/task-types";

export default async function RecurringTasksPage() {
  const { userId } = await getTenantActor();

  const recurrences = await prisma.kitchenTaskRecurrence.findMany({
    where: { task: { userId } },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          taskType: true,
          priority: true,
          assignedRole: true,
          recurrenceRule: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Recurring tasks</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Tasks that should regenerate on a schedule (daily, weekly, monthly).
          Recurrence rules are stored on each task — instance generation runs from this list.
        </p>
      </div>

      {recurrences.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No recurring tasks yet. Create a recurring task from the <Link href="/dashboard/tasks/new" className="underline">New task</Link> form
            or apply a template like “Daily opening checklist”.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {recurrences.map((r) => (
            <Card key={r.id} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <Link href={`/dashboard/tasks/${r.task.id}`} className="hover:underline">
                    {r.task.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {TASK_TYPE_LABEL[r.task.taskType]} · {TASK_PRIORITY_LABEL[r.task.priority]}
                  {r.task.assignedRole ? ` · ${r.task.assignedRole}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="rounded-full">{r.rule}</Badge>
                  {r.nextRunAt ? <span>next: {r.nextRunAt.toLocaleString()}</span> : <span>no next run</span>}
                  <Badge variant={r.active ? "secondary" : "outline"} className="rounded-full">
                    {r.active ? "active" : "paused"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
