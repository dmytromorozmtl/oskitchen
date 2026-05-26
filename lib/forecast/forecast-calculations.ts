import type {
  ForecastSourceContribution,
} from "@/lib/forecast/forecast-sources";

/**
 * Pure, deterministic forecast math. No ML, no AI, no synthetic data.
 *
 * - `simpleMovingAverage`: arithmetic mean of recent daily totals.
 * - `sameWeekdayAverage`: mean of values from the same weekday in the
 *   trailing window.
 * - `applyBuffer`: returns the buffer quantity for a planned quantity
 *   given a buffer percent (always rounded up).
 * - `roundUpUnit`: bakery-style batch rounding helper.
 */

export type DailyPoint = { date: Date; value: number };

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function simpleMovingAverage(series: DailyPoint[]): number {
  if (series.length === 0) return 0;
  let sum = 0;
  for (const p of series) sum += p.value;
  return sum / series.length;
}

export function sameWeekdayAverage(series: DailyPoint[], weekday: number): number {
  let sum = 0;
  let count = 0;
  for (const p of series) {
    if (p.date.getDay() === weekday) {
      sum += p.value;
      count += 1;
    }
  }
  return count === 0 ? 0 : sum / count;
}

export function applyBuffer(quantity: number, bufferPercent: number): number {
  if (quantity <= 0 || bufferPercent <= 0) return 0;
  const buffer = (quantity * bufferPercent) / 100;
  return Math.ceil(buffer);
}

export function roundUpUnit(quantity: number, unitSize: number): number {
  if (unitSize <= 1) return Math.ceil(quantity);
  return Math.ceil(quantity / unitSize) * unitSize;
}

/**
 * Combine source contributions into a single forecast quantity.
 * For an OVERRIDE manual adjustment, the caller is responsible for
 * passing only that contribution. Otherwise we sum positive and
 * negative contributions and clamp at zero.
 */
export function combineContributions(contributions: ForecastSourceContribution[]): number {
  let sum = 0;
  for (const c of contributions) sum += c.quantity;
  return Math.max(0, sum);
}

export function dayRange(from: Date, to: Date): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}
