import { createClient, type EdgeConfigClient } from "@vercel/edge-config";

import { resolveEdgeConfigId } from "@/lib/storefront/theme-experiment-edge-shard";

const clientCache = new Map<string, EdgeConfigClient>();

function connectionStringForEdgeConfigId(edgeConfigId: string): string | undefined {
  const token = process.env.EDGE_CONFIG_TOKEN?.trim();
  if (!token) return process.env.EDGE_CONFIG?.trim();
  return `https://edge-config.vercel.com/${edgeConfigId}?token=${token}`;
}

/** Per-workspace Edge Config client (shard). Falls back to default EDGE_CONFIG. */
export function getEdgeConfigClient(workspaceId?: string | null): EdgeConfigClient {
  const edgeConfigId = resolveEdgeConfigId(workspaceId) ?? "default";
  const cached = clientCache.get(edgeConfigId);
  if (cached) return cached;

  const conn =
    edgeConfigId === "default"
      ? process.env.EDGE_CONFIG?.trim()
      : connectionStringForEdgeConfigId(edgeConfigId);

  const client = createClient(conn);
  clientCache.set(edgeConfigId, client);
  return client;
}

export function getFallbackEdgeConfigClient(): EdgeConfigClient | null {
  const fallbackId = process.env.EDGE_CONFIG_ID_FALLBACK?.trim();
  if (!fallbackId) return null;
  const conn = connectionStringForEdgeConfigId(fallbackId);
  if (!conn) return null;
  return createClient(conn);
}
