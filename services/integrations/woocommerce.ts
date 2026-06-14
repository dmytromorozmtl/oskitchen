import { createHmac, timingSafeEqual } from "crypto";

import type { FulfillmentType } from "@prisma/client";
import { IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";

export type WooCredentials = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
};

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function wooRestUrl(baseUrl: string, path: string) {
  return `${stripTrailingSlash(baseUrl)}/wp-json/wc/v3${path}`;
}

function basicAuthHeader(key: string, secret: string) {
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

export async function testConnection(creds: WooCredentials): Promise<{ ok: boolean; message: string }> {
  try {
    const url = wooRestUrl(creds.baseUrl, "/system_status");
    const res = await fetch(url, {
      headers: { Authorization: basicAuthHeader(creds.consumerKey, creds.consumerSecret) },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        message: `WooCommerce returned ${res.status}. Check URL and REST keys.`,
      };
    }
    return { ok: true, message: "Connected to WooCommerce REST API." };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    const cause =
      e instanceof Error && e.cause instanceof Error ? ` (${e.cause.message})` : "";
    return { ok: false, message: `${msg}${cause}` };
  }
}

export async function fetchProducts(creds: WooCredentials, page = 1, perPage = 50) {
  const url = new URL(wooRestUrl(creds.baseUrl, "/products"));
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  const res = await fetch(url.toString(), {
    headers: { Authorization: basicAuthHeader(creds.consumerKey, creds.consumerSecret) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Woo products ${res.status}`);
  return (await res.json()) as unknown[];
}

export async function fetchOrders(creds: WooCredentials, page = 1, perPage = 50) {
  const url = new URL(wooRestUrl(creds.baseUrl, "/orders"));
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  const res = await fetch(url.toString(), {
    headers: { Authorization: basicAuthHeader(creds.consumerKey, creds.consumerSecret) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Woo orders ${res.status}`);
  return (await res.json()) as unknown[];
}

export function normalizeWooProduct(raw: Record<string, unknown>) {
  const id = String(raw.id ?? "");
  const title = String(raw.name ?? "Product");
  const sku = raw.sku != null ? String(raw.sku) : null;
  const images = raw.images as { src?: string }[] | undefined;
  const image = images?.[0]?.src ?? null;
  const price = raw.price != null ? String(raw.price) : null;
  return {
    externalProductId: id,
    externalVariantId: "",
    title,
    sku,
    price,
    image,
    rawPayloadJson: raw,
  };
}

/** Returns managed stock quantity from Woo product webhook/REST payload. */
export function extractWooStockQuantity(raw: Record<string, unknown>): number | null {
  if (raw.manage_stock === false) return null;
  const qty = raw.stock_quantity;
  if (qty == null || qty === "") return null;
  const parsed = Number(qty);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.round(parsed));
}

function mapWooStatus(status?: string): NormalizedOrderStatus {
  switch (status) {
    case "pending":
    case "on-hold":
      return NormalizedOrderStatus.OPEN;
    case "processing":
      return NormalizedOrderStatus.PREPARING;
    case "completed":
      return NormalizedOrderStatus.COMPLETED;
    case "cancelled":
    case "refunded":
      return NormalizedOrderStatus.CANCELLED;
    default:
      return NormalizedOrderStatus.OPEN;
  }
}

export function normalizeWooOrder(raw: Record<string, unknown>): NormalizedKitchenOrder {
  const id = String(raw.id ?? "");
  const number = raw.number != null ? String(raw.number) : id;
  const status = raw.status != null ? String(raw.status) : undefined;
  const billing = (raw.billing ?? {}) as Record<string, unknown>;
  const shipping = (raw.shipping ?? {}) as Record<string, unknown>;
  const lineItems = (raw.line_items ?? []) as Record<string, unknown>[];

  const fulfillment: FulfillmentType =
    raw.shipping_lines && Array.isArray(raw.shipping_lines) && raw.shipping_lines.length > 0
      ? "DELIVERY"
      : "PICKUP";

  const deliveryAddress =
    shipping && Object.keys(shipping).length > 0 ? shipping : null;

  return {
    provider: IntegrationProvider.WOOCOMMERCE,
    externalOrderId: id,
    externalOrderNumber: number,
    sourceStatus: status ?? null,
    normalizedStatus: mapWooStatus(status),
    customer: {
      name:
        [billing.first_name, billing.last_name].filter(Boolean).join(" ").trim() ||
        (billing.company != null ? String(billing.company) : null),
      email: billing.email != null ? String(billing.email) : null,
      phone: billing.phone != null ? String(billing.phone) : null,
    },
    lineItems: lineItems.map((li) => ({
      externalLineId: li.id != null ? String(li.id) : undefined,
      sku: li.sku != null ? String(li.sku) : null,
      title: String(li.name ?? "Item"),
      quantity: Number(li.quantity ?? 1),
      unitPrice: li.price != null ? Number(li.price) : null,
      notes: li.meta_data ? JSON.stringify(li.meta_data).slice(0, 2000) : null,
    })),
    notes: raw.customer_note != null ? String(raw.customer_note) : null,
    fulfillment: {
      type: fulfillment,
      pickupTime: null,
      deliveryTime: null,
      deliveryAddress,
    },
    totals: {
      subtotal: raw.total != null ? Number(raw.total) : null,
      tax: null,
      deliveryFee: null,
      total: raw.total != null ? Number(raw.total) : null,
      currency: raw.currency != null ? String(raw.currency) : null,
    },
    raw,
  };
}

/** WooCommerce webhook body signature (base64 HMAC-SHA256 of raw body). */
export function verifyWebhookSignature(rawBody: string, signatureB64: string, secret: string) {
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  let sig: Buffer;
  try {
    sig = Buffer.from(signatureB64, "base64");
  } catch {
    return false;
  }
  if (sig.length !== digest.length) return false;
  return timingSafeEqual(sig, digest);
}

/** Placeholder: real implementation registers topic via Woo REST when credentials exist. */
export async function createWebhook(_creds: WooCredentials, _topic: string, _deliveryUrl: string) {
  return {
    ok: false as const,
    message:
      "Webhook registration via API is store-specific. Use WooCommerce admin → Webhooks or extend this helper with POST /webhooks.",
  };
}

export async function updateWooOrderStatus(
  _creds: WooCredentials,
  _orderId: string,
  _status: string,
) {
  return {
    ok: false as const,
    message: "Order status push back to WooCommerce not wired yet (placeholder).",
  };
}
