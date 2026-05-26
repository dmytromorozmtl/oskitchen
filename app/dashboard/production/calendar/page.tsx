import { createPlanTaskAction } from "@/actions/production-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getProductionCalendar } from "@/services/production/production-calendar-service";

function weekStartMonday(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export default async function ProductionCalendarPage() {
  const { dataUserId } = await getTenantActor();
  const weekStart = weekStartMonday(new Date());
  const tasks = await getProductionCalendar(dataUserId, weekStart);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-semibold">Production planning calendar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add batch task</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPlanTaskAction} className="flex flex-wrap gap-2">
            <input name="title" required placeholder="Batch name" className="h-10 rounded-xl border px-3 text-sm" />
            <input name="planDate" type="date" required className="h-10 rounded-xl border px-3 text-sm" />
            <input name="batchSize" type="number" placeholder="Batch size" className="h-10 w-24 rounded-xl border px-3 text-sm" />
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
              Add
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-7">
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const dayTasks = tasks.filter(
            (t) => t.planDate.toISOString().slice(0, 10) === key,
          );
          return (
            <Card key={key} className="min-h-[120px]">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-medium">
                  {day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-1">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded-lg px-2 py-1 text-xs ${
                      t.status === "COMPLETED"
                        ? "bg-muted"
                        : t.status === "IN_PROGRESS"
                          ? "bg-amber-100 dark:bg-amber-950"
                          : "bg-primary/10"
                    }`}
                  >
                    {t.title}
                    {t.batchSize ? ` ×${t.batchSize}` : ""}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
