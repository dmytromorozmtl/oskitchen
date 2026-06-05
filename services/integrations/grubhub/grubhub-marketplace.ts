import { createHmac, timingSafeEqual } from "crypto";

import { FulfillmentType, IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";

export type GrubhubMarketplaceCredentials = {
  apiKey?: string | null;
  merchantId?: string | null;
};

const MARKETPLACE_API_BASE =
  process.env.GRUBHUB_MARKETPLACE_API_BASE ?? "https://api-gtm.grubhub.com/v1";

function mapGrubhubStatus(raw: Record<string, unknown>): NormalizedOrderStatus {
  const status = String(raw.status ?? raw.order_status ?? raw.event_type ?? "").toLowerCase();
  if (status.includes("cancel")) return NormalizedOrderStatus.CANCELLED;
  if (status.includes("complete") || status.includes("delivered")) {
    return NormalizedOrderStatus.COMPLETED;
  }
  if (status.includes("ready") || status.includes("confirmed") || status.includes("accepted")) {
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
  const nested = raw.order ?? raw.order_data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return raw;
}

/** Map Grubhub Marketplace / webhook order JSON → canonical kitchen order. */
export function normalizeGrubhubOrder(raw: Record<string, unknown>): NormalizedKitchenOrder {
  const order = unwrapOrderPayload(raw);
  const id = String(order.uuid ?? order.id ?? order.order_id ?? "unknown");
  const customer = (order.customer ?? order.diner ?? {}) as Record<string, unknown>;
  const fulfillmentInfo = (order.fulfillment ?? order.delivery ?? {}) as Record<string, unknown>;
  const charges = (order.charges ?? order.totals ?? {}) as Record<string, unknown>;
  const items = (charges.line_items ??
    order.line_items ??
    order.items ??
    []) as Record<string, unknown>[];

  const deliveryAddress =
    typeof fulfillmentInfo.address === "string"
      ? { formatted: fulfillmentInfo.address }
      : Object.keys(fulfillmentInfo).length > 0
        ? fulfillmentInfo
        : null;

  const fulfillment: FulfillmentType = deliveryAddress ? "DELIVERY" : "PICKUP";
  const total = moneyToMajor(charges.total ?? charges.grand_total ?? order.total);

  return {
    provider: IntegrationProvider.GRUBHUB,
    externalOrderId: id,
    externalOrderNumber:
      order.order_number != null ? String(order.order_number) : order.short_id != null ? String(order.short_id) : id,
    sourceStatus: order.status != null ? String(order.status) : null,
    normalizedStatus: mapGrubhubStatus(order),
    customer: {
      name:
        customer.name != null
          ? String(customer.name)
          : [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() || null,
      email:
        customer.email != null
          ? String(customer.email)
          : `grubhub+${id.slice(0, 24)}@import.local`,
      phone: customer.phone != null ? String(customer.phone) : null,
    },
    lineItems: items.map((item, index) => ({
      externalLineId: item.id != null ? String(item.id) : `line-${index + 1}`,
      sku: item.external_id != null ? String(item.external_id) : null,
      title: String(item.name ?? item.description ?? "Item"),
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
      subtotal: moneyToMajor(charges.subtotal ?? charges.merchant_total),
      tax: moneyToMajor(charges.tax),
      deliveryFee: moneyToMajor(charges.delivery_fee),
      total,
      currency: charges.currency != null ? String(charges.currency) : "USD",
    },
    raw,
  };
}

/** Verify Grubhub webhook HMAC (hex, base64, or sha256= prefix). */
export function verifyGrubhubWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  const secretTrim = secret.trim();
  if (!secretTrim || !signatureHeader.trim()) return false;

  let sigTrim = signatureHeader.trim().replace(/^sha256=/i, "");
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

export async function fetchGrubhubMarketplaceOrders(
  creds: GrubhubMarketplaceCredentials,
): Promise<Record<string, unknown>[]> {
  const apiKey = creds.apiKey?.trim();
  const merchantId = creds.merchantId?.trim();
  if (!apiKey || !merchantId) {
    throw new Error("Grubhub API key and merchant ID are required.");
  }

  const url = `${MARKETPLACE_API_BASE}/merchants/${encodeURIComponent(merchantId)}/orders`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Grubhub marketplace fetch failed (${res.status})`);
  }

  const json = (await res.json()) as { orders?: Record<string, unknown>[] };
  return json.orders ?? [];
}

export type GrubhubMarketplaceOrderStatus =
  | "confirmed"
  | "ready_for_pickup"
  | "picked_up"
  | "delivered"
  | "cancelled";

/** Push kitchen status back to Grubhub Marketplace order API. */
export async function updateGrubhubMarketplaceOrderStatus(
  creds: GrubhubMarketplaceCredentials,
  orderId: string,
  status: GrubhubMarketplaceOrderStatus,
): Promise<{ ok: boolean; message: string }> {
  const apiKey = creds.apiKey?.trim();
  const merchantId = creds.merchantId?.trim();
  if (!apiKey || !merchantId) {
    return { ok: false, message: "Grubhub API key and merchant ID are required." };
  }

  const res = await fetch(
    `${MARKETPLACE_API_BASE}/merchants/${encodeURIComponent(merchantId)}/orders/${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ status }),
      cache: "no-store",
    },
  );

  return {
    ok: res.ok,
    message: res.ok
      ? `Grubhub status updated to ${status}`
      : `Grubhub marketplace status update failed (${res.status})`,
  };
}
