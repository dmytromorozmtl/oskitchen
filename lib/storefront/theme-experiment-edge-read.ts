import {
  edgeConfigKeyForStore,
  parseThemeExperimentEdgePayload,
  type ThemeExperimentEdgePayload,
} from "@/lib/storefront/theme-experiment-edge-config";
import {
  edgeRoutingKeyForStore,
  parseThemeExperimentEdgeRouting,
} from "@/lib/storefront/theme-experiment-edge-routing";
import {
  getEdgeConfigClient,
  getFallbackEdgeConfigClient,
} from "@/lib/storefront/theme-experiment-edge-connection";
import {
  createExperimentSpanId,
  createExperimentTraceId,
  recordExperimentSpan,
} from "@/lib/storefront/experiment-trace";
import {
  getEdgeConfigClientById,
  isGlobalEdgeQuorumEnabled,
  readThemeExperimentMajorityQuorum,
} from "@/lib/storefront/theme-experiment-edge-global-quorum";
import { isCrdtGossipBusEnabled, localEdgeRegionId } from "@/lib/storefront/theme-experiment-crdt-gossip";
import { logger } from "@/lib/logger";

async function readFromClient(
  client: Awaited<ReturnType<typeof getEdgeConfigClient>>,
  storeSlug: string,
  workspaceId?: string | null,
): Promise<ThemeExperimentEdgePayload | null> {
  const routingRaw = await client.get(edgeRoutingKeyForStore(storeSlug));
  const routing = parseThemeExperimentEdgeRouting(routingRaw);
  const configKey = routing?.configKey ?? edgeConfigKeyForStore(storeSlug, workspaceId);
  let raw = await client.get(configKey);
  let parsed = parseThemeExperimentEdgePayload(raw);

  if (!parsed && routing?.legacyKey && routing.legacyKey !== configKey) {
    raw = await client.get(routing.legacyKey);
    parsed = parseThemeExperimentEdgePayload(raw);
  }
  return parsed;
}

/** Resolve experiment payload key via routing object (workspace-aware, shard + failover). */
export async function readThemeExperimentFromEdgeConfig(
  storeSlug: string,
  workspaceId?: string | null,
): Promise<ThemeExperimentEdgePayload | null> {
  const started = Date.now();
  const traceId = createExperimentTraceId();
  const spanId = createExperimentSpanId();

  try {
    let parsed: ThemeExperimentEdgePayload | null = null;
    let region = "primary";
    let conflictCount = 0;

    if (isCrdtGossipBusEnabled() && localEdgeRegionId()) {
      const localClient = getEdgeConfigClientById(localEdgeRegionId()!);
      if (localClient) {
        parsed = await readFromClient(localClient, storeSlug, workspaceId);
        region = "local_replica";
      }
    }

    if (!parsed && isGlobalEdgeQuorumEnabled()) {
      const majority = await readThemeExperimentMajorityQuorum(storeSlug, workspaceId);
      parsed = majority.payload;
      region = majority.stale ? "majority_stale" : "majority";
      conflictCount = majority.conflictCount;
    } else if (!parsed) {
      const primary = getEdgeConfigClient(workspaceId);
      parsed = await readFromClient(primary, storeSlug, workspaceId);

      if (!parsed) {
        const fallback = getFallbackEdgeConfigClient();
        if (fallback) {
          parsed = await readFromClient(fallback, storeSlug, workspaceId);
          region = "fallback";
        }
      }
    }

    const durationMs = Date.now() - started;
    recordExperimentSpan({
      traceId,
      spanId,
      name: "edge_config.read",
      durationMs,
      fields: {
        store_slug: storeSlug,
        hit: Boolean(parsed),
        edge_region: region,
        workspace_id: workspaceId ?? null,
        crdt_conflict_count: conflictCount,
      },
    });

    logger.info("storefront_edge_config_read", {
      alert_type: "storefront_edge_config_read_latency_ms",
      store_slug: storeSlug,
      duration_ms: durationMs,
      hit: Boolean(parsed),
      edge_region: region,
      workspace_id: workspaceId ?? null,
    });

    return parsed;
  } catch {
    const durationMs = Date.now() - started;
    logger.warn("storefront_edge_config_read_failed", {
      store_slug: storeSlug,
      duration_ms: durationMs,
      workspace_id: workspaceId ?? null,
    });
    recordExperimentSpan({
      traceId,
      spanId,
      name: "edge_config.read",
      durationMs,
      fields: { store_slug: storeSlug, hit: false, error: true },
    });
    return null;
  }
}

export async function readEdgeExperimentVersionForStore(
  storeSlug: string,
  workspaceId?: string | null,
): Promise<number | null> {
  const parsed = await readThemeExperimentFromEdgeConfig(storeSlug, workspaceId);
  return parsed?.version ?? null;
}
