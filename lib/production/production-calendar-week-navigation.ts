/**
 * Production calendar week navigation — shared by Era 8 move UI and Era 10 cross-week UI.
 */

export const PRODUCTION_CALENDAR_WEEK_QUERY_PARAM = "week" as const;

export const PRODUCTION_CALENDAR_WEEK_DAYS = 7 as const;

export function weekStartMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function parseProductionCalendarWeekStart(weekParam?: string): Date {
  if (weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
    const parsed = new Date(`${weekParam}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return weekStartMonday(parsed);
    }
  }
  return weekStartMonday(new Date());
}

export function isoDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addCalendarDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function productionCalendarWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < PRODUCTION_CALENDAR_WEEK_DAYS; i++) {
    days.push(addCalendarDays(weekStart, i));
  }
  return days;
}

/** ISO plan date when moving ←/→ from a day column (includes adjacent weeks). */
export function adjacentProductionPlanDateIso(
  weekStart: Date,
  dayIndex: number,
  direction: "previous" | "next",
): string {
  if (direction === "previous") {
    if (dayIndex > 0) {
      return isoDateOnly(addCalendarDays(weekStart, dayIndex - 1));
    }
    return isoDateOnly(addCalendarDays(weekStart, -1));
  }
  if (dayIndex < PRODUCTION_CALENDAR_WEEK_DAYS - 1) {
    return isoDateOnly(addCalendarDays(weekStart, dayIndex + 1));
  }
  return isoDateOnly(addCalendarDays(weekStart, PRODUCTION_CALENDAR_WEEK_DAYS));
}

export function productionCalendarWeekHref(weekStart: Date, offsetDays: number): string {
  const target = addCalendarDays(weekStart, offsetDays);
  return `/dashboard/production/calendar?${PRODUCTION_CALENDAR_WEEK_QUERY_PARAM}=${isoDateOnly(target)}`;
}

export function formatProductionCalendarWeekLabel(weekStart: Date): string {
  const end = addCalendarDays(weekStart, PRODUCTION_CALENDAR_WEEK_DAYS - 1);
  const startFmt = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFmt = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: weekStart.getFullYear() === end.getFullYear() ? undefined : "numeric",
  });
  return `${startFmt} – ${endFmt}`;
}
