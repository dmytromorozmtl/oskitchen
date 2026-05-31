import { SITE_URL } from "@/lib/constants";

export const SHOPIFY_MARKETS_WEBHOOK_REGISTRY_HONESTY =
  "Webhook registry sync compares Shopify Admin subscriptions with KitchenOS routes — registration requires write_webhooks scope and a public HTTPS origin (NEXT_PUBLIC_APP_URL).";

export const SHOPIFY_MARKETS_WEBHOOK_STALE_MS = 24 * 60 * 60 * 1000;

export const SHOPIFY_MARKETS_WEBHOOK_REGISTER_SCOPES = [
  "read_webhooks",
  "write_webhooks",
] as const;

export type ShopifyMarketsWebhookTopicDef = {
  /** Canonical topic passed to handleShopifyWebhook */
  topic: string;
  /** Shopify GraphQL WebhookSubscriptionTopic enum */
  graphqlTopic: string;
  /** URL segment under /api/webhooks/shopify/ */
  routeSegment: string;
  /** Human label for dashboard */
  label: string;
};

export const SHOPIFY_MARKETS_WEBHOOK_TOPICS: ShopifyMarketsWebhookTopicDef[] = [
  {
    topic: "markets/create",
    graphqlTopic: "MARKETS_CREATE",
    routeSegment: "markets-create",
    label: "Markets create",
  },
  {
    topic: "markets/update",
    graphqlTopic: "MARKETS_UPDATE",
    routeSegment: "markets-update",
    label: "Markets update",
  },
  {
    topic: "markets/delete",
    graphqlTopic: "MARKETS_DELETE",
    routeSegment: "markets-delete",
    label: "Markets delete",
  },
  {
    topic: "products/update",
    graphqlTopic: "PRODUCTS_UPDATE",
    routeSegment: "products-update",
    label: "Products update",
  },
];

export type ShopifyMarketsWebhookDriftStatus =
  | "ok"
  | "missing"
  | "wrong_url"
  | "stale"
  | "never_delivered";

export function isShopifyMarketsWebhookRegistryEnabled(): boolean {
  if (process.env.SHOPIFY_MARKETS_WEBHOOK_REGISTRY === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function expectedShopifyMarketsWebhookCallbackUrl(routeSegment: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  return `${base}/api/webhooks/shopify/${routeSegment}`;
}

export function normalizeWebhookCallbackUrl(url: string): string {
  return url.trim().replace(/\/$/, "").toLowerCase();
}

export function callbackUrlsMatch(expected: string, actual: string | null | undefined): boolean {
  if (!actual?.trim()) return false;
  return normalizeWebhookCallbackUrl(expected) === normalizeWebhookCallbackUrl(actual);
}

export function computeWebhookDriftStatus(input: {
  shopifySubscriptionId: string | null;
  expectedCallbackUrl: string;
  actualCallbackUrl: string | null;
  lastDeliveryAt: string | null;
  registeredAt: string | null;
  now?: number;
}): ShopifyMarketsWebhookDriftStatus {
  if (!input.shopifySubscriptionId) return "missing";
  if (!callbackUrlsMatch(input.expectedCallbackUrl, input.actualCallbackUrl)) return "wrong_url";

  const now = input.now ?? Date.now();
  if (!input.lastDeliveryAt) {
    if (input.registeredAt) {
      const registeredMs = Date.parse(input.registeredAt);
      if (Number.isFinite(registeredMs) && now - registeredMs > SHOPIFY_MARKETS_WEBHOOK_STALE_MS) {
        return "never_delivered";
      }
    }
    return "never_delivered";
  }

  const lastMs = Date.parse(input.lastDeliveryAt);
  if (Number.isFinite(lastMs) && now - lastMs > SHOPIFY_MARKETS_WEBHOOK_STALE_MS) {
    return "stale";
  }

  return "ok";
}

export function driftStatusLabel(status: ShopifyMarketsWebhookDriftStatus): string {
  switch (status) {
    case "ok":
      return "Healthy";
    case "missing":
      return "Not registered";
    case "wrong_url":
      return "Wrong callback URL";
    case "stale":
      return "Stale delivery (>24h)";
    case "never_delivered":
      return "Never delivered";
    default:
      return status;
  }
}

export function findMarketsWebhookTopicDef(topic: string): ShopifyMarketsWebhookTopicDef | null {
  return SHOPIFY_MARKETS_WEBHOOK_TOPICS.find((row) => row.topic === topic) ?? null;
}
