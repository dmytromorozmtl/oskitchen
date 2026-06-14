import { readFileSync } from "fs";
import { join } from "path";

import type { IntegrationConnection } from "@prisma/client";

import {
  callbackUrlsMatch,
  computeWebhookDriftStatus,
  expectedShopifyMarketsWebhookCallbackUrl,
  findMarketsWebhookTopicDef,
  isShopifyMarketsWebhookRegistryEnabled,
  SHOPIFY_MARKETS_WEBHOOK_TOPICS,
} from "@/lib/commercial/shopify-markets-webhook-registry";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
  type ShopifyMarketsWebhookRegistryRow,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import type { ShopifyCredentials } from "@/services/integrations/shopify";

export type ShopifyWebhookSubscriptionNode = {
  id: string;
  topic: string;
  callbackUrl: string | null;
};

const LIST_WEBHOOKS_QUERY = `
  query KitchenOSListWebhookSubscriptions($first: Int!) {
    webhookSubscriptions(first: $first) {
      nodes {
        id
        topic
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
    }
  }
`;

const CREATE_WEBHOOK_MUTATION = `
  mutation KitchenOSCreateWebhookSubscription(
    $topic: WebhookSubscriptionTopic!
    $callbackUrl: URL!
  ) {
    webhookSubscriptionCreate(
      topic: $topic
      webhookSubscription: { callbackUrl: $callbackUrl, format: JSON }
    ) {
      webhookSubscription {
        id
        topic
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function adminEndpoint(shopDomain: string, apiVersion: string): string {
  const shop = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${shop}/admin/api/${apiVersion}/graphql.json`;
}

export function parseShopifyWebhookSubscriptionsGraphQLResponse(json: unknown): ShopifyWebhookSubscriptionNode[] {
  const data =
    json && typeof json === "object" ? (json as Record<string, unknown>).data : undefined;
  const webhookSubscriptions =
    data && typeof data === "object"
      ? (data as Record<string, unknown>).webhookSubscriptions
      : undefined;
  const nodes =
    webhookSubscriptions && typeof webhookSubscriptions === "object"
      ? (webhookSubscriptions as Record<string, unknown>).nodes
      : undefined;

  if (!Array.isArray(nodes)) return [];

  const results: ShopifyWebhookSubscriptionNode[] = [];
  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    const record = node as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id : "";
    const topic = typeof record.topic === "string" ? record.topic : "";
    const endpoint =
      record.endpoint && typeof record.endpoint === "object"
        ? (record.endpoint as Record<string, unknown>)
        : null;
    const callbackUrl =
      typeof endpoint?.callbackUrl === "string" ? endpoint.callbackUrl : null;
    if (!id || !topic) continue;
    results.push({ id, topic, callbackUrl });
  }
  return results;
}

export function indexSubscriptionsByGraphqlTopic(
  nodes: ShopifyWebhookSubscriptionNode[],
): Map<string, ShopifyWebhookSubscriptionNode> {
  const map = new Map<string, ShopifyWebhookSubscriptionNode>();
  for (const node of nodes) {
    map.set(node.topic.toUpperCase(), node);
  }
  return map;
}

export async function fetchShopifyWebhookSubscriptions(
  creds: ShopifyCredentials,
): Promise<{ ok: true; nodes: ShopifyWebhookSubscriptionNode[] } | { ok: false; error: string }> {
  const version = creds.apiVersion ?? "2025-01";
  try {
    const res = await fetch(adminEndpoint(creds.shopDomain, version), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": creds.adminAccessToken,
      },
      body: JSON.stringify({
        query: LIST_WEBHOOKS_QUERY,
        variables: { first: 50 },
      }),
      cache: "no-store",
    });

    const json = (await res.json()) as {
      data?: unknown;
      errors?: Array<{ message?: string }>;
    };

    if (!res.ok) {
      return { ok: false, error: `Shopify Admin API HTTP ${res.status}` };
    }
    if (json.errors?.length) {
      return {
        ok: false,
        error: json.errors.map((e) => e.message).filter(Boolean).join("; ") || "GraphQL error",
      };
    }

    return { ok: true, nodes: parseShopifyWebhookSubscriptionsGraphQLResponse(json) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function fetchLastWebhookDeliveriesByTopic(connectionId: string): Promise<
  Map<string, { lastDeliveryAt: string; failureCount: number }>
> {
  const rows = await prisma.webhookEvent.groupBy({
    by: ["topic"],
    where: {
      connectionId,
      signatureValid: true,
      topic: { in: SHOPIFY_MARKETS_WEBHOOK_TOPICS.map((t) => t.topic) },
    },
    _max: { receivedAt: true },
    _count: { _all: true },
  });

  const failures = await prisma.webhookEvent.groupBy({
    by: ["topic"],
    where: {
      connectionId,
      processed: false,
      topic: { in: SHOPIFY_MARKETS_WEBHOOK_TOPICS.map((t) => t.topic) },
    },
    _count: { _all: true },
  });

  const failureByTopic = new Map(failures.map((row) => [row.topic, row._count._all]));
  const map = new Map<string, { lastDeliveryAt: string; failureCount: number }>();

  for (const row of rows) {
    if (!row._max.receivedAt) continue;
    map.set(row.topic, {
      lastDeliveryAt: row._max.receivedAt.toISOString(),
      failureCount: failureByTopic.get(row.topic) ?? 0,
    });
  }

  return map;
}

export function buildWebhookRegistryRows(input: {
  subscriptionsByTopic: Map<string, ShopifyWebhookSubscriptionNode>;
  deliveriesByTopic: Map<string, { lastDeliveryAt: string; failureCount: number }>;
  previousRegistry: Record<string, ShopifyMarketsWebhookRegistryRow>;
  syncedAt: string;
}): Record<string, ShopifyMarketsWebhookRegistryRow> {
  const registry: Record<string, ShopifyMarketsWebhookRegistryRow> = {};

  for (const def of SHOPIFY_MARKETS_WEBHOOK_TOPICS) {
    const expectedCallbackUrl = expectedShopifyMarketsWebhookCallbackUrl(def.routeSegment);
    const subscription = input.subscriptionsByTopic.get(def.graphqlTopic) ?? null;
    const delivery = input.deliveriesByTopic.get(def.topic);
    const previous = input.previousRegistry[def.topic];

    const registeredAt =
      subscription?.id && !previous?.shopifySubscriptionId
        ? input.syncedAt
        : previous?.registeredAt ?? (subscription?.id ? input.syncedAt : null);

    const driftStatus = computeWebhookDriftStatus({
      shopifySubscriptionId: subscription?.id ?? null,
      expectedCallbackUrl,
      actualCallbackUrl: subscription?.callbackUrl ?? null,
      lastDeliveryAt: delivery?.lastDeliveryAt ?? previous?.lastDeliveryAt ?? null,
      registeredAt,
      now: Date.parse(input.syncedAt),
    });

    registry[def.topic] = {
      topic: def.topic,
      graphqlTopic: def.graphqlTopic,
      routeSegment: def.routeSegment,
      label: def.label,
      expectedCallbackUrl,
      shopifySubscriptionId: subscription?.id ?? null,
      actualCallbackUrl: subscription?.callbackUrl ?? null,
      registeredAt,
      lastSyncedAt: input.syncedAt,
      lastDeliveryAt: delivery?.lastDeliveryAt ?? previous?.lastDeliveryAt ?? null,
      failureCount: delivery?.failureCount ?? previous?.failureCount ?? 0,
      driftStatus,
    };
  }

  return registry;
}

export async function syncShopifyMarketsWebhookRegistryForConnection(input: {
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
}): Promise<
  | { ok: true; registry: Record<string, ShopifyMarketsWebhookRegistryRow>; driftOpen: number }
  | { ok: false; error: string }
> {
  if (!isShopifyMarketsWebhookRegistryEnabled()) {
    return { ok: false, error: "Shopify Markets webhook registry is disabled." };
  }

  const fetched = await fetchShopifyWebhookSubscriptions(input.creds);
  if (!fetched.ok) {
    return { ok: false, error: fetched.error };
  }

  const deliveries = await fetchLastWebhookDeliveriesByTopic(input.connection.id);
  const current = parseShopifyMarketsSyncSettings(input.connection.settingsJson);
  const syncedAt = new Date().toISOString();

  const registry = buildWebhookRegistryRows({
    subscriptionsByTopic: indexSubscriptionsByGraphqlTopic(fetched.nodes),
    deliveriesByTopic: deliveries,
    previousRegistry: current.marketWebhookRegistry,
    syncedAt,
  });

  const driftOpen = Object.values(registry).filter((row) => row.driftStatus !== "ok").length;

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          lastWebhookRegistrySyncAt: syncedAt,
          webhookRegistrySyncError: null,
          marketWebhookRegistry: registry,
          lastWebhookRegistryDriftCount: driftOpen,
        }),
      ),
    },
  });

  return { ok: true, registry, driftOpen };
}

export async function registerMissingShopifyMarketsWebhooks(input: {
  connection: IntegrationConnection;
  creds: ShopifyCredentials;
}): Promise<
  | { ok: true; registered: number; skipped: number; errors: string[] }
  | { ok: false; error: string }
> {
  if (!isShopifyMarketsWebhookRegistryEnabled()) {
    return { ok: false, error: "Shopify Markets webhook registry is disabled." };
  }

  const syncResult = await syncShopifyMarketsWebhookRegistryForConnection(input);
  if (!syncResult.ok) return syncResult;

  let registered = 0;
  let skipped = 0;
  const errors: string[] = [];
  const version = input.creds.apiVersion ?? "2025-01";
  const now = new Date().toISOString();

  for (const def of SHOPIFY_MARKETS_WEBHOOK_TOPICS) {
    const row = syncResult.registry[def.topic];
    if (!row) continue;
    if (row.shopifySubscriptionId && callbackUrlsMatch(row.expectedCallbackUrl, row.actualCallbackUrl)) {
      skipped += 1;
      continue;
    }

    const callbackUrl = row.expectedCallbackUrl;
    try {
      const res = await fetch(adminEndpoint(input.creds.shopDomain, version), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": input.creds.adminAccessToken,
        },
        body: JSON.stringify({
          query: CREATE_WEBHOOK_MUTATION,
          variables: {
            topic: def.graphqlTopic,
            callbackUrl,
          },
        }),
        cache: "no-store",
      });

      const json = (await res.json()) as {
        data?: {
          webhookSubscriptionCreate?: {
            webhookSubscription?: { id?: string; topic?: string };
            userErrors?: Array<{ message?: string }>;
          };
        };
        errors?: Array<{ message?: string }>;
      };

      if (!res.ok) {
        errors.push(`${def.topic}: HTTP ${res.status}`);
        continue;
      }
      if (json.errors?.length) {
        errors.push(`${def.topic}: ${json.errors.map((e) => e.message).join("; ")}`);
        continue;
      }

      const userErrors = json.data?.webhookSubscriptionCreate?.userErrors ?? [];
      if (userErrors.length > 0) {
        errors.push(`${def.topic}: ${userErrors.map((e) => e.message).filter(Boolean).join("; ")}`);
        continue;
      }

      const subId = json.data?.webhookSubscriptionCreate?.webhookSubscription?.id;
      if (!subId) {
        errors.push(`${def.topic}: No subscription id returned.`);
        continue;
      }

      registered += 1;
      syncResult.registry[def.topic] = {
        ...row,
        shopifySubscriptionId: subId,
        actualCallbackUrl: callbackUrl,
        registeredAt: now,
        lastSyncedAt: now,
        driftStatus: row.lastDeliveryAt ? "ok" : "never_delivered",
      };
    } catch (e) {
      errors.push(`${def.topic}: ${e instanceof Error ? e.message : "Network error"}`);
    }
  }

  await prisma.integrationConnection.update({
    where: { id: input.connection.id },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(input.connection.settingsJson, {
          lastWebhookRegistryRegisterAt: now,
          lastWebhookRegistryRegisterError: errors.length > 0 ? errors.join(" · ") : null,
          marketWebhookRegistry: syncResult.registry,
          lastWebhookRegistrySyncAt: now,
        }),
      ),
    },
  });

  if (registered === 0 && errors.length > 0 && skipped === 0) {
    return { ok: false, error: errors[0] ?? "Registration failed." };
  }

  return { ok: true, registered, skipped, errors };
}

export async function touchShopifyMarketsWebhookDelivery(input: {
  connectionId: string;
  topic: string;
}): Promise<void> {
  if (!isShopifyMarketsWebhookRegistryEnabled()) return;
  if (!findMarketsWebhookTopicDef(input.topic)) return;

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const row = sync.marketWebhookRegistry[input.topic];
  if (!row) return;

  const now = new Date().toISOString();
  const updated: ShopifyMarketsWebhookRegistryRow = {
    ...row,
    lastDeliveryAt: now,
    driftStatus: "ok",
  };

  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: toInputJsonValue(
        mergeShopifyMarketsSyncSettings(conn.settingsJson, {
          marketWebhookRegistry: {
            ...sync.marketWebhookRegistry,
            [input.topic]: updated,
          },
        }),
      ),
    },
  });
}

export function countWebhookRegistryDrift(
  registry: Record<string, ShopifyMarketsWebhookRegistryRow>,
): number {
  return Object.values(registry).filter((row) => row.driftStatus !== "ok").length;
}

export function loadWebhookRegistryFixture(): unknown {
  return JSON.parse(
    readFileSync(
      join(process.cwd(), "tests/fixtures/shopify/webhook-subscriptions-response.json"),
      "utf8",
    ),
  );
}
