import type { IntegrationProvider } from "@prisma/client";

import type { ShopifyCredentials } from "@/services/integrations/shopify";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export async function pushShopifyInventoryLevel(
  creds: ShopifyCredentials,
  input: {
    inventoryItemId: string;
    locationId: string;
    quantity: number;
  },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const version = creds.apiVersion ?? "2025-01";
  const shop = creds.shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${shop}/admin/api/${version}/inventory_levels/set.json`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": creds.adminAccessToken,
      },
      body: JSON.stringify({
        location_id: Number(input.locationId),
        inventory_item_id: Number(input.inventoryItemId),
        available: Math.max(0, Math.round(input.quantity)),
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, message: text.slice(0, 300) || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export async function fetchShopifyPrimaryLocationId(
  creds: ShopifyCredentials,
): Promise<string | null> {
  const version = creds.apiVersion ?? "2025-01";
  const shop = creds.shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${shop}/admin/api/${version}/locations.json?limit=1`;
  try {
    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": creds.adminAccessToken },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { locations?: { id: number }[] };
    const id = json.locations?.[0]?.id;
    return id != null ? String(id) : null;
  } catch {
    return null;
  }
}

export function extractShopifyInventoryItemId(rawPayloadJson: unknown): string | null {
  if (!rawPayloadJson || typeof rawPayloadJson !== "object") return null;
  const variant = (rawPayloadJson as Record<string, unknown>).variant as
    | Record<string, unknown>
    | undefined;
  const item = variant?.inventoryItem as { id?: string } | undefined;
  if (item?.id) {
    const parts = String(item.id).split("/");
    return parts[parts.length - 1] ?? null;
  }
  const inventoryItemId = variant?.inventory_item_id;
  if (inventoryItemId != null && inventoryItemId !== "") {
    return String(inventoryItemId);
  }
  return null;
}

/** Returns available inventory from Shopify variant payload (REST/webhook). */
export function extractShopifyInventoryQuantityFromVariant(
  variant: Record<string, unknown>,
): number | null {
  const qty = variant.inventory_quantity;
  if (qty == null || qty === "") return null;
  const parsed = Number(qty);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.round(parsed));
}

export type WooInventoryCredentials = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
};

export async function pushWooInventoryLevel(
  creds: WooInventoryCredentials,
  externalProductId: string,
  quantity: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const url = `${stripTrailingSlash(creds.baseUrl)}/wp-json/wc/v3/products/${externalProductId}`;
  const token = Buffer.from(`${creds.consumerKey}:${creds.consumerSecret}`).toString("base64");
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        manage_stock: true,
        stock_quantity: Math.max(0, Math.round(quantity)),
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, message: text.slice(0, 300) || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error" };
  }
}

export function providerSupportsInventoryPush(provider: IntegrationProvider): boolean {
  return provider === "SHOPIFY" || provider === "WOOCOMMERCE";
}
