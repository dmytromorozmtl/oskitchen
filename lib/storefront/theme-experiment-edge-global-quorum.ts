import { createClient, type EdgeConfigClient } from "@vercel/edge-config";

import { logger } from "@/lib/logger";
import { recordExperimentSpan } from "@/lib/storefront/experiment-trace";
import { resolveEdgeConfigId } from "@/lib/storefront/theme-experiment-edge-shard";
import {
  edgeConfigKeyForStore,
  parseThemeExperimentEdgePayload,
  type ThemeExperimentEdgePayload,
} from "@/lib/storefront/theme-experiment-edge-config";
import {
  edgeRoutingKeyForStore,
  parseThemeExperimentEdgeRouting,
} from "@/lib/storefront/theme-experiment-edge-routing";

const clientCache = new Map<string, EdgeConfigClient>();

function connectionStringForEdgeConfigId(edgeConfigId: string): string | undefined {
  const token = process.env.EDGE_CONFIG_TOKEN?.trim();
  if (!token) return process.env.EDGE_CONFIG?.trim();
  return `https://edge-config.vercel.com/${edgeConfigId}?token=${token}`;
}

export function getEdgeConfigClientById(edgeConfigId: string): EdgeConfigClient | null {
  const conn = connectionStringForEdgeConfigId(edgeConfigId);
  if (!conn) return null;
  const cached = clientCache.get(edgeConfigId);
  if (cached) return cached;
  const client = createClient(conn);
  clientCache.set(edgeConfigId, client);
  return client;
}

/** N3: primary + up to 2 replicas (EDGE_CONFIG_ID_REPLICA, EDGE_CONFIG_ID_REPLICA_2). */
export function resolveGlobalEdgeConfigIds(workspaceId?: string | null): string[] {
  const ids: string[] = [];
  const primary = resolveEdgeConfigId(workspaceId);
  if (primary) ids.push(primary);
  for (const key of ["EDGE_CONFIG_ID_REPLICA", "EDGE_CONFIG_ID_REPLICA_2"] as const) {
    const id = process.env[key]?.trim();
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export function isGlobalEdgeQuorumEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EDGE_GLOBAL_QUORUM === "1";
}

export type GlobalQuorumWriteResult = {
  quorumMet: boolean;
  successCount: number;
  required: number;
  results: { edgeConfigId: string; ok: boolean }[];
};

async function patchEdgeConfig(
  edgeConfigId: string,
  items: { operation: string; key: string; value?: unknown }[],
): Promise<boolean> {
  const token = process.env.VERCEL_API_TOKEN?.trim();
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  if (!edgeConfigId || !token) return false;

  const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const res = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items${qs}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });
  return res.ok;
}

/** PATCH all regions; quorum 2/3 (or 1/1 when single region). */
export async function patchEdgeConfigGlobalQuorum(
  items: { operation: string; key: string; value?: unknown }[],
  workspaceId?: string | null,
): Promise<GlobalQuorumWriteResult> {
  const ids = resolveGlobalEdgeConfigIds(workspaceId);
  const required = ids.length >= 3 ? 2 : 1;
  const results: { edgeConfigId: string; ok: boolean }[] = [];

  for (const id of ids) {
    const ok = await patchEdgeConfig(id, items);
    results.push({ edgeConfigId: id, ok });
  }

  const successCount = results.filter((r) => r.ok).length;
  const quorumMet = successCount >= required;

  if (!quorumMet) {
    logger.warn("edge_config_global_quorum_partial", { results, required, successCount });
  }

  return { quorumMet, successCount, required, results };
}

type RegionRead = { region: string; version: number | null; payload: ThemeExperimentEdgePayload | null };

async function readFromEdgeConfigId(
  edgeConfigId: string,
  storeSlug: string,
  workspaceId?: string | null,
): Promise<RegionRead> {
  const client = getEdgeConfigClientById(edgeConfigId);
  if (!client) return { region: edgeConfigId, version: null, payload: null };

  const routingRaw = await client.get(edgeRoutingKeyForStore(storeSlug));
  const routing = parseThemeExperimentEdgeRouting(routingRaw);
  const configKey = routing?.configKey ?? edgeConfigKeyForStore(storeSlug, workspaceId);
  let raw = await client.get(configKey);
  let parsed = parseThemeExperimentEdgePayload(raw);

  if (!parsed && routing?.legacyKey && routing.legacyKey !== configKey) {
    raw = await client.get(routing.legacyKey);
    parsed = parseThemeExperimentEdgePayload(raw);
  }

  return { region: edgeConfigId, version: parsed?.version ?? null, payload: parsed };
}

/** Majority read: pick payload version that appears in > half of regions. */
export async function readThemeExperimentMajorityQuorum(
  storeSlug: string,
  workspaceId?: string | null,
): Promise<{
  payload: ThemeExperimentEdgePayload | null;
  majorityVersion: number | null;
  stale: boolean;
  conflictCount: number;
}> {
  const started = Date.now();
  const ids = resolveGlobalEdgeConfigIds(workspaceId);
  if (ids.length === 0) {
    return { payload: null, majorityVersion: null, stale: true, conflictCount: 0 };
  }

  const reads = await Promise.all(ids.map((id) => readFromEdgeConfigId(id, storeSlug, workspaceId)));
  const versionCounts = new Map<number, { count: number; payload: ThemeExperimentEdgePayload }>();

  for (const r of reads) {
    if (r.version === null || !r.payload) continue;
    const prev = versionCounts.get(r.version);
    if (prev) prev.count++;
    else versionCounts.set(r.version, { count: 1, payload: r.payload });
  }

  let bestVersion: number | null = null;
  let bestPayload: ThemeExperimentEdgePayload | null = null;
  let bestCount = 0;

  for (const [version, { count, payload }] of versionCounts) {
    if (count > bestCount) {
      bestCount = count;
      bestVersion = version;
      bestPayload = payload;
    }
  }

  const required = ids.length >= 3 ? 2 : 1;
  const quorumMet = bestCount >= required;
  const versions = [...versionCounts.keys()];
  const conflictCount = Math.max(0, versions.length - 1);

  recordExperimentSpan({
    traceId: `edge-majority-${storeSlug}`,
    spanId: `read-${started}`,
    name: "edge_config.majority_read",
    durationMs: Date.now() - started,
    fields: {
      store_slug: storeSlug,
      region_count: ids.length,
      majority_version: bestVersion,
      conflict_count: conflictCount,
      quorum_met: quorumMet,
    },
  });

  return {
    payload: quorumMet ? bestPayload : reads.find((r) => r.payload)?.payload ?? null,
    majorityVersion: bestVersion,
    stale: !quorumMet,
    conflictCount,
  };
}
