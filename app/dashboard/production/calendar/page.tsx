import Link from "next/link";

import { createPlanTaskAction, movePlanTaskAction } from "@/actions/production-calendar";
import { CopilotFormErrorBanner } from "@/components/dashboard/copilot/form-error-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readProductionCalendarFormError } from "@/lib/production/production-calendar-form-mutation";
import {
  adjacentProductionPlanDateIso,
  formatProductionCalendarWeekLabel,
  parseProductionCalendarWeekStart,
  productionCalendarWeekDays,
  productionCalendarWeekHref,
  PRODUCTION_CALENDAR_WEEK_QUERY_PARAM,
} from "@/lib/production/production-calendar-week-navigation";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getProductionCalendar } from "@/services/production/production-calendar-service";

export default async function ProductionCalendarPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const weekParam =
    typeof params[PRODUCTION_CALENDAR_WEEK_QUERY_PARAM] === "string"
      ? params[PRODUCTION_CALENDAR_WEEK_QUERY_PARAM]
      : undefined;
  const formError = readProductionCalendarFormError(params);
  const { dataUserId } = await getTenantActor();
  const weekStart = parseProductionCalendarWeekStart(weekParam);
  const tasks = await getProductionCalendar(dataUserId, weekStart);
  const days = productionCalendarWeekDays(weekStart);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Production planning calendar</h1>
        <nav
          className="flex flex-wrap items-center gap-2 text-sm"
          aria-label="Production calendar week navigation"
        >
          <Link
            href={productionCalendarWeekHref(weekStart, -7)}
            className="rounded-lg border px-3 py-1.5 hover:bg-muted"
          >
            ← Previous week
          </Link>
          <Link
            href="/dashboard/production/calendar"
            className="rounded-lg border px-3 py-1.5 hover:bg-muted"
          >
            This week
          </Link>
          <Link
            href={productionCalendarWeekHref(weekStart, 7)}
            className="rounded-lg border px-3 py-1.5 hover:bg-muted"
          >
            Next week →
          </Link>
        </nav>
      </div>
      <p className="text-sm text-muted-foreground">
        Viewing {formatProductionCalendarWeekLabel(weekStart)}. Use ←/→ on tasks to reschedule
        within or across weeks.
      </p>

      <CopilotFormErrorBanner message={formError} />

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
        {days.map((day, dayIndex) => {
          const key = day.toISOString().slice(0, 10);
          const dayTasks = tasks.filter(
            (t) => t.planDate.toISOString().slice(0, 10) === key,
          );
          const previousDayIso = adjacentProductionPlanDateIso(weekStart, dayIndex, "previous");
          const nextDayIso = adjacentProductionPlanDateIso(weekStart, dayIndex, "next");
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
                    <div className="flex items-start justify-between gap-1">
                      <span className="min-w-0 flex-1 leading-snug">
                        {t.title}
                        {t.batchSize ? ` ×${t.batchSize}` : ""}
                      </span>
                      <div className="flex shrink-0 gap-0.5">
                        <form action={movePlanTaskAction}>
                          <input type="hidden" name="taskId" value={t.id} />
                          <input type="hidden" name="planDate" value={previousDayIso} />
                          <button
                            type="submit"
                            className="rounded px-1 text-[10px] text-muted-foreground hover:bg-background/80 hover:text-foreground"
                            aria-label={`Move ${t.title} to previous day`}
                            title="Move to previous day (may change week)"
                          >
                            ←
                          </button>
                        </form>
                        <form action={movePlanTaskAction}>
                          <input type="hidden" name="taskId" value={t.id} />
                          <input type="hidden" name="planDate" value={nextDayIso} />
                          <button
                            type="submit"
                            className="rounded px-1 text-[10px] text-muted-foreground hover:bg-background/80 hover:text-foreground"
                            aria-label={`Move ${t.title} to next day`}
                            title="Move to next day (may change week)"
                          >
                            →
                          </button>
                        </form>
                      </div>
                    </div>
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
