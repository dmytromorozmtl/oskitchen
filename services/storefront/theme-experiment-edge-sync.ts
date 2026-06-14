import { logger } from "@/lib/logger";
import { toJsonValue } from "@/lib/prisma/json";
import {
  buildThemeExperimentEdgePayload,
  edgeConfigKeyForStore,
} from "@/lib/storefront/theme-experiment-edge-config";
import { readEdgeExperimentVersionForStore } from "@/lib/storefront/theme-experiment-edge-read";
import {
  buildThemeExperimentEdgeRouting,
  edgeRoutingKeyForStore,
} from "@/lib/storefront/theme-experiment-edge-routing";
import { logThemeExperimentObservability } from "@/lib/storefront/theme-experiment-observability";
import { isExperimentPipelineEnabledInJson } from "@/lib/storefront/theme-experiment-pipeline";
import { pollEdgeVersionMatch } from "@/lib/storefront/theme-experiment-edge-verify";
import { isPostWinnerHoldoutActive, readPostWinnerHoldoutPercent } from "@/lib/storefront/theme-experiment-holdout";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { getThemeExperimentVersion } from "@/lib/storefront/theme-experiment-version";
import { writeVersionVectorToJson } from "@/lib/storefront/theme-experiment-crdt";
import { recordExperimentSpan } from "@/lib/storefront/experiment-trace";
import { mergeCrdtLww, readCrdtLwwState, writeCrdtLwwToJson } from "@/lib/storefront/theme-experiment-crdt-lww";
import {
  isGlobalEdgeQuorumEnabled,
  patchEdgeConfigGlobalQuorum,
} from "@/lib/storefront/theme-experiment-edge-global-quorum";
import {
  isEdgeQuorumEnabled,
  patchEdgeConfigWithQuorum,
  resolveCrdtConflict,
} from "@/lib/storefront/theme-experiment-edge-quorum";
import { resolveEdgeConfigId } from "@/lib/storefront/theme-experiment-edge-shard";
import { prisma } from "@/lib/prisma";

export type EdgeSyncResult =
  | { ok: true; skipped?: boolean; verified: boolean; version?: number }
  | { ok: false; error: string; verified: false };

/** Read current Edge Config experiment version (null when missing or API unavailable). */
export async function readEdgeExperimentVersion(storeSlug: string): Promise<number | null> {
  return readEdgeExperimentVersionForStore(storeSlug);
}

async function patchEdgeConfigItems(
  items: { operation: string; key: string; value?: unknown }[],
  workspaceId?: string | null,
): Promise<{ ok: boolean; status: number; text: string }> {
  const edgeConfigId = resolveEdgeConfigId(workspaceId);
  const token = process.env.VERCEL_API_TOKEN?.trim();
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  if (!edgeConfigId || !token) return { ok: false, status: 0, text: "not_configured" };

  const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  let lastStatus = 0;
  let lastText = "";

  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items${qs}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });
    if (res.ok) return { ok: true, status: res.status, text: "" };
    lastStatus = res.status;
    lastText = await res.text().catch(() => "");
    if (res.status >= 500 && attempt < 4) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      continue;
    }
    break;
  }
  return { ok: false, status: lastStatus, text: lastText };
}

/**
 * Upsert or delete theme experiment in Edge Config with read-after-write verify (5C+).
 * Writes routing key for workspace-aware middleware reads.
 */
export async function syncThemeExperimentToEdgeConfig(input: {
  storeSlug: string;
  storefrontId: string;
  themeExperimentJson: unknown;
  expectedVersion: number;
  workspaceId?: string | null;
}): Promise<EdgeSyncResult> {
  const sfPre =
    input.workspaceId !== undefined
      ? { workspaceId: input.workspaceId }
      : await prisma.storefrontSettings.findUnique({
          where: { id: input.storefrontId },
          select: { workspaceId: true },
        });
  const edgeConfigId = resolveEdgeConfigId(sfPre?.workspaceId);
  const token = process.env.VERCEL_API_TOKEN?.trim();
  if (!edgeConfigId || !token) {
    return { ok: true, skipped: true, verified: true };
  }

  const sf =
    input.workspaceId !== undefined
      ? { workspaceId: input.workspaceId }
      : await prisma.storefrontSettings.findUnique({
          where: { id: input.storefrontId },
          select: { workspaceId: true },
        });

  const workspaceId = sf?.workspaceId ?? null;
  const routing = buildThemeExperimentEdgeRouting({
    storeSlug: input.storeSlug,
    workspaceId,
  });

  let themeExperimentJson = input.themeExperimentJson;
  const config = parseThemeExperimentConfig(themeExperimentJson);
  const pipelineEnabled = isExperimentPipelineEnabledInJson(themeExperimentJson);
  const holdoutActive = isPostWinnerHoldoutActive(themeExperimentJson);
  const holdoutPercent = readPostWinnerHoldoutPercent(themeExperimentJson);
  const experimentEnabled = config?.enabled === true && pipelineEnabled;
  const holdoutEdgeActive = !experimentEnabled && holdoutActive && holdoutPercent > 0 && pipelineEnabled;
  const primaryKey = routing.configKey;
  const dbVersion = getThemeExperimentVersion(themeExperimentJson);
  const edgeVersionBefore = await readEdgeExperimentVersionForStore(input.storeSlug);
  const crdt = resolveCrdtConflict({ themeExperimentJson, edgeVersion: edgeVersionBefore });
  if (crdt.merged) {
    themeExperimentJson = writeVersionVectorToJson(themeExperimentJson, crdt.vector);
  }
  const lwwLocal = readCrdtLwwState(themeExperimentJson);
  if (lwwLocal && edgeVersionBefore !== null) {
    const remote = {
      vector: { ...lwwLocal.vector, edge: edgeVersionBefore },
      tombstones: lwwLocal.tombstones,
    };
    const { merged, conflict } = mergeCrdtLww(lwwLocal, remote);
    if (conflict) {
      themeExperimentJson = writeCrdtLwwToJson(themeExperimentJson, merged);
      recordExperimentSpan({
        traceId: `crdt-${input.storeSlug}`,
        spanId: `merge-${Date.now()}`,
        name: "crdt.lww_merge",
        durationMs: 0,
        fields: { store_slug: input.storeSlug, logical: merged.vector.logical },
      });
    }
  }
  const version = input.expectedVersion > 0 ? input.expectedVersion : getThemeExperimentVersion(themeExperimentJson);

  try {
    const items: { operation: string; key: string; value?: unknown }[] = [
      { operation: "upsert", key: edgeRoutingKeyForStore(input.storeSlug), value: routing },
    ];

    if (!experimentEnabled && !holdoutEdgeActive) {
      items.push(
        { operation: "delete", key: primaryKey },
        { operation: "delete", key: routing.legacyKey },
      );
    } else if (holdoutEdgeActive) {
      const value = buildThemeExperimentEdgePayload({
        storefrontId: input.storefrontId,
        config: config ?? { enabled: false, trafficPercent: 0 },
        version,
        themeExperimentJson,
        pipelineEnabled,
        holdoutOnly: true,
        holdoutPercent,
      });
      items.push({ operation: "upsert", key: primaryKey, value });
    } else {
      const value = buildThemeExperimentEdgePayload({
        storefrontId: input.storefrontId,
        config: config!,
        version,
        themeExperimentJson,
        pipelineEnabled,
      });
      items.push({ operation: "upsert", key: primaryKey, value });
    }

    const patch = isGlobalEdgeQuorumEnabled()
      ? await (async () => {
          const q = await patchEdgeConfigGlobalQuorum(items, workspaceId);
          return {
            ok: q.quorumMet,
            status: q.quorumMet ? 200 : 502,
            text: q.quorumMet ? "" : "global_quorum_failed",
          };
        })()
      : isEdgeQuorumEnabled()
        ? await (async () => {
            const q = await patchEdgeConfigWithQuorum(items, workspaceId);
            return { ok: q.quorumMet, status: q.quorumMet ? 200 : 502, text: q.quorumMet ? "" : "quorum_failed" };
          })()
        : await patchEdgeConfigItems(items, workspaceId);
    if (!patch.ok) {
      logger.warn("Edge Config experiment patch failed", { status: patch.status, text: patch.text });
      if (process.env.THEME_EXPERIMENT_EDGE_STRICT === "1") {
        return { ok: false, error: "Edge Config sync failed.", verified: false };
      }
      return { ok: true, skipped: true, verified: false };
    }

    const edgeActive = experimentEnabled || holdoutEdgeActive;
    const { matched, edgeVersion } = await pollEdgeVersionMatch({
      experimentEnabled: edgeActive,
      expectedVersion: version,
      readVersion: () => readEdgeExperimentVersionForStore(input.storeSlug),
    });

    logThemeExperimentObservability("edge_sync", {
      storeSlug: input.storeSlug,
      edge_sync_version: version,
      edge_read_version: edgeVersion,
      db_version: dbVersion,
      verified: matched,
      operation: edgeActive ? "upsert" : "delete",
      edge_config_key: primaryKey,
      workspace_id: workspaceId,
    });

    if (!matched) {
      return {
        ok: false,
        error: `version_mismatch: expected ${edgeActive ? version : "deleted"}, got ${edgeVersion ?? "null"}`,
        verified: false,
      };
    }

    return { ok: true, version, verified: true };
  } catch (e) {
    logger.warn("Edge Config experiment sync error", { error: String(e) });
    return { ok: false, error: "Edge Config sync error.", verified: false };
  }
}
