/**
 * Forecasting helpers — explicitly labelled as estimates everywhere
 * they're surfaced. No AI, no synthetic numbers. We do a simple
 * trailing-window moving average and add deterministic recurring
 * demand contributions when we have them.
 *
 * Returns `null` when there's insufficient history.
 */

export type DailySeriesPoint = { date: string; value: number };

const MIN_HISTORY = 7;

export function movingAverage(
  series: DailySeriesPoint[],
  daysAhead: number,
  window = 14,
): { forecast: DailySeriesPoint[]; warning?: string } | null {
  if (series.length < MIN_HISTORY) return null;
  const tail = series.slice(-window);
  if (tail.length === 0) return null;
  const avg = tail.reduce((a, b) => a + b.value, 0) / tail.length;

  const forecast: DailySeriesPoint[] = [];
  const lastDate = new Date(series[series.length - 1].date);
  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(lastDate);
    d.setDate(lastDate.getDate() + i);
    forecast.push({ date: d.toISOString().slice(0, 10), value: Math.round(avg * 100) / 100 });
  }
  const warning = series.length < window ? "Forecast based on limited history." : undefined;
  return { forecast, warning };
}

export function addRecurringContribution(
  forecast: DailySeriesPoint[],
  contribution: { date: string; value: number }[],
): DailySeriesPoint[] {
  const map = new Map<string, number>();
  for (const point of forecast) map.set(point.date, point.value);
  for (const c of contribution) {
    if (map.has(c.date)) map.set(c.date, (map.get(c.date) ?? 0) + c.value);
  }
  return forecast.map((p) => ({ date: p.date, value: Math.round((map.get(p.date) ?? p.value) * 100) / 100 }));
}
