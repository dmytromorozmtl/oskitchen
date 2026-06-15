import type { MealPlanFrequency } from "@prisma/client";

/**
 * Day arithmetic helpers — meal plans deal in calendar days only, never
 * timezone-shifted timestamps.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

/** Next cycle anchor relative to a previous start. */
export function nextCycleStart(previousStart: Date, frequency: MealPlanFrequency): Date {
  switch (frequency) {
    case "WEEKLY":   return addDays(previousStart, 7);
    case "BIWEEKLY": return addDays(previousStart, 14);
    case "MONTHLY":  return addMonths(previousStart, 1);
    case "CUSTOM_RRULE":
      // RRULE parsing is intentionally out of scope for v1 — fall back to weekly.
      return addDays(previousStart, 7);
  }
}

/** End date for a cycle that starts on `start`, inclusive of the day before the next anchor. */
export function cycleEndDate(start: Date, frequency: MealPlanFrequency): Date {
  const next = nextCycleStart(start, frequency);
  return addDays(next, -1);
}

/**
 * Generate the next `count` upcoming cycle anchors after (or including)
 * `from`. Used by the cycle materializer.
 */
export function projectCycleAnchors(from: Date, frequency: MealPlanFrequency, count: number): Date[] {
  const anchors: Date[] = [];
  let cur = new Date(from.getTime());
  cur.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    anchors.push(new Date(cur.getTime()));
    cur = nextCycleStart(cur, frequency);
  }
  return anchors;
}

export function startOfDayUtc(d: Date): Date {
  const c = new Date(d.getTime());
  c.setUTCHours(0, 0, 0, 0);
  return c;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor((startOfDayUtc(b).getTime() - startOfDayUtc(a).getTime()) / MS_PER_DAY);
}

export function isWithinDays(date: Date, now: Date, days: number): boolean {
  const diff = daysBetween(now, date);
  return diff >= 0 && diff <= days;
}
