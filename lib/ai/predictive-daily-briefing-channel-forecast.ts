import {
  ANALYTICS_CHANNEL_LABEL,
  ANALYTICS_CHANNEL_VALUES,
  channelForOrder,
  type AnalyticsChannel,
} from "@/lib/analytics/channel-attribution";
import type { ChannelTodayForecast } from "@/lib/ai/restaurant-brain-types";

export type ChannelOrderRow = {
  createdAt: Date;
  total: number;
  importedFromProvider?: string | null;
  storefrontOrderId?: string | null;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function channelOf(row: ChannelOrderRow): AnalyticsChannel {
  return channelForOrder({
    importedFromProvider: row.importedFromProvider as Parameters<typeof channelForOrder>[0]["importedFromProvider"],
    storefrontOrderId: row.storefrontOrderId ?? null,
  });
}

function round0(n: number): number {
  return Math.round(n);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function confidenceFromSamples(sampleDays: number, totalOrders: number): number {
  if (sampleDays >= 3 && totalOrders >= 12) return 0.88;
  if (sampleDays >= 2 && totalOrders >= 6) return 0.74;
  if (sampleDays >= 1 && totalOrders >= 2) return 0.58;
  return 0.42;
}

/**
 * Build per-channel today forecasts from recent order history.
 * Uses same-weekday averages over the lookback window; compares to orders so far today.
 */
export function buildChannelTodayForecasts(
  rows: ChannelOrderRow[],
  now = new Date(),
): ChannelTodayForecast[] {
  const todayStart = startOfDay(now);
  const todayIso = isoDate(todayStart);
  const weekday = todayStart.getDay();
  const lastWeekStart = new Date(todayStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekIso = isoDate(lastWeekStart);

  type DayAgg = { orders: number; revenue: number };
  const byChannelWeekday = new Map<AnalyticsChannel, DayAgg[]>();
  const byChannelToday = new Map<AnalyticsChannel, DayAgg>();
  const byChannelLastWeek = new Map<AnalyticsChannel, DayAgg>();

  for (const channel of ANALYTICS_CHANNEL_VALUES) {
    byChannelWeekday.set(channel, []);
    byChannelToday.set(channel, { orders: 0, revenue: 0 });
    byChannelLastWeek.set(channel, { orders: 0, revenue: 0 });
  }

  const weekdaySamples = new Map<AnalyticsChannel, Set<string>>();

  for (const row of rows) {
    const channel = channelOf(row);
    const day = startOfDay(row.createdAt);
    const dayIso = isoDate(day);
    const revenue = Number(row.total ?? 0);

    if (dayIso === todayIso) {
      const cur = byChannelToday.get(channel)!;
      cur.orders += 1;
      cur.revenue += revenue;
      continue;
    }

    if (dayIso === lastWeekIso) {
      const cur = byChannelLastWeek.get(channel)!;
      cur.orders += 1;
      cur.revenue += revenue;
    }

    if (day.getDay() === weekday && day < todayStart) {
      const samples = weekdaySamples.get(channel) ?? new Set<string>();
      samples.add(dayIso);
      weekdaySamples.set(channel, samples);
      const list = byChannelWeekday.get(channel)!;
      list.push({ orders: 1, revenue });
    }
  }

  const forecasts: ChannelTodayForecast[] = [];

  for (const channel of ANALYTICS_CHANNEL_VALUES) {
    const samples = byChannelWeekday.get(channel) ?? [];
    const sampleDayCount = weekdaySamples.get(channel)?.size ?? 0;
    const totalSampleOrders = samples.length;
    const actual = byChannelToday.get(channel)!;
    const lastWeek = byChannelLastWeek.get(channel)!;

    if (totalSampleOrders === 0 && actual.orders === 0 && lastWeek.orders === 0) {
      continue;
    }

    const avgOrders =
      sampleDayCount > 0
        ? samples.reduce((s, v) => s + v.orders, 0) / sampleDayCount
        : actual.orders > 0
          ? actual.orders
          : lastWeek.orders;
    const avgRevenue =
      sampleDayCount > 0
        ? samples.reduce((s, v) => s + v.revenue, 0) / sampleDayCount
        : actual.revenue > 0
          ? actual.revenue
          : lastWeek.revenue;

    const predictedOrders = Math.max(round0(avgOrders), actual.orders);
    const predictedRevenue = round2(Math.max(avgRevenue, actual.revenue));

    let trendVsLastWeek: number | null = null;
    if (lastWeek.orders > 0) {
      trendVsLastWeek = round0(((predictedOrders - lastWeek.orders) / lastWeek.orders) * 100);
    } else if (predictedOrders > 0) {
      trendVsLastWeek = 100;
    }

    const confidence = confidenceFromSamples(sampleDayCount, totalSampleOrders);
    const label = ANALYTICS_CHANNEL_LABEL[channel];
    const pace =
      actual.orders >= predictedOrders
        ? "on or ahead of pace"
        : `${predictedOrders - actual.orders} more order${predictedOrders - actual.orders === 1 ? "" : "s"} expected`;

    forecasts.push({
      channel,
      label,
      predictedOrders,
      predictedRevenue,
      actualOrdersSoFar: actual.orders,
      actualRevenueSoFar: round2(actual.revenue),
      trendVsLastWeek,
      confidence,
      message: `AI-assisted: ${label} — ~${predictedOrders} orders (${pace}) · $${predictedRevenue.toLocaleString()} forecast.`,
    });
  }

  return forecasts.sort((a, b) => b.predictedRevenue - a.predictedRevenue);
}

export function sumChannelTodayForecastTotals(forecasts: ChannelTodayForecast[]): {
  predictedOrders: number;
  predictedRevenue: number;
  actualOrders: number;
  actualRevenue: number;
} {
  return forecasts.reduce(
    (acc, row) => ({
      predictedOrders: acc.predictedOrders + row.predictedOrders,
      predictedRevenue: round2(acc.predictedRevenue + row.predictedRevenue),
      actualOrders: acc.actualOrders + row.actualOrdersSoFar,
      actualRevenue: round2(acc.actualRevenue + row.actualRevenueSoFar),
    }),
    { predictedOrders: 0, predictedRevenue: 0, actualOrders: 0, actualRevenue: 0 },
  );
}
