import { createHmac, timingSafeEqual } from "crypto";

import { FulfillmentType, IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";

export type SkipMarketplaceCredentials = {
  clientId?: string | null;
  clientSecret?: string | null;
  restaurantId?: string | null;
};

const MARKETPLACE_API_BASE =
  process.env.SKIP_MARKETPLACE_API_BASE ?? "https://api-partner.skip.com/v1";

function mapSkipStatus(raw: Record<string, unknown>): NormalizedOrderStatus {
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
  const nested = raw.order ?? raw.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return raw;
}

/** Map Skip / Just Eat webhook or poll JSON → canonical kitchen order. */
export function normalizeSkipOrder(raw: Record<string, unknown>): NormalizedKitchenOrder {
  const order = unwrapOrderPayload(raw);
  const id = String(order.id ?? order.order_id ?? order.uuid ?? "unknown");
  const customer = (order.customer ?? order.consumer ?? {}) as Record<string, unknown>;
  const delivery = (order.delivery ?? order.fulfillment ?? {}) as Record<string, unknown>;
  const items = (order.items ?? order.line_items ?? order.products ?? []) as Record<
    string,
    unknown
  >[];
  const totals = (order.totals ?? order.payment ?? order.charges ?? {}) as Record<string, unknown>;

  const deliveryAddress =
    typeof delivery.address === "string"
      ? { formatted: delivery.address }
      : delivery.formatted_address != null
        ? { formatted: String(delivery.formatted_address) }
        : Object.keys(delivery).length > 0
          ? delivery
          : null;

  const fulfillment: FulfillmentType = deliveryAddress ? "DELIVERY" : "PICKUP";
  const total = moneyToMajor(totals.total ?? totals.grand_total ?? order.total);

  return {
    provider: IntegrationProvider.SKIP,
    externalOrderId: id,
    externalOrderNumber:
      order.display_id != null
        ? String(order.display_id)
        : order.order_number != null
          ? String(order.order_number)
          : id,
    sourceStatus: order.status != null ? String(order.status) : null,
    normalizedStatus: mapSkipStatus(order),
    customer: {
      name:
        customer.name != null
          ? String(customer.name)
          : [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() || null,
      email:
        customer.email != null
          ? String(customer.email)
          : `skip+${id.slice(0, 24)}@import.local`,
      phone: customer.phone != null ? String(customer.phone) : null,
    },
    lineItems: items.map((item, index) => ({
      externalLineId: item.id != null ? String(item.id) : `line-${index + 1}`,
      sku: item.sku != null ? String(item.sku) : null,
      title: String(item.name ?? item.title ?? "Item"),
      quantity: Number(item.quantity ?? 1),
      unitPrice: moneyToMajor(item.price ?? item.unit_price),
      notes: item.notes != null ? String(item.notes) : null,
    })),
    notes: order.notes != null ? String(order.notes) : null,
    fulfillment: {
      type: fulfillment,
      pickupTime: null,
      deliveryTime: null,
      deliveryAddress,
    },
    totals: {
      subtotal: moneyToMajor(totals.subtotal),
      tax: moneyToMajor(totals.tax),
      deliveryFee: moneyToMajor(totals.delivery_fee),
      total,
      currency: totals.currency != null ? String(totals.currency) : null,
    },
    raw: order,
  };
}

export function verifySkipWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  const secretTrim = secret.trim();
  const sigTrim = signatureHeader.trim().replace(/^sha256=/i, "");
  if (!secretTrim || !sigTrim) return false;

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
    return false;
  }

  return false;
}

export async function fetchSkipMarketplaceOrders(
  creds: SkipMarketplaceCredentials,
): Promise<Record<string, unknown>[]> {
  const token = await skipAccessToken(creds);
  const restaurantId = creds.restaurantId?.trim();
  if (!token || !restaurantId) {
    throw new Error("Skip OAuth token and restaurant ID are required.");
  }

  const res = await fetch(
    `${MARKETPLACE_API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/orders`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Skip marketplace fetch failed (${res.status})`);
  }

  const json = (await res.json()) as { orders?: Record<string, unknown>[] };
  return json.orders ?? [];
}

async function skipAccessToken(creds: SkipMarketplaceCredentials): Promise<string | null> {
  const clientId = creds.clientId?.trim();
  const clientSecret = creds.clientSecret?.trim();
  if (!clientId || !clientSecret) return null;

  const tokenUrl = process.env.SKIP_TOKEN_URL ?? "https://api-partner.skip.com/oauth/token";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "orders.read orders.write",
  });
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

export type SkipMarketplaceOrderStatus = "confirmed" | "ready_for_pickup" | "picked_up" | "delivered" | "cancelled";

export async function updateSkipMarketplaceOrderStatus(
  creds: SkipMarketplaceCredentials,
  orderId: string,
  status: SkipMarketplaceOrderStatus,
): Promise<{ ok: boolean; message: string }> {
  const token = await skipAccessToken(creds);
  const restaurantId = creds.restaurantId?.trim();
  if (!token || !restaurantId) {
    return { ok: false, message: "Skip credentials not configured." };
  }

  const res = await fetch(
    `${MARKETPLACE_API_BASE}/restaurants/${encodeURIComponent(restaurantId)}/orders/${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
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
      ? `Skip status updated to ${status}`
      : `Skip status update failed (${res.status})`,
  };
}
