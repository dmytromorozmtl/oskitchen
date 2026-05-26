import type { StorefrontFulfillmentRule } from "@prisma/client";
import { toJsonValue } from "@/lib/prisma/json";
import { format, startOfDay } from "date-fns";

export type FulfillmentRuleCheckInput = {
  fulfillmentType: "PICKUP" | "DELIVERY";
  fulfillmentDate: Date;
  productIds: string[];
  subtotal: number;
  /** From delivery zone match — used by ZONE_SPECIFIC_MINIMUM when rule scopes by zone */
  matchedZoneName?: string | null;
  /** Server time at order placement (for same-day cutoff rules) */
  orderingNow?: Date;
};

export type FulfillmentRuleCheckResult = {
  allowed: boolean;
  blockers: string[];
  warnings: string[];
};

type RuleDoc = Record<string, unknown>;

function isoDay(d: Date): string {
  return format(startOfDay(d), "yyyy-MM-dd");
}

function ymdInTimeZone(d: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return isoDay(d);
  }
}

function hhmmInTimeZone(d: Date, timeZone: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const h = parts.find((p) => p.type === "hour")?.value ?? "";
    const m = parts.find((p) => p.type === "minute")?.value ?? "";
    if (!h || !m) return null;
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  } catch {
    return null;
  }
}

function compareHHmm(a: string, b: string): number {
  const [ah, am] = a.split(":").map((x) => parseInt(x, 10));
  const [bh, bm] = b.split(":").map((x) => parseInt(x, 10));
  if (!Number.isFinite(ah) || !Number.isFinite(am) || !Number.isFinite(bh) || !Number.isFinite(bm)) return 0;
  return ah * 60 + am - (bh * 60 + bm);
}

function asStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function canonicalRuleType(raw: string): string {
  const t = raw.trim();
  const u = t.toUpperCase().replace(/-/g, "_");
  const map: Record<string, string> = {
    HOLIDAY_CLOSURE: "closure_dates",
    PICKUP_ONLY_DATE: "pickup_only_dates",
    PICKUP_ONLY_DATES: "pickup_only_dates",
    DELIVERY_DISABLED_DATE: "delivery_blocked_dates",
    DELIVERY_DISABLED_DATES: "delivery_blocked_dates",
    PRODUCT_UNAVAILABLE_BY_DATE: "product_blocked_dates",
    MAX_ORDERS_FOR_DATE: "max_orders_date",
    MAX_ORDERS_FOR_WINDOW: "max_orders_window",
    ZONE_SPECIFIC_MINIMUM: "zone_minimum",
    FULFILLMENT_METHOD_RESTRICTION: "fulfillment_method_restriction",
    ORDER_MINIMUM_BY_FULFILLMENT: "order_minimum_by_fulfillment",
    PRODUCT_SPECIFIC_CUTOFF: "product_specific_cutoff",
    DELIVERY_ZONE_SURCHARGE: "delivery_zone_surcharge",
  };
  return map[u] ?? t;
}

/**
 * Evaluates saved `StorefrontFulfillmentRule` rows (JSON `rulesJson`).
 * Supports legacy snake_case `type` values and uppercase spec aliases.
 */
export function evaluateFulfillmentRulesJson(
  rules: Pick<StorefrontFulfillmentRule, "rulesJson" | "label" | "priority">[],
  input: FulfillmentRuleCheckInput,
  opts: {
    orderCountForDay: (day: string) => Promise<number>;
    orderCountBetween: (from: Date, to: Date) => Promise<number>;
    storefrontTimeZone: string;
  },
): Promise<FulfillmentRuleCheckResult> {
  return evaluateFulfillmentRulesJsonAsync(rules, input, opts);
}

async function evaluateFulfillmentRulesJsonAsync(
  rules: Pick<StorefrontFulfillmentRule, "rulesJson" | "label" | "priority">[],
  input: FulfillmentRuleCheckInput,
  opts: {
    orderCountForDay: (day: string) => Promise<number>;
    orderCountBetween: (from: Date, to: Date) => Promise<number>;
    storefrontTimeZone: string;
  },
): Promise<FulfillmentRuleCheckResult> {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const day = isoDay(input.fulfillmentDate);
  const tz = opts.storefrontTimeZone || "UTC";
  const now = input.orderingNow ?? new Date();
  const fulfillmentYmd = ymdInTimeZone(input.fulfillmentDate, tz);
  const todayYmd = ymdInTimeZone(now, tz);
  const nowHm = hhmmInTimeZone(now, tz);

  const sorted = [...rules]
    .filter((r) => (r as { active?: boolean }).active !== false)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const row of sorted) {
    const raw = row.rulesJson;
    if (!raw || typeof raw !== "object") continue;
    const doc = raw as RuleDoc;
    if (doc.disabled === true) continue;
    const rawType = typeof doc.type === "string" ? doc.type : "";
    const t = canonicalRuleType(rawType);

    if (t === "closure_dates") {
      const dates = asStrArray(doc.dates);
      if (dates.includes(day)) {
        blockers.push(
          typeof doc.message === "string" && doc.message.trim()
            ? doc.message.trim()
            : "Online ordering is not available on this date.",
        );
      }
    } else if (t === "pickup_only_dates") {
      const dates = asStrArray(doc.dates);
      if (input.fulfillmentType === "DELIVERY" && dates.includes(day)) {
        blockers.push(
          typeof doc.message === "string" && doc.message.trim()
            ? doc.message.trim()
            : "Delivery is disabled on this date.",
        );
      }
    } else if (t === "delivery_blocked_dates") {
      const dates = asStrArray(doc.dates);
      if (input.fulfillmentType === "DELIVERY" && dates.includes(day)) {
        blockers.push(
          typeof doc.message === "string" && doc.message.trim()
            ? doc.message.trim()
            : "Delivery is disabled on this date.",
        );
      }
    } else if (t === "product_blocked_dates") {
      const entries = Array.isArray(doc.entries) ? doc.entries : [];
      for (const e of entries) {
        if (!e || typeof e !== "object") continue;
        const ent = e as Record<string, unknown>;
        const pid = typeof ent.productId === "string" ? ent.productId : "";
        const dates = asStrArray(ent.dates);
        if (pid && input.productIds.includes(pid) && dates.includes(day)) {
          blockers.push("This product is unavailable for the selected date.");
        }
      }
    } else if (t === "max_orders_date") {
      const d = typeof doc.date === "string" ? doc.date : "";
      const max = typeof doc.max === "number" ? doc.max : doc.max != null ? Number(doc.max) : NaN;
      if (d === day && Number.isFinite(max) && max >= 0) {
        const cnt = await opts.orderCountForDay(d);
        if (cnt >= max) {
          blockers.push(
            typeof doc.message === "string" && doc.message.trim()
              ? doc.message.trim()
              : "This time window is full.",
          );
        }
      }
    } else if (t === "max_orders_window") {
      const startRaw = typeof doc.start === "string" ? doc.start : "";
      const endRaw = typeof doc.end === "string" ? doc.end : "";
      const max = typeof doc.max === "number" ? doc.max : doc.max != null ? Number(doc.max) : NaN;
      const from = startRaw ? new Date(startRaw) : null;
      const to = endRaw ? new Date(endRaw) : null;
      if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        warnings.push(`Rule "${row.label}" (MAX_ORDERS_FOR_WINDOW) is missing valid start/end — not enforced.`);
      } else if (!Number.isFinite(max) || max < 0) {
        warnings.push(`Rule "${row.label}" (MAX_ORDERS_FOR_WINDOW) has invalid max — not enforced.`);
      } else {
        const cnt = await opts.orderCountBetween(from, to);
        if (cnt >= max) {
          blockers.push(
            typeof doc.message === "string" && doc.message.trim()
              ? doc.message.trim()
              : "This time window is full.",
          );
        }
      }
    } else if (t === "zone_minimum") {
      const min = typeof doc.minimumOrder === "number" ? doc.minimumOrder : doc.minimumOrder != null ? Number(doc.minimumOrder) : NaN;
      const zoneNeedle = typeof doc.zoneName === "string" ? doc.zoneName.trim() : "";
      const zoneMatches =
        !zoneNeedle ||
        (input.matchedZoneName && input.matchedZoneName.toLowerCase() === zoneNeedle.toLowerCase());
      if (!Number.isFinite(min)) {
        warnings.push(`Rule "${row.label}" (ZONE_SPECIFIC_MINIMUM) has invalid minimum — not enforced.`);
      } else if (zoneNeedle && !input.matchedZoneName) {
        warnings.push(
          `Rule "${row.label}" targets zone "${zoneNeedle}" but no delivery zone was matched for this address — minimum not enforced server-side.`,
        );
      } else if (zoneNeedle && input.matchedZoneName && !zoneMatches) {
        /* different zone — rule does not apply */
      } else if (zoneNeedle && zoneMatches && input.fulfillmentType === "DELIVERY" && input.subtotal < min) {
        blockers.push(
          typeof doc.message === "string" && doc.message.trim()
            ? doc.message.trim()
            : `This delivery zone requires a minimum order of $${min.toFixed(2)}.`,
        );
      } else if (!zoneNeedle && Number.isFinite(min) && input.subtotal < min) {
        blockers.push(
          typeof doc.message === "string" && doc.message.trim()
            ? doc.message.trim()
            : `This delivery zone requires a minimum order of $${min.toFixed(2)}.`,
        );
      }
    } else if (t === "fulfillment_method_restriction") {
      const dates = asStrArray(doc.dates);
      const blocked = asStrArray(doc.blockedMethods ?? doc.blocked);
      const applies = dates.length === 0 || dates.includes(day);
      if (!applies) continue;
      const blockPickup = blocked.some((x) => x.toUpperCase() === "PICKUP");
      const blockDelivery = blocked.some((x) => x.toUpperCase() === "DELIVERY");
      if (blockPickup && input.fulfillmentType === "PICKUP") {
        blockers.push(
          typeof doc.message === "string" && doc.message.trim()
            ? doc.message.trim()
            : "Pickup is not available on this date.",
        );
      }
      if (blockDelivery && input.fulfillmentType === "DELIVERY") {
        blockers.push(
          typeof doc.message === "string" && doc.message.trim()
            ? doc.message.trim()
            : "Delivery is disabled on this date.",
        );
      }
      if (!blockPickup && !blockDelivery) {
        warnings.push(`Rule "${row.label}" (FULFILLMENT_METHOD_RESTRICTION) has no blockedMethods — not enforced.`);
      }
    } else if (t === "order_minimum_by_fulfillment") {
      const pickupMin =
        typeof doc.pickupMin === "number" ? doc.pickupMin : doc.pickupMin != null ? Number(doc.pickupMin) : NaN;
      const deliveryMin =
        typeof doc.deliveryMin === "number" ? doc.deliveryMin : doc.deliveryMin != null ? Number(doc.deliveryMin) : NaN;
      if (input.fulfillmentType === "PICKUP" && Number.isFinite(pickupMin) && input.subtotal < pickupMin) {
        blockers.push(
          typeof doc.message === "string" && doc.message.trim()
            ? doc.message.trim()
            : `This fulfillment method requires a minimum order of $${pickupMin.toFixed(2)}.`,
        );
      }
      if (input.fulfillmentType === "DELIVERY" && Number.isFinite(deliveryMin) && input.subtotal < deliveryMin) {
        blockers.push(
          typeof doc.message === "string" && doc.message.trim()
            ? doc.message.trim()
            : `This fulfillment method requires a minimum order of $${deliveryMin.toFixed(2)}.`,
        );
      }
      if (!Number.isFinite(pickupMin) && !Number.isFinite(deliveryMin)) {
        warnings.push(`Rule "${row.label}" (ORDER_MINIMUM_BY_FULFILLMENT) has no valid pickupMin/deliveryMin — not enforced.`);
      }
    } else if (t === "product_specific_cutoff") {
      const entries = Array.isArray(doc.entries) ? doc.entries : [];
      for (const e of entries) {
        if (!e || typeof e !== "object") continue;
        const ent = e as Record<string, unknown>;
        const pid = typeof ent.productId === "string" ? ent.productId : "";
        const dates = asStrArray(ent.dates);
        const cutoff = typeof ent.cutoffTime === "string" ? ent.cutoffTime.trim() : "";
        if (!pid || !input.productIds.includes(pid) || !dates.includes(day)) continue;
        if (!/^\d{1,2}:\d{2}$/.test(cutoff)) {
          warnings.push(`Rule "${row.label}" product cutoff for ${pid} has invalid cutoffTime — not enforced.`);
          continue;
        }
        if (fulfillmentYmd !== todayYmd) {
          continue;
        }
        if (!nowHm) {
          warnings.push(`Rule "${row.label}" could not read storefront local time — cutoff not enforced.`);
          continue;
        }
        if (compareHHmm(nowHm, cutoff) > 0) {
          blockers.push("This product is unavailable for the selected date.");
        }
      }
    } else if (t === "delivery_zone_surcharge") {
      warnings.push(
        `Rule "${row.label}" (DELIVERY_ZONE_SURCHARGE): automatic surcharges are not applied in checkout yet — configure delivery fee manually or extend pricing.`,
      );
    } else if (rawType) {
      warnings.push(`Rule "${row.label}" has unknown type "${rawType}" — not executed by this engine.`);
    }
  }

  return { allowed: blockers.length === 0, blockers, warnings };
}

/** One-line summary for admin lists (no execution). */
export function summarizeFulfillmentRuleJson(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "Empty rule JSON.";
  const doc = raw as Record<string, unknown>;
  if (doc.disabled === true) return "Disabled.";
  const rawType = typeof doc.type === "string" ? doc.type : "";
  const t = canonicalRuleType(rawType);
  switch (t) {
    case "closure_dates":
      return `Holiday / closure on ${Array.isArray(doc.dates) ? asStrArray(doc.dates).join(", ") : "listed dates"}.`;
    case "pickup_only_dates":
      return "Pickup-only (delivery blocked) on listed dates.";
    case "delivery_blocked_dates":
      return "Delivery disabled on listed dates.";
    case "product_blocked_dates":
      return "Product unavailable on listed dates.";
    case "max_orders_date":
      return `Max orders for ${String(doc.date ?? "?")}.`;
    case "max_orders_window":
      return `Max orders in window ${String(doc.start ?? "?")} → ${String(doc.end ?? "?")}.`;
    case "zone_minimum":
      return `Zone minimum (${String(doc.zoneName ?? "any zone")}) ${String(doc.minimumOrder ?? "?")}.`;
    case "fulfillment_method_restriction":
      return `Method restriction: ${asStrArray(doc.blockedMethods ?? doc.blocked).join(", ") || "—"}.`;
    case "order_minimum_by_fulfillment":
      return `Minimums pickup ${String(doc.pickupMin ?? "—")} / delivery ${String(doc.deliveryMin ?? "—")}.`;
    case "product_specific_cutoff":
      return "Per-product same-day cutoff times.";
    case "delivery_zone_surcharge":
      return "Delivery zone surcharge (warning only — not auto-priced).";
    default:
      return rawType ? `Type “${rawType}” (see JSON).` : "No type field — check JSON.";
  }
}

export type FulfillmentRuleAdminHint = {
  summary: string;
  enforcement: "enforced" | "warning_only" | "invalid";
  detail: string[];
};

const KNOWN = new Set([
  "closure_dates",
  "pickup_only_dates",
  "delivery_blocked_dates",
  "product_blocked_dates",
  "max_orders_date",
  "max_orders_window",
  "zone_minimum",
  "fulfillment_method_restriction",
  "order_minimum_by_fulfillment",
  "product_specific_cutoff",
  "delivery_zone_surcharge",
]);

export function describeFulfillmentRuleForAdmin(raw: unknown): FulfillmentRuleAdminHint {
  const detail: string[] = [];
  if (!raw || typeof raw !== "object") {
    return { summary: "Invalid", enforcement: "invalid", detail: ["rulesJson must be an object."] };
  }
  const doc = raw as Record<string, unknown>;
  const summary = summarizeFulfillmentRuleJson(raw);
  const rawType = typeof doc.type === "string" ? doc.type : "";
  const t = canonicalRuleType(rawType);

  if (!rawType) {
    return { summary, enforcement: "invalid", detail: ["Missing type."] };
  }

  if (!KNOWN.has(t)) {
    return { summary, enforcement: "warning_only", detail: [`Unknown type "${rawType}" — not executed by the engine.`] };
  }

  if (t === "delivery_zone_surcharge") {
    return { summary, enforcement: "warning_only", detail: ["Surcharge is not applied automatically in checkout."] };
  }

  if (t === "max_orders_window") {
    const from = typeof doc.start === "string" ? doc.start : "";
    const to = typeof doc.end === "string" ? doc.end : "";
    const max = doc.max;
    if (!from || !to || !Number.isFinite(Number(max))) {
      return { summary, enforcement: "invalid", detail: ["Requires ISO start, end, and numeric max."] };
    }
  }

  if (t === "zone_minimum") {
    const min = doc.minimumOrder;
    if (!Number.isFinite(Number(min))) {
      return { summary, enforcement: "invalid", detail: ["minimumOrder must be a number."] };
    }
    detail.push("With zoneName: enforced for delivery when the address matches that zone. Without zoneName: applies to all orders (legacy).");
  }

  if (t === "product_specific_cutoff") {
    detail.push("Enforced only when fulfillment date is “today” in storefront timezone and cutoffTime is HH:mm.");
  }

  return { summary, enforcement: "enforced", detail };
}
