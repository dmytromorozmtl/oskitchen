import {
  isoDateOnly,
  weekStartMonday,
} from "@/lib/production/production-calendar-week-navigation";
import { normalizeProductionPlanTaskStatus } from "@/lib/production/production-plan-task-status";

export type ProductionCalendarFocusTask = {
  id: string;
  title: string;
  planDate: Date;
  status: string;
  batchSize?: number | null;
};

export type ProductionCalendarFocusSummary = {
  overdue: number;
  dueToday: number;
  inProgress: number;
  completedToday: number;
};

export type ProductionCalendarAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export function productionCalendarPlanDateIso(task: ProductionCalendarFocusTask): string {
  return isoDateOnly(task.planDate);
}

export function productionCalendarTaskHref(task: ProductionCalendarFocusTask): string {
  const planIso = productionCalendarPlanDateIso(task);
  const weekStart = isoDateOnly(weekStartMonday(task.planDate));
  return `/dashboard/production/calendar?week=${weekStart}#day-${planIso}`;
}

export function summarizeProductionCalendarFocus(
  tasks: readonly ProductionCalendarFocusTask[],
  todayIso: string,
): ProductionCalendarFocusSummary {
  let overdue = 0;
  let dueToday = 0;
  let inProgress = 0;
  let completedToday = 0;

  for (const task of tasks) {
    const planIso = productionCalendarPlanDateIso(task);
    const status = normalizeProductionPlanTaskStatus(task.status);

    if (status === "COMPLETED") {
      if (planIso === todayIso) completedToday += 1;
      continue;
    }

    if (planIso < todayIso) overdue += 1;
    else if (planIso === todayIso) dueToday += 1;

    if (status === "IN_PROGRESS") inProgress += 1;
  }

  return { overdue, dueToday, inProgress, completedToday };
}

function openTasks(tasks: readonly ProductionCalendarFocusTask[]): ProductionCalendarFocusTask[] {
  return tasks.filter(
    (task) => normalizeProductionPlanTaskStatus(task.status) !== "COMPLETED",
  );
}

/** Prioritized attention items for kitchen leads — uses open tasks through today. */
export function pickProductionCalendarAttentionItems(
  tasks: readonly ProductionCalendarFocusTask[],
  todayIso: string,
): ProductionCalendarAttentionItem[] {
  const items: ProductionCalendarAttentionItem[] = [];
  const open = openTasks(tasks);
  const overdueTasks = open
    .filter((task) => productionCalendarPlanDateIso(task) < todayIso)
    .sort(
      (left, right) =>
        productionCalendarPlanDateIso(left).localeCompare(productionCalendarPlanDateIso(right)) ||
        left.title.localeCompare(right.title),
    );
  const dueTodayTasks = open.filter((task) => productionCalendarPlanDateIso(task) === todayIso);
  const inProgressTasks = open.filter(
    (task) => normalizeProductionPlanTaskStatus(task.status) === "IN_PROGRESS",
  );

  if (overdueTasks.length > 0) {
    const oldest = overdueTasks[0]!;
    items.push({
      id: "overdue-batches",
      title: `${overdueTasks.length} overdue batch task${overdueTasks.length === 1 ? "" : "s"}`,
      detail: `Oldest: ${oldest.title} — move forward or mark in progress on the calendar.`,
      href: productionCalendarTaskHref(oldest),
      priority: 1,
      tone: "urgent",
    });
  }

  if (dueTodayTasks.length > 0) {
    const next = dueTodayTasks[0]!;
    items.push({
      id: "due-today",
      title: `${dueTodayTasks.length} batch task${dueTodayTasks.length === 1 ? "" : "s"} due today`,
      detail: `Next up: ${next.title}${next.batchSize ? ` ×${next.batchSize}` : ""}.`,
      href: productionCalendarTaskHref(next),
      priority: 2,
      tone: overdueTasks.length > 0 ? "urgent" : "normal",
    });
  }

  if (inProgressTasks.length > 0 && overdueTasks.length === 0) {
    const active = inProgressTasks[0]!;
    items.push({
      id: "in-progress",
      title: `${inProgressTasks.length} batch in progress`,
      detail: `Active: ${active.title} — mark completed when the batch finishes.`,
      href: productionCalendarTaskHref(active),
      priority: 3,
      tone: "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

export function isProductionCalendarTodayColumn(dayIso: string, todayIso: string): boolean {
  return dayIso === todayIso;
}
