import type { FulfillmentType, OrderStatus } from "@prisma/client";

import { ANALYTICS_CHANNEL_VALUES, type AnalyticsChannel } from "@/lib/analytics/channel-attribution";

import { endOfDay, startOfDay } from "@/lib/analytics/filters";

import type { ReportFilters } from "@/lib/reports/report-types";

const DEFAULT_DAYS_BACK = 30;

function parseDateOrNull(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function defaultReportFilters(now = new Date()): ReportFilters {
  const to = endOfDay(now);
  const from = startOfDay(new Date(now.getTime() - DEFAULT_DAYS_BACK * 24 * 60 * 60 * 1000));
  return {
    from,
    to,
    brandId: null,
    locationId: null,
    channel: null,
    fulfillmentType: null,
    status: null,
    customerSegment: null,
    productId: null,
    staffMemberId: null,
    routeId: null,
    eventType: null,
  };
}

const FULFILLMENT_VALUES: FulfillmentType[] = ["PICKUP", "DELIVERY"];
const ORDER_STATUS_VALUES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export function parseReportFilters(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams | undefined,
): ReportFilters {
  const sp =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams.entries())
      : searchParams ?? {};
  const get = (k: string): string | null => {
    const v = (sp as Record<string, string | string[] | undefined>)[k];
    if (Array.isArray(v)) return v[0] ?? null;
    return v ?? null;
  };
  const defaults = defaultReportFilters();
  const preset = get("preset");
  let from = parseDateOrNull(get("from")) ?? defaults.from;
  let to = parseDateOrNull(get("to")) ?? defaults.to;
  if (preset) {
    const range = resolvePresetRange(preset, new Date());
    if (range) {
      from = range.from;
      to = range.to;
    }
  }
  const channelRaw = get("channel");
  const channel: AnalyticsChannel | null = ANALYTICS_CHANNEL_VALUES.includes(
    (channelRaw ?? "") as AnalyticsChannel,
  )
    ? (channelRaw as AnalyticsChannel)
    : null;
  const fulfillmentRaw = get("fulfillment");
  const fulfillmentType: FulfillmentType | null = FULFILLMENT_VALUES.includes(
    (fulfillmentRaw ?? "") as FulfillmentType,
  )
    ? (fulfillmentRaw as FulfillmentType)
    : null;
  const statusRaw = get("status");
  const status: OrderStatus | null = ORDER_STATUS_VALUES.includes(
    (statusRaw ?? "") as OrderStatus,
  )
    ? (statusRaw as OrderStatus)
    : null;
  return {
    from: startOfDay(from),
    to: endOfDay(to),
    brandId: get("brandId"),
    locationId: get("locationId"),
    channel,
    fulfillmentType,
    status,
    customerSegment: get("segment"),
    productId: get("productId"),
    staffMemberId: get("staffMemberId"),
    routeId: get("routeId"),
    eventType: get("eventType"),
  };
}

export function serialiseReportFilters(f: ReportFilters): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set("from", f.from.toISOString().slice(0, 10));
  sp.set("to", f.to.toISOString().slice(0, 10));
  if (f.brandId) sp.set("brandId", f.brandId);
  if (f.locationId) sp.set("locationId", f.locationId);
  if (f.channel) sp.set("channel", f.channel);
  if (f.fulfillmentType) sp.set("fulfillment", f.fulfillmentType);
  if (f.status) sp.set("status", String(f.status));
  if (f.customerSegment) sp.set("segment", f.customerSegment);
  if (f.productId) sp.set("productId", f.productId);
  if (f.staffMemberId) sp.set("staffMemberId", f.staffMemberId);
  if (f.routeId) sp.set("routeId", f.routeId);
  if (f.eventType) sp.set("eventType", f.eventType);
  return sp;
}

export function resolvePresetRange(
  preset: string,
  now = new Date(),
): { from: Date; to: Date } | null {
  const to = endOfDay(now);
  switch (preset) {
    case "7d":
      return { from: startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)), to };
    case "30d":
      return { from: startOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)), to };
    case "90d":
      return { from: startOfDay(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)), to };
    case "wtd": {
      const start = new Date(now);
      const day = start.getDay();
      const diff = (day + 6) % 7; // Monday week start
      start.setDate(start.getDate() - diff);
      return { from: startOfDay(start), to };
    }
    case "mtd":
      return { from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)), to };
    case "qtd": {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return { from: startOfDay(qStart), to };
    }
    case "ytd":
      return { from: startOfDay(new Date(now.getFullYear(), 0, 1)), to };
    default:
      return null;
  }
}

export function formatRangeLabel(f: ReportFilters): string {
  return `${f.from.toISOString().slice(0, 10)} → ${f.to.toISOString().slice(0, 10)}`;
}
