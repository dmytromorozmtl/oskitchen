import { createHmac, timingSafeEqual } from "crypto";

import { IntegrationProvider, NormalizedOrderStatus } from "@prisma/client";

import type { NormalizedKitchenOrder } from "@/lib/order-normalization";
import { normalizeShopifyGraphqlB2bOrderShape } from "@/lib/integrations/shopify-graphql-b2b-order-shape";

export type ShopifyCredentials = {
  shopDomain: string;
  adminAccessToken: string;
  apiVersion?: string;
};

function adminEndpoint(shopDomain: string, apiVersion: string) {
  const shop = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${shop}/admin/api/${apiVersion}/graphql.json`;
}

export async function testConnection(creds: ShopifyCredentials): Promise<{ ok: boolean; message: string }> {
  const version = creds.apiVersion ?? "2025-01";
  const query = `{ shop { name email myshopifyDomain } }`;
  try {
    const res = await fetch(adminEndpoint(creds.shopDomain, version), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": creds.adminAccessToken,
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });
    const json = (await res.json()) as {
      data?: { shop?: { name?: string } };
      errors?: { message: string }[];
    };
    if (!res.ok || json.errors?.length) {
      return {
        ok: false,
        message: json.errors?.map((e) => e.message).join("; ") ?? `HTTP ${res.status}`,
      };
    }
    return {
      ok: true,
      message: json.data?.shop?.name
        ? `Connected as ${json.data.shop.name}`
        : "Connected to Shopify Admin API.",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, message: msg };
  }
}

export async function fetchOrdersGraphQL(creds: ShopifyCredentials, first = 25) {
  const version = creds.apiVersion ?? "2025-01";
  const query = `
    query Orders($first: Int!) {
      orders(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            email
            createdAt
            displayFulfillmentStatus
            displayFinancialStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            lineItems(first: 50) {
              edges {
                node {
                  id
                  title
                  quantity
                  sku
                  originalUnitPriceSet { shopMoney { amount } }
                }
              }
            }
            poNumber
            paymentTerms {
              paymentTermsName
              paymentTermsType
              dueInDays
            }
            shippingAddress { address1 city province zip country phone }
            purchasingEntity {
              __typename
              ... on PurchasingCompany {
                company { id name }
                location { id name }
              }
            }
          }
        }
      }
    }
  `;
  const res = await fetch(adminEndpoint(creds.shopDomain, version), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": creds.adminAccessToken,
    },
    body: JSON.stringify({ query, variables: { first } }),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    data?: {
      orders?: {
        edges?: {
          node: Record<string, unknown>;
        }[];
      };
    };
    errors?: { message: string }[];
  };
  if (!res.ok || json.errors?.length) {
    throw new Error(json.errors?.map((e) => e.message).join("; ") ?? `HTTP ${res.status}`);
  }
  return json.data?.orders?.edges?.map((e) => e.node) ?? [];
}

export async function fetchProductsGraphQL(creds: ShopifyCredentials, first = 25) {
  const version = creds.apiVersion ?? "2025-01";
  const query = `
    query Products($first: Int!) {
      products(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            featuredImage { url }
            variants(first: 50) {
              edges {
                node {
                  id
                  sku
                  title
                  price
                  inventoryQuantity
                  inventoryItem { id }
                }
              }
            }
          }
        }
      }
    }
  `;
  const res = await fetch(adminEndpoint(creds.shopDomain, version), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": creds.adminAccessToken,
    },
    body: JSON.stringify({ query, variables: { first } }),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    data?: {
      products?: {
        edges?: {
          node: Record<string, unknown>;
        }[];
      };
    };
    errors?: { message: string }[];
  };
  if (!res.ok || json.errors?.length) {
    throw new Error(json.errors?.map((e) => e.message).join("; ") ?? `HTTP ${res.status}`);
  }
  return json.data?.products?.edges?.map((e) => e.node) ?? [];
}

function gidTail(gid: string) {
  const parts = gid.split("/");
  return parts[parts.length - 1] ?? gid;
}

export function normalizeShopifyProduct(node: Record<string, unknown>) {
  const variants =
    (node.variants as { edges?: { node: Record<string, unknown> }[] })?.edges ?? [];
  if (variants.length === 0) {
    return [
      {
        externalProductId: gidTail(String(node.id)),
        externalVariantId: "",
        title: String(node.title ?? "Product"),
        sku: null as string | null,
        price: null as string | null,
        image: (node.featuredImage as { url?: string } | undefined)?.url ?? null,
        rawPayloadJson: node,
      },
    ];
  }
  return variants.map((v) => {
    const vn = v.node;
    return {
      externalProductId: gidTail(String(node.id)),
      externalVariantId: gidTail(String(vn.id)),
      title: `${node.title} — ${vn.title}`,
      sku: vn.sku != null ? String(vn.sku) : null,
      price: vn.price != null ? String(vn.price) : null,
      image: (node.featuredImage as { url?: string } | undefined)?.url ?? null,
      rawPayloadJson: { product: node, variant: vn },
    };
  });
}

function mapShopifyFulfillment(status?: string): NormalizedOrderStatus {
  if (!status) return NormalizedOrderStatus.OPEN;
  const u = status.toUpperCase();
  if (u.includes("FULFILLED") && !u.includes("PARTIAL")) {
    return NormalizedOrderStatus.COMPLETED;
  }
  if (u.includes("PARTIAL") || u === "IN_PROGRESS") {
    return NormalizedOrderStatus.PREPARING;
  }
  if (u === "UNFULFILLED") return NormalizedOrderStatus.CONFIRMED;
  return NormalizedOrderStatus.OPEN;
}

/** Webhook / REST Admin order payload (not GraphQL `orders` query shape). */
export function normalizeShopifyRestOrder(order: Record<string, unknown>): NormalizedKitchenOrder {
  const id = String(order.id ?? "");
  const items = (order.line_items as Record<string, unknown>[]) ?? [];
  const ship = order.shipping_address as Record<string, unknown> | undefined;
  const hasShip = ship && Object.keys(ship).some((k) => ship[k]);
  const fulfill =
    order.fulfillment_status != null ? String(order.fulfillment_status) : undefined;

  return {
    provider: IntegrationProvider.SHOPIFY,
    externalOrderId: id,
    externalOrderNumber: order.name != null ? String(order.name) : id,
    sourceStatus: fulfill ?? null,
    normalizedStatus: mapShopifyFulfillment(fulfill),
    customer: {
      name:
        order.customer != null && typeof order.customer === "object"
          ? String((order.customer as { first_name?: string }).first_name ?? "") +
            " " +
            String((order.customer as { last_name?: string }).last_name ?? "")
          : null,
      email: order.email != null ? String(order.email) : null,
      phone: order.phone != null ? String(order.phone) : null,
    },
    lineItems: items.map((li) => ({
      externalLineId: li.id != null ? String(li.id) : undefined,
      sku: li.sku != null ? String(li.sku) : null,
      title: String(li.title ?? "Item"),
      quantity: Number(li.quantity ?? 1),
      unitPrice: li.price != null ? Number(li.price) : null,
    })),
    notes: order.note != null ? String(order.note) : null,
    fulfillment: {
      type: hasShip ? "DELIVERY" : "PICKUP",
      pickupTime: null,
      deliveryTime: null,
      deliveryAddress: hasShip ? (ship as Record<string, unknown>) : null,
    },
    totals: {
      subtotal: order.subtotal_price != null ? Number(order.subtotal_price) : null,
      tax: order.total_tax != null ? Number(order.total_tax) : null,
      deliveryFee: null,
      total: order.total_price != null ? Number(order.total_price) : null,
      currency: order.currency != null ? String(order.currency) : null,
    },
    raw: order,
  };
}

export function normalizeShopifyOrder(node: Record<string, unknown>): NormalizedKitchenOrder {
  const rawNode = normalizeShopifyGraphqlB2bOrderShape(node);
  const lineEdges =
    (rawNode.lineItems as { edges?: { node: Record<string, unknown> }[] })?.edges ?? [];
  const ship = rawNode.shippingAddress as Record<string, unknown> | null | undefined;
  const hasShip = ship && Object.keys(ship).some((k) => ship[k]);

  const total = rawNode.totalPriceSet as
    | { shopMoney?: { amount?: string; currencyCode?: string } }
    | undefined;

  return {
    provider: IntegrationProvider.SHOPIFY,
    externalOrderId: gidTail(String(rawNode.id)),
    externalOrderNumber: rawNode.name != null ? String(rawNode.name) : null,
    sourceStatus:
      rawNode.displayFulfillmentStatus != null ? String(rawNode.displayFulfillmentStatus) : null,
    normalizedStatus: mapShopifyFulfillment(
      rawNode.displayFulfillmentStatus != null ? String(rawNode.displayFulfillmentStatus) : undefined,
    ),
    customer: {
      name: null,
      email: rawNode.email != null ? String(rawNode.email) : null,
      phone: ship?.phone != null ? String(ship.phone) : null,
    },
    lineItems: lineEdges.map((e) => {
      const li = e.node;
      const price = li.originalUnitPriceSet as { shopMoney?: { amount?: string } } | undefined;
      return {
        externalLineId: gidTail(String(li.id)),
        sku: li.sku != null ? String(li.sku) : null,
        title: String(li.title ?? "Item"),
        quantity: Number(li.quantity ?? 1),
        unitPrice: price?.shopMoney?.amount != null ? Number(price.shopMoney.amount) : null,
      };
    }),
    notes: null,
    fulfillment: {
      type: hasShip ? "DELIVERY" : "PICKUP",
      pickupTime: null,
      deliveryTime: null,
      deliveryAddress: hasShip ? (ship as Record<string, unknown>) : null,
    },
    totals: {
      subtotal: total?.shopMoney?.amount != null ? Number(total.shopMoney.amount) : null,
      tax: null,
      deliveryFee: null,
      total: total?.shopMoney?.amount != null ? Number(total.shopMoney.amount) : null,
      currency: total?.shopMoney?.currencyCode ?? null,
    },
    raw: rawNode,
  };
}

export function verifyShopifyHmac(rawBody: string, hmacHeader: string, secret: string) {
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(hmacHeader, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function registerWebhookPlaceholder(
  creds: ShopifyCredentials,
  topic: string,
  address: string,
) {
  const { registerMissingShopifyMarketsWebhooks } = await import(
    "@/services/integrations/shopify-markets-webhook-registry-service"
  );
  const { findMarketsWebhookTopicDef } = await import(
    "@/lib/commercial/shopify-markets-webhook-registry"
  );
  if (!findMarketsWebhookTopicDef(topic)) {
    return {
      ok: false as const,
      message:
        "Programmatic webhook registration is available for Markets sync topics via Integrations → Shopify → Webhook registry.",
    };
  }
  void creds;
  void address;
  return {
    ok: false as const,
    message: "Use Integrations → Shopify → Register missing webhooks for Markets sync topics.",
  };
}
