import type { IntegrationProvider, IntegrationStatus } from "@prisma/client";

import {
  certificationLabel,
  listPartnerApps,
  listRoadmapExtensions,
  type ExtensionCategory,
  type PartnerAppCertification,
} from "@/lib/commercial/partner-apps-catalog";
import { channelByKey } from "@/lib/channels/channel-registry";
import {
  INTEGRATION_REGISTRY,
  type IntegrationRegistryEntry,
} from "@/lib/integrations/integration-registry";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export type ExtensionKind = "first_party" | "partner" | "roadmap";

export type ExtensionStatus =
  | "LIVE"
  | "BETA"
  | "PLACEHOLDER"
  | "CERTIFIED"
  | "ROADMAP";

export type ExtensionConnectionState =
  | "connected"
  | "needs_auth"
  | "error"
  | "disabled"
  | "not_applicable"
  | "not_connected";

export type ExtensionCatalogItem = {
  id: string;
  name: string;
  publisher: string;
  category: ExtensionCategory;
  kind: ExtensionKind;
  status: ExtensionStatus;
  description: string;
  setupRoute: string | null;
  externalUrl: string | null;
  tags: string[];
  connectionState: ExtensionConnectionState;
  certificationLabel?: string;
  honestyNote?: string;
};

export type ExtensionsCatalogSummary = {
  total: number;
  connectedFirstParty: number;
  certifiedPartners: number;
  roadmap: number;
};

const INTEGRATION_ID_TO_PROVIDER: Partial<Record<string, IntegrationProvider>> = {
  doordash: "DOORDASH",
  grubhub: "GRUBHUB",
  "uber-eats": "UBER_EATS",
  "uber-direct": "UBER_DIRECT",
};

const INTEGRATION_CATEGORY: Partial<Record<string, ExtensionCategory>> = {
  doordash: "sales_channels",
  grubhub: "sales_channels",
  "uber-eats": "sales_channels",
  "uber-direct": "sales_channels",
  quickbooks: "accounting",
  xero: "accounting",
  "7shifts": "labor",
  homebase: "labor",
};

const FIRST_PARTY_CHANNEL_EXTRAS: Array<{
  id: string;
  providerKey: string;
  category: ExtensionCategory;
  description: string;
  tags: string[];
}> = [
  {
    id: "shopify",
    providerKey: "shopify",
    category: "sales_channels",
    description: "Shopify storefront orders, catalog sync, and bidirectional inventory when connected.",
    tags: ["ecommerce", "inventory", "orders"],
  },
  {
    id: "woocommerce",
    providerKey: "woocommerce",
    category: "sales_channels",
    description: "WooCommerce order ingest, product mapping, and stock sync for WordPress merchants.",
    tags: ["wordpress", "inventory", "orders"],
  },
  {
    id: "inventory-sync",
    providerKey: "inventory-sync",
    category: "operations",
    description: "Bidirectional Shopify and WooCommerce stock push/pull with conflict resolution.",
    tags: ["inventory", "sync", "conflicts"],
  },
];

function connectionStateFromStatus(
  provider: IntegrationProvider | undefined,
  connections: Array<{ provider: IntegrationProvider; status: IntegrationStatus }>,
): ExtensionConnectionState {
  if (!provider) return "not_applicable";
  const match = connections.find((c) => c.provider === provider);
  if (!match) return "not_connected";
  switch (match.status) {
    case "CONNECTED":
      return "connected";
    case "NEEDS_AUTH":
      return "needs_auth";
    case "ERROR":
      return "error";
    case "DISABLED":
      return "disabled";
    default:
      return "not_connected";
  }
}

function firstPartyFromRegistry(
  entry: IntegrationRegistryEntry,
  connections: Array<{ provider: IntegrationProvider; status: IntegrationStatus }>,
): ExtensionCatalogItem {
  const provider = INTEGRATION_ID_TO_PROVIDER[entry.id];
  return {
    id: entry.id,
    name: entry.name,
    publisher: "OS Kitchen",
    category: INTEGRATION_CATEGORY[entry.id] ?? "operations",
    kind: "first_party",
    status: entry.status,
    description: `${entry.name} integration — ${entry.status} first-party connector with setup in dashboard.`,
    setupRoute: entry.setupRoute,
    externalUrl: null,
    tags: ["first-party", entry.status.toLowerCase()],
    connectionState: connectionStateFromStatus(provider, connections),
    honestyNote:
      entry.status === "PLACEHOLDER"
        ? "Placeholder — partner credentials or API access not yet certified for your program."
        : undefined,
  };
}

function firstPartyFromChannelExtra(
  extra: (typeof FIRST_PARTY_CHANNEL_EXTRAS)[number],
  connections: Array<{ provider: IntegrationProvider; status: IntegrationStatus }>,
): ExtensionCatalogItem {
  if (extra.id === "inventory-sync") {
    const shopifyConnected = connectionStateFromStatus("SHOPIFY", connections) === "connected";
    const wooConnected = connectionStateFromStatus("WOOCOMMERCE", connections) === "connected";
    return {
      id: extra.id,
      name: "Inventory sync",
      publisher: "OS Kitchen",
      category: extra.category,
      kind: "first_party",
      status: "BETA",
      description: extra.description,
      setupRoute: "/dashboard/integrations/inventory-sync",
      externalUrl: null,
      tags: extra.tags,
      connectionState:
        shopifyConnected || wooConnected ? "connected" : "not_connected",
      honestyNote: "Requires at least one Shopify or WooCommerce connection.",
    };
  }

  const channel = channelByKey(extra.providerKey);
  const provider = channel?.mapsToIntegrationProvider ?? undefined;
  return {
    id: extra.id,
    name: channel?.label ?? extra.providerKey,
    publisher: "OS Kitchen",
    category: extra.category,
    kind: "first_party",
    status: channel?.statusType === "LIVE" ? "LIVE" : channel?.isPlaceholder ? "PLACEHOLDER" : "BETA",
    description: extra.description,
    setupRoute: channel?.setupRoute ?? null,
    externalUrl: null,
    tags: extra.tags,
    connectionState: connectionStateFromStatus(provider ?? undefined, connections),
  };
}

function buildFirstPartyCatalog(
  connections: Array<{ provider: IntegrationProvider; status: IntegrationStatus }>,
): ExtensionCatalogItem[] {
  const registryItems = INTEGRATION_REGISTRY.map((entry) =>
    firstPartyFromRegistry(entry, connections),
  );
  const extras = FIRST_PARTY_CHANNEL_EXTRAS.map((extra) =>
    firstPartyFromChannelExtra(extra, connections),
  );
  const seen = new Set<string>();
  return [...registryItems, ...extras].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function buildPartnerCatalog(): ExtensionCatalogItem[] {
  return listPartnerApps().map((app) => ({
    id: app.id,
    name: app.name,
    publisher: app.publisher,
    category: app.category,
    kind: "partner" as const,
    status: app.status,
    description: app.description,
    setupRoute: app.setupRoute,
    externalUrl: app.externalUrl,
    tags: app.tags,
    connectionState: "not_applicable" as const,
    certificationLabel: certificationLabel(app.certification as PartnerAppCertification),
    honestyNote: app.honestyNote,
  }));
}

function buildRoadmapCatalog(): ExtensionCatalogItem[] {
  return listRoadmapExtensions().map((item) => ({
    id: item.id,
    name: item.name,
    publisher: item.publisher,
    category: item.category,
    kind: "roadmap" as const,
    status: "ROADMAP" as const,
    description: item.description,
    setupRoute: item.setupRoute,
    externalUrl: item.externalUrl,
    tags: item.tags,
    connectionState: "not_applicable" as const,
    honestyNote: item.honestyNote,
  }));
}

export function mergeExtensionsCatalog(
  connections: Array<{ provider: IntegrationProvider; status: IntegrationStatus }>,
): ExtensionCatalogItem[] {
  return [
    ...buildFirstPartyCatalog(connections),
    ...buildPartnerCatalog(),
    ...buildRoadmapCatalog(),
  ].sort((a, b) => {
    const kindOrder: Record<ExtensionKind, number> = {
      first_party: 0,
      partner: 1,
      roadmap: 2,
    };
    const kindDiff = kindOrder[a.kind] - kindOrder[b.kind];
    if (kindDiff !== 0) return kindDiff;
    return a.name.localeCompare(b.name);
  });
}

export function summarizeExtensionsCatalog(items: ExtensionCatalogItem[]): ExtensionsCatalogSummary {
  return {
    total: items.length,
    connectedFirstParty: items.filter(
      (i) => i.kind === "first_party" && i.connectionState === "connected",
    ).length,
    certifiedPartners: items.filter((i) => i.kind === "partner").length,
    roadmap: items.filter((i) => i.kind === "roadmap").length,
  };
}

export async function getExtensionsCatalogForOwner(
  userId: string,
): Promise<{ items: ExtensionCatalogItem[]; summary: ExtensionsCatalogSummary }> {
  const connections = await prisma.integrationConnection.findMany({
    where: await integrationConnectionListWhereForOwner(userId),
    select: { provider: true, status: true },
  });
  const items = mergeExtensionsCatalog(connections);
  return { items, summary: summarizeExtensionsCatalog(items) };
}

export function filterExtensionsCatalog(
  items: ExtensionCatalogItem[],
  opts: { category?: ExtensionCategory | "all"; kind?: ExtensionKind | "all"; query?: string },
): ExtensionCatalogItem[] {
  const query = opts.query?.trim().toLowerCase();
  return items.filter((item) => {
    if (opts.category && opts.category !== "all" && item.category !== opts.category) return false;
    if (opts.kind && opts.kind !== "all" && item.kind !== opts.kind) return false;
    if (!query) return true;
    const haystack = [
      item.name,
      item.publisher,
      item.description,
      item.tags.join(" "),
      item.certificationLabel ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
