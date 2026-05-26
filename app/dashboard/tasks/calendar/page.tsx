import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { TASK_PRIORITY_LABEL, TASK_TYPE_LABEL } from "@/lib/tasks/task-types";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function TasksCalendarPage() {
  const { userId } = await getTenantActor();
  const today = startOfDay(new Date());
  const end = addDays(today, 14);

  const tasks = await prisma.kitchenTask.findMany({
    where: {
      userId,
      dueAt: { gte: today, lt: end },
      status: { notIn: ["CANCELLED"] },
    },
    orderBy: { dueAt: "asc" },
    take: 400,
  });

  const buckets = new Map<string, typeof tasks>();
  for (let i = 0; i < 14; i += 1) {
    const d = addDays(today, i);
    buckets.set(dayKey(d), []);
  }
  for (const t of tasks) {
    if (!t.dueAt) continue;
    const k = dayKey(t.dueAt);
    const list = buckets.get(k);
    if (list) list.push(t);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Next 14 days. Click any task to open the detail page; calendar drag-to-reschedule lands on top of <code>rescheduleTaskAction</code>.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from(buckets.entries()).map(([key, items]) => {
          const date = new Date(`${key}T00:00:00`);
          return (
            <Card key={key} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>{date.toLocaleDateString(undefined, { weekday: "short" })}</CardDescription>
                <CardTitle className="text-base">
                  {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks.</p>
                ) : (
                  items.map((t) => (
                    <Link
                      key={t.id}
                      href={`/dashboard/tasks/${t.id}`}
                      className="block rounded-md border border-border/60 px-2 py-1 text-xs hover:bg-muted"
                    >
                      <span className="font-medium">{t.title}</span>
                      <span className="ml-1 text-muted-foreground">· {TASK_TYPE_LABEL[t.taskType]}</span>
                      <Badge variant="outline" className="ml-2 rounded-full text-[10px]">
                        {TASK_PRIORITY_LABEL[t.priority]}
                      </Badge>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
