import Link from "next/link";

import { QuickStatusButton } from "@/components/dashboard/tasks/quick-status-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { TASK_STATUS_LABEL, effectiveStatus } from "@/lib/tasks/task-status";
import { TASK_PRIORITY_LABEL, TASK_TYPE_LABEL } from "@/lib/tasks/task-types";

export default async function MyTasksPage() {
  const { sessionUser: user, userId } = await getTenantActor();

  const myStaffRows = await prisma.staffMember.findMany({
    where: { userId, email: user.email ?? undefined },
    select: { id: true, role: true },
  });
  const myStaffIds = myStaffRows.map((r) => r.id);
  const myRoles = myStaffRows.map((r) => r.role).filter((r): r is string => Boolean(r));

  const orFilters: Array<{ assignedToId?: { in: string[] } | string; assignedRole?: { in: string[] } | string; createdById?: string }> = [];
  if (myStaffIds.length > 0) orFilters.push({ assignedToId: { in: myStaffIds } });
  if (myRoles.length > 0) orFilters.push({ assignedRole: { in: myRoles } });
  orFilters.push({ createdById: user.id });

  const tasks = await prisma.kitchenTask.findMany({
    where: {
      userId,
      OR: orFilters,
      status: { notIn: ["CANCELLED"] },
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My tasks</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Tasks assigned to you, your role, or created by you. Tap a card to open the detail.
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nothing assigned to you yet — open the Today view to grab unassigned work.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {tasks.map((t) => {
            const derived = effectiveStatus(t.status, t.dueAt);
            return (
              <Card key={t.id} className="border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">
                      <Link href={`/dashboard/tasks/${t.id}`} className="hover:underline">
                        {t.title}
                      </Link>
                    </CardTitle>
                    <Badge variant={derived === "OVERDUE" ? "destructive" : "outline"} className="rounded-full">
                      {TASK_STATUS_LABEL[derived]}
                    </Badge>
                  </div>
                  <CardDescription>
                    {TASK_TYPE_LABEL[t.taskType]} · {TASK_PRIORITY_LABEL[t.priority]}
                    {t.dueAt ? ` · due ${t.dueAt.toLocaleString()}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {t.status !== "DONE" ? (
                    <>
                      <QuickStatusButton taskId={t.id} to="IN_PROGRESS" label="Start" />
                      <QuickStatusButton taskId={t.id} to="DONE" variant="default" label="Done" />
                    </>
                  ) : (
                    <Badge variant="secondary">Completed</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
