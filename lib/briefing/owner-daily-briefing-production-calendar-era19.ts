import type {
  OwnerDailyBriefingAlert,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
  OwnerDailyBriefingTileDraft,
} from "@/lib/briefing/owner-daily-briefing-era19";
import {
  isoDateOnly,
  weekStartMonday,
} from "@/lib/production/production-calendar-week-navigation";
import { enrichBriefingTileLinks } from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import type {
  ProductionCalendarAttentionItem,
  ProductionCalendarFocusSummary,
  ProductionCalendarFocusTask,
} from "@/lib/production/production-calendar-today-focus-era18";
import {
  pickProductionCalendarAttentionItems,
  productionCalendarTaskHref,
  summarizeProductionCalendarFocus,
} from "@/lib/production/production-calendar-today-focus-era18";
import { resolveProductionCalendarBriefingDrillHref } from "@/lib/production/production-calendar-drill-clarity-era19";
import { OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_POLICY_ID } from "@/lib/briefing/owner-daily-briefing-production-calendar-era19-policy";

export { OWNER_DAILY_BRIEFING_PRODUCTION_CALENDAR_ERA19_POLICY_ID };

export type OwnerDailyBriefingProductionCalendarSlice = {
  summary: ProductionCalendarFocusSummary;
  attentionItems: ProductionCalendarAttentionItem[];
  calendarHref: string;
  hasPlanTasks: boolean;
};

export function mapProductionPlanTasksToFocusTasks(
  rows: ReadonlyArray<{
    id: string;
    title: string;
    planDate: Date;
    status: string;
    batchSize: number | null;
  }>,
): ProductionCalendarFocusTask[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    planDate: row.planDate,
    status: row.status,
    batchSize: row.batchSize,
  }));
}

export function buildProductionCalendarBriefingHref(today = new Date()): string {
  const weekStart = isoDateOnly(weekStartMonday(today));
  const todayIso = isoDateOnly(today);
  return `/dashboard/production/calendar?week=${weekStart}#day-${todayIso}`;
}

export function buildOwnerDailyBriefingProductionCalendarSlice(input: {
  tasks: readonly ProductionCalendarFocusTask[];
  today?: Date;
}): OwnerDailyBriefingProductionCalendarSlice {
  const today = input.today ?? new Date();
  const todayIso = isoDateOnly(today);
  const summary = summarizeProductionCalendarFocus(input.tasks, todayIso);
  const attentionItems = pickProductionCalendarAttentionItems(input.tasks, todayIso);

  return {
    summary,
    attentionItems,
    calendarHref: buildProductionCalendarBriefingHref(today),
    hasPlanTasks: input.tasks.length > 0,
  };
}

export function buildProductionCalendarBriefingTile(
  slice: OwnerDailyBriefingProductionCalendarSlice,
): OwnerDailyBriefingTile {
  const { summary } = slice;
  const openCount = summary.overdue + summary.dueToday;
  const attention = summary.overdue > 0 || summary.dueToday > 0;

  let detail: string;
  if (!slice.hasPlanTasks) {
    detail = "No production calendar batches through today — schedule prep on the calendar.";
  } else if (summary.overdue > 0) {
    detail = `${summary.overdue} overdue · ${summary.dueToday} due today · ${summary.inProgress} in progress`;
  } else if (summary.dueToday > 0) {
    detail = `${summary.dueToday} due today · ${summary.inProgress} in progress · ${summary.completedToday} completed`;
  } else {
    detail = `${summary.completedToday} completed today — no overdue or due-today batches.`;
  }

  const href = resolveProductionCalendarBriefingDrillHref({
    overdue: summary.overdue,
    calendarHref: slice.calendarHref,
    taskHref: slice.attentionItems[0]?.href ?? null,
  });

  const draft: OwnerDailyBriefingTileDraft = {
    id: "production-calendar-today",
    category: "production",
    label: "Production calendar",
    value: String(openCount),
    detail,
    href,
    availability: slice.hasPlanTasks ? "available" : "not_configured",
    tone: attention ? "attention" : slice.hasPlanTasks ? "success" : "neutral",
    priority: summary.overdue > 0 ? 4 : summary.dueToday > 0 ? 13 : 24,
  };

  return enrichBriefingTileLinks(draft);
}

export function productionCalendarAlertsForBriefing(
  slice: OwnerDailyBriefingProductionCalendarSlice,
): OwnerDailyBriefingAlert[] {
  return slice.attentionItems.map((item) => ({
    id: `production-calendar-${item.id}`,
    title: item.title,
    detail: item.detail,
    href: item.href,
    priority: item.priority + 3,
    tone: item.tone,
  }));
}

export function productionCalendarActionsForBriefing(
  slice: OwnerDailyBriefingProductionCalendarSlice,
): OwnerDailyBriefingRankedAction[] {
  const actions: OwnerDailyBriefingRankedAction[] = [];

  if (slice.summary.overdue > 0) {
    const drillHref = resolveProductionCalendarBriefingDrillHref({
      overdue: slice.summary.overdue,
      calendarHref: slice.calendarHref,
      taskHref:
        slice.attentionItems.find((item) => item.id === "overdue-batches")?.href ?? null,
    });
    actions.push({
      id: "production-calendar-overdue",
      title: "Clear overdue production batches",
      reason: `${slice.summary.overdue} calendar batch(es) are past due — prep may block fulfillment.`,
      severity: "high",
      ownerRole: "kitchen",
      href: drillHref,
      status: "open",
      unblockCondition: "Reschedule, start, or complete overdue batches on the calendar.",
      priority: 5,
      ctaLabel: "Open calendar",
      tone: "urgent",
    });
  }

  if (slice.summary.dueToday > 0 && slice.summary.overdue === 0) {
    const nextHref =
      slice.attentionItems.find((item) => item.id === "due-today")?.href ?? slice.calendarHref;
    actions.push({
      id: "production-calendar-due-today",
      title: "Run today's production batches",
      reason: `${slice.summary.dueToday} batch(es) scheduled for today — keep prep on schedule.`,
      severity: "normal",
      ownerRole: "kitchen",
      href: nextHref,
      status: "open",
      unblockCondition: "Mark batches in progress or completed on the calendar.",
      priority: 14,
      ctaLabel: "View today column",
      tone: "normal",
    });
  }

  return actions;
}

export function productionCalendarTaskDeepLink(task: ProductionCalendarFocusTask): string {
  return productionCalendarTaskHref(task);
}

export function resolveBriefingOverdueProductionHref(input: {
  overdue: number;
  calendarHref?: string;
  taskHref?: string | null;
}): string {
  return resolveProductionCalendarBriefingDrillHref({
    overdue: input.overdue,
    calendarHref: input.calendarHref ?? "/dashboard/production/calendar",
    taskHref: input.taskHref ?? null,
  });
}

export function enrichBriefingProductionCalendarPackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  slice: OwnerDailyBriefingProductionCalendarSlice,
): OwnerDailyBriefingTile[] {
  const calendarTile = buildProductionCalendarBriefingTile(slice);
  const index = tiles.findIndex((tile) => tile.id === "production-calendar-today");

  if (index >= 0) {
    const next = [...tiles];
    next[index] = calendarTile;
    return next;
  }

  return [...tiles, calendarTile];
}
