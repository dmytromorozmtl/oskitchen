import { createHmac, timingSafeEqual } from "crypto";

import { FulfillmentType, IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";

export type DoorDashMarketplaceCredentials = {
  apiKey?: string | null;
  merchantId?: string | null;
};

const MARKETPLACE_API_BASE =
  process.env.DOORDASH_MARKETPLACE_API_BASE ?? "https://openapi.doordash.com/marketplace/v2";

function mapDoorDashStatus(raw: Record<string, unknown>): NormalizedOrderStatus {
  const status = String(raw.status ?? raw.order_status ?? raw.event_type ?? "").toLowerCase();
  if (status.includes("cancel")) return NormalizedOrderStatus.CANCELLED;
  if (status.includes("complete") || status.includes("delivered")) {
    return NormalizedOrderStatus.COMPLETED;
  }
  if (status.includes("ready") || status.includes("confirmed")) {
    return NormalizedOrderStatus.CONFIRMED;
  }
  return NormalizedOrderStatus.OPEN;
}

function moneyToMajor(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return n >= 1000 ? n / 100 : n;
}

function unwrapOrderPayload(raw: Record<string, unknown>): Record<string, unknown> {
  const nested = raw.order;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return raw;
}

/** Map DoorDash Marketplace / webhook order JSON → canonical kitchen order. */
export function normalizeDoorDashOrder(raw: Record<string, unknown>): NormalizedKitchenOrder {
  const order = unwrapOrderPayload(raw);
  const id = String(order.id ?? order.external_order_id ?? order.order_id ?? "unknown");
  const customer = (order.customer ?? order.consumer ?? {}) as Record<string, unknown>;
  const delivery = (order.delivery ?? order.delivery_address ?? {}) as Record<string, unknown>;
  const items = (order.items ?? order.line_items ?? order.order_items ?? []) as Record<
    string,
    unknown
  >[];

  const deliveryAddress =
    typeof delivery.address === "string"
      ? { formatted: delivery.address }
      : Object.keys(delivery).length > 0
        ? delivery
        : null;

  const fulfillment: FulfillmentType = deliveryAddress ? "DELIVERY" : "PICKUP";
  const total = moneyToMajor(order.total ?? order.order_value ?? order.subtotal);

  return {
    provider: IntegrationProvider.DOORDASH,
    externalOrderId: id,
    externalOrderNumber: order.display_id != null ? String(order.display_id) : id,
    sourceStatus:
      order.status != null
        ? String(order.status)
        : raw.event_type != null
          ? String(raw.event_type)
          : null,
    normalizedStatus: mapDoorDashStatus(order.status != null ? order : raw),
    customer: {
      name:
        customer.name != null
          ? String(customer.name)
          : [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() || null,
      email:
        customer.email != null
          ? String(customer.email)
          : `doordash+${id.slice(0, 24)}@import.local`,
      phone: customer.phone != null ? String(customer.phone) : null,
    },
    lineItems: items.map((item, index) => ({
      externalLineId: item.id != null ? String(item.id) : `line-${index + 1}`,
      sku: item.sku != null ? String(item.sku) : item.external_id != null ? String(item.external_id) : null,
      title: String(item.name ?? item.title ?? "Item"),
      quantity: Number(item.quantity ?? 1),
      unitPrice: moneyToMajor(item.price ?? item.unit_price),
      notes: item.special_instructions != null ? String(item.special_instructions) : null,
    })),
    notes: order.special_instructions != null ? String(order.special_instructions) : null,
    fulfillment: {
      type: fulfillment,
      pickupTime: null,
      deliveryTime: null,
      deliveryAddress,
    },
    totals: {
      subtotal: moneyToMajor(order.subtotal),
      tax: moneyToMajor(order.tax),
      deliveryFee: moneyToMajor(order.delivery_fee ?? order.delivery_fee_amount),
      total,
      currency: order.currency != null ? String(order.currency) : "USD",
    },
    raw,
  };
}

/** Verify DoorDash webhook HMAC (hex, base64, or `v1=` prefixed digest). */
export function verifyDoorDashWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  const secretTrim = secret.trim();
  if (!secretTrim || !signatureHeader.trim()) return false;

  let sigTrim = signatureHeader.trim();
  const v1Match = sigTrim.match(/v1=([a-f0-9]+)/i);
  if (v1Match) sigTrim = v1Match[1]!;
  sigTrim = sigTrim.replace(/^sha256=/i, "");

  const digest = createHmac("sha256", secretTrim).update(rawBody, "utf8").digest();
  const digestHex = digest.toString("hex");

  if (sigTrim.length === digestHex.length) {
    try {
      if (timingSafeEqual(Buffer.from(sigTrim, "utf8"), Buffer.from(digestHex, "utf8"))) {
        return true;
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const sigHex = Buffer.from(sigTrim, "hex");
    if (sigHex.length === digest.length && timingSafeEqual(sigHex, digest)) {
      return true;
    }
  } catch {
    /* fall through */
  }

  try {
    const sigB64 = Buffer.from(sigTrim, "base64");
    if (sigB64.length === digest.length && timingSafeEqual(sigB64, digest)) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function fetchDoorDashMarketplaceOrders(
  creds: DoorDashMarketplaceCredentials,
): Promise<Record<string, unknown>[]> {
  const apiKey = creds.apiKey?.trim();
  const merchantId = creds.merchantId?.trim();
  if (!apiKey || !merchantId) {
    throw new Error("DoorDash API key and merchant ID are required.");
  }

  const url = `${MARKETPLACE_API_BASE}/stores/${encodeURIComponent(merchantId)}/orders`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`DoorDash marketplace fetch failed (${res.status})`);
  }

  const json = (await res.json()) as { orders?: Record<string, unknown>[] };
  return json.orders ?? [];
}
