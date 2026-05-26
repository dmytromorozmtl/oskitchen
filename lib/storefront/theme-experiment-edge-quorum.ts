import { logger } from "@/lib/logger";
import { resolveEdgeConfigId } from "@/lib/storefront/theme-experiment-edge-shard";
import { mergeVersionVectorOnSync, readVersionVector, type ExperimentVersionVector } from "@/lib/storefront/theme-experiment-crdt";

export type EdgeQuorumWriteResult = {
  primaryOk: boolean;
  replicaOk: boolean;
  quorumMet: boolean;
  primaryId: string | null;
  replicaId: string | null;
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

/** Multi-region write: primary shard + optional replica (EDGE_CONFIG_ID_REPLICA). */
export async function patchEdgeConfigWithQuorum(
  items: { operation: string; key: string; value?: unknown }[],
  workspaceId?: string | null,
): Promise<EdgeQuorumWriteResult> {
  const primaryId = resolveEdgeConfigId(workspaceId);
  const replicaId = process.env.EDGE_CONFIG_ID_REPLICA?.trim() ?? null;

  const primaryOk = primaryId ? await patchEdgeConfig(primaryId, items) : false;
  const replicaOk = replicaId ? await patchEdgeConfig(replicaId, items) : true;
  const quorumMet = primaryOk && (replicaOk || !replicaId);

  if (!quorumMet) {
    logger.warn("edge_config_quorum_write_partial", {
      primaryOk,
      replicaOk,
      primaryId,
      replicaId,
    });
  }

  return { primaryOk, replicaOk, quorumMet, primaryId, replicaId };
}

/** CRDT merge when concurrent saves detected (db vs edge divergence). */
export function resolveCrdtConflict(input: {
  themeExperimentJson: unknown;
  edgeVersion: number | null;
}): { vector: ExperimentVersionVector; merged: boolean } {
  const vector = readVersionVector(input.themeExperimentJson);
  if (input.edgeVersion === null) return { vector, merged: false };

  if (vector.db === input.edgeVersion) {
    return { vector, merged: false };
  }

  const merged = mergeVersionVectorOnSync(vector, input.edgeVersion);
  logger.info("experiment_crdt_merge", {
    db: vector.db,
    edge: input.edgeVersion,
    logical: merged.logical,
  });
  return { vector: merged, merged: true };
}

export function isEdgeQuorumEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EDGE_QUORUM === "1";
}
