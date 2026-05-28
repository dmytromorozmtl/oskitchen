import Link from "next/link";

import {
  createPlanTaskAction,
  movePlanTaskAction,
  updatePlanTaskStatusAction,
} from "@/actions/production-calendar";
import { CopilotFormErrorBanner } from "@/components/dashboard/copilot/form-error-banner";
import { ProductionCalendarAttentionStrip } from "@/components/production/production-calendar-attention-strip";
import { ProductionCalendarDrillChecklist } from "@/components/production/production-calendar-drill-checklist";
import { ProductionCalendarDrillHero } from "@/components/production/production-calendar-drill-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readProductionCalendarFormError } from "@/lib/production/production-calendar-form-mutation";
import { summarizeProductionCalendarFocus } from "@/lib/production/production-calendar-today-focus-era18";
import { isProductionCalendarTodayColumn } from "@/lib/production/production-calendar-today-focus-era18";
import {
  normalizeProductionPlanTaskStatus,
  PRODUCTION_PLAN_TASK_STATUSES,
  PRODUCTION_PLAN_TASK_STATUS_LABEL,
  productionPlanTaskStatusCardClass,
} from "@/lib/production/production-plan-task-status";
import {
  adjacentProductionPlanDateIso,
  formatProductionCalendarWeekLabel,
  isoDateOnly,
  parseProductionCalendarWeekStart,
  productionCalendarWeekDays,
  productionCalendarWeekHref,
  PRODUCTION_CALENDAR_WEEK_QUERY_PARAM,
} from "@/lib/production/production-calendar-week-navigation";
import { cn } from "@/lib/utils";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  getProductionCalendar,
  getProductionCalendarOpenThroughToday,
} from "@/services/production/production-calendar-service";

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
  const today = new Date();
  const todayIso = isoDateOnly(today);
  const [tasks, attentionTasks] = await Promise.all([
    getProductionCalendar(dataUserId, weekStart),
    getProductionCalendarOpenThroughToday(dataUserId, today),
  ]);
  const days = productionCalendarWeekDays(weekStart);
  const drillSummary = summarizeProductionCalendarFocus(attentionTasks, todayIso);
  const hasPlanTasks = attentionTasks.length > 0;

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
        Viewing {formatProductionCalendarWeekLabel(weekStart)}. Use ←/→ to reschedule within or
        across weeks; update status with the control on each task.
      </p>

      <CopilotFormErrorBanner message={formError} />

      <ProductionCalendarAttentionStrip tasks={attentionTasks} today={today} />

      <div className="space-y-3" data-testid="production-calendar-drill-strip">
        <ProductionCalendarDrillHero summary={drillSummary} hasPlanTasks={hasPlanTasks} />
        <ProductionCalendarDrillChecklist summary={drillSummary} hasPlanTasks={hasPlanTasks} />
      </div>

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
          const isToday = isProductionCalendarTodayColumn(key, todayIso);
          return (
            <Card
              key={key}
              id={isToday ? "today" : `day-${key}`}
              className={cn(
                "min-h-[120px]",
                isToday && "ring-2 ring-primary/35 shadow-sm",
              )}
            >
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-medium">
                  {day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  {isToday ? (
                    <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      Today
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-1">
                {dayTasks.map((t) => {
                  const taskStatus = normalizeProductionPlanTaskStatus(t.status);
                  return (
                    <div
                      key={t.id}
                      className={`rounded-lg px-2 py-1 text-xs ${productionPlanTaskStatusCardClass(t.status)}`}
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
                      <form
                        action={updatePlanTaskStatusAction}
                        className="mt-1 flex items-center gap-1"
                      >
                        <input type="hidden" name="taskId" value={t.id} />
                        <label className="sr-only" htmlFor={`status-${t.id}`}>
                          Status for {t.title}
                        </label>
                        <select
                          id={`status-${t.id}`}
                          name="status"
                          defaultValue={taskStatus}
                          className="min-w-0 flex-1 rounded border bg-background px-1 py-0.5 text-[10px]"
                        >
                          {PRODUCTION_PLAN_TASK_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {PRODUCTION_PLAN_TASK_STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="shrink-0 rounded border px-1 py-0.5 text-[10px] hover:bg-background/80"
                        >
                          Set
                        </button>
                      </form>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
