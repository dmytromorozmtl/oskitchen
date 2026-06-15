import type { FulfillmentType } from "@prisma/client";

import { ANALYTICS_CHANNEL_VALUES, type AnalyticsChannel } from "@/lib/analytics/channel-attribution";

/**
 * Analytics URL filter contract. Everything is optional. Pure parser —
 * never throws.
 */
export type AnalyticsFilters = {
  from: Date;
  to: Date;
  channel: AnalyticsChannel | null;
  brandId: string | null;
  locationId: string | null;
  fulfillmentType: FulfillmentType | null;
  mealPlanOnly: boolean;
  cateringOnly: boolean;
};

const DEFAULT_DAYS_BACK = 30;

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

function parseDateOrNull(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function defaultFilters(now = new Date()): AnalyticsFilters {
  const to = endOfDay(now);
  const from = startOfDay(new Date(now.getTime() - DEFAULT_DAYS_BACK * 24 * 60 * 60 * 1000));
  return {
    from,
    to,
    channel: null,
    brandId: null,
    locationId: null,
    fulfillmentType: null,
    mealPlanOnly: false,
    cateringOnly: false,
  };
}

const FULFILLMENT_VALUES: FulfillmentType[] = ["PICKUP", "DELIVERY"];

export function parseAnalyticsFilters(searchParams: Record<string, string | string[] | undefined> | URLSearchParams | undefined): AnalyticsFilters {
  const sp =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams.entries())
      : searchParams ?? {};
  const get = (k: string) => {
    const v = (sp as Record<string, string | string[] | undefined>)[k];
    if (Array.isArray(v)) return v[0] ?? null;
    return v ?? null;
  };
  const defaults = defaultFilters();
  const from = parseDateOrNull(get("from")) ?? defaults.from;
  const to = parseDateOrNull(get("to")) ?? defaults.to;
  const channelRaw = get("channel");
  const channel: AnalyticsChannel | null = ANALYTICS_CHANNEL_VALUES.includes((channelRaw ?? "") as AnalyticsChannel)
    ? (channelRaw as AnalyticsChannel)
    : null;
  const fulfillmentRaw = get("fulfillment");
  const fulfillmentType: FulfillmentType | null = FULFILLMENT_VALUES.includes(
    (fulfillmentRaw ?? "") as FulfillmentType,
  )
    ? (fulfillmentRaw as FulfillmentType)
    : null;
  return {
    from: startOfDay(from),
    to: endOfDay(to),
    channel,
    brandId: get("brandId"),
    locationId: get("locationId"),
    fulfillmentType,
    mealPlanOnly: get("mealPlanOnly") === "1" || get("mealPlanOnly") === "true",
    cateringOnly: get("cateringOnly") === "1" || get("cateringOnly") === "true",
  };
}

export function serialiseFilters(f: AnalyticsFilters): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set("from", f.from.toISOString().slice(0, 10));
  sp.set("to", f.to.toISOString().slice(0, 10));
  if (f.channel) sp.set("channel", f.channel);
  if (f.brandId) sp.set("brandId", f.brandId);
  if (f.locationId) sp.set("locationId", f.locationId);
  if (f.fulfillmentType) sp.set("fulfillment", f.fulfillmentType);
  if (f.mealPlanOnly) sp.set("mealPlanOnly", "1");
  if (f.cateringOnly) sp.set("cateringOnly", "1");
  return sp;
}

export function shiftToPreviousPeriod(filters: AnalyticsFilters): AnalyticsFilters {
  const ms = filters.to.getTime() - filters.from.getTime();
  const prevTo = new Date(filters.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - ms);
  return { ...filters, from: startOfDay(prevFrom), to: endOfDay(prevTo) };
}
