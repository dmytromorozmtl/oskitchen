import { FulfillmentType, IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import type { UberEatsCredentials } from "@/services/integrations/uber-eats";

const ORDERS_API_BASE =
  process.env.UBER_EATS_ORDERS_API_BASE ?? "https://api.uber.com/v2/eats/stores";

function mapUberStatus(raw: Record<string, unknown>): NormalizedOrderStatus {
  const state = String(raw.state ?? raw.status ?? raw.event_type ?? "").toUpperCase();
  if (state.includes("CANCEL")) return NormalizedOrderStatus.CANCELLED;
  if (state.includes("COMPLETED") || state.includes("DELIVERED")) {
    return NormalizedOrderStatus.COMPLETED;
  }
  if (state.includes("READY") || state.includes("ACCEPTED") || state.includes("CONFIRMED")) {
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
  const meta = raw.meta;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const user = (meta as { user_id?: string }).user_id;
    if (user) return raw;
  }
  const nested = raw.order ?? raw.resource;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return raw;
}

/** Map Uber Eats Marketplace webhook / poll JSON → canonical kitchen order. */
export function normalizeUberEatsMarketplaceOrder(
  raw: Record<string, unknown>,
): NormalizedKitchenOrder {
  const order = unwrapOrderPayload(raw);
  const id = String(order.id ?? order.uuid ?? order.order_id ?? "unknown");
  const eater = (order.eater ?? order.customer ?? order.consumer ?? {}) as Record<
    string,
    unknown
  >;
  const cart = (order.cart ?? order.order_cart ?? {}) as Record<string, unknown>;
  const items = (cart.items ??
    order.items ??
    order.line_items ??
    []) as Record<string, unknown>[];
  const delivery = (order.delivery ?? order.deliveries ?? {}) as Record<string, unknown>;
  const location = (delivery.location ?? delivery.address ?? {}) as Record<string, unknown>;

  const deliveryAddress =
    typeof location.formatted_address === "string"
      ? { formatted: location.formatted_address }
      : Object.keys(location).length > 0
        ? location
        : null;

  const fulfillment: FulfillmentType =
    order.type === "DELIVERY" || deliveryAddress ? "DELIVERY" : "PICKUP";
  const payment = (order.payment ?? order.charges ?? {}) as Record<string, unknown>;
  const total = moneyToMajor(
    payment.total ?? payment.order_total ?? order.total ?? order.current_state,
  );

  return {
    provider: IntegrationProvider.UBER_EATS,
    externalOrderId: id,
    externalOrderNumber:
      order.display_id != null
        ? String(order.display_id)
        : order.external_reference_id != null
          ? String(order.external_reference_id)
          : id,
    sourceStatus: order.state != null ? String(order.state) : null,
    normalizedStatus: mapUberStatus(order),
    customer: {
      name:
        eater.first_name != null || eater.last_name != null
          ? [eater.first_name, eater.last_name].filter(Boolean).join(" ").trim()
          : eater.name != null
            ? String(eater.name)
            : null,
      email:
        eater.email != null
          ? String(eater.email)
          : `uber-eats+${id.slice(0, 24)}@import.local`,
      phone: eater.phone != null ? String(eater.phone) : null,
    },
    lineItems: items.map((item, index) => {
      const titleObj = item.title as { translations?: { en_us?: string } } | string | undefined;
      const title =
        typeof titleObj === "string"
          ? titleObj
          : titleObj?.translations?.en_us ?? String(item.name ?? "Item");
      const price = (item.price as { unit_price?: number; amount?: number }) ?? item.unit_price;
      return {
        externalLineId: item.id != null ? String(item.id) : `line-${index + 1}`,
        sku: item.external_data != null ? String(item.external_data) : null,
        title,
        quantity: Number(item.quantity ?? 1),
        unitPrice: moneyToMajor(
          typeof price === "object" ? price?.unit_price ?? price?.amount : price,
        ),
        notes: item.special_instructions != null ? String(item.special_instructions) : null,
      };
    }),
    notes: order.special_instructions != null ? String(order.special_instructions) : null,
    fulfillment: {
      type: fulfillment,
      pickupTime: null,
      deliveryTime: null,
      deliveryAddress,
    },
    totals: {
      subtotal: moneyToMajor(payment.sub_total ?? payment.subtotal),
      tax: moneyToMajor(payment.tax),
      deliveryFee: moneyToMajor(payment.delivery_fee),
      total,
      currency: payment.currency_code != null ? String(payment.currency_code) : "USD",
    },
    raw,
  };
}

async function getUberAccessToken(creds: UberEatsCredentials): Promise<string | null> {
  if (!creds.clientId?.trim() || !creds.clientSecret?.trim()) return null;
  const tokenUrl = process.env.UBER_EATS_TOKEN_URL ?? "https://login.uber.com/oauth/v2/token";
  const body = new URLSearchParams({
    client_id: creds.clientId.trim(),
    client_secret: creds.clientSecret.trim(),
    grant_type: "client_credentials",
    scope: "eats.order eats.store",
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

export async function fetchUberEatsMarketplaceOrders(
  creds: UberEatsCredentials,
  storeId: string,
): Promise<Record<string, unknown>[]> {
  const token = await getUberAccessToken(creds);
  const sid = storeId.trim() || creds.storeId?.trim();
  if (!token || !sid) {
    throw new Error("Uber Eats OAuth token or store ID missing.");
  }

  const res = await fetch(`${ORDERS_API_BASE}/${encodeURIComponent(sid)}/orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Uber Eats orders fetch failed (${res.status})`);
  }

  const json = (await res.json()) as { orders?: Record<string, unknown>[] };
  return json.orders ?? [];
}
