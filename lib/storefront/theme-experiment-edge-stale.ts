import { logger } from "@/lib/logger";

export const EDGE_VERSION_STALE_TTL_MS = 5 * 60 * 1000;

/** Structured log for Vercel log drain / metrics — DB vs Edge version drift beyond TTL. */
export function logEdgeExperimentVersionStale(input: {
  storeSlug: string;
  storefrontId: string;
  dbVersion: number;
  edgeVersion: number | null;
  lastJobUpdatedAt: Date | null;
  versionsMatch: boolean;
}): void {
  if (input.versionsMatch) return;
  if (input.edgeVersion === null) return;

  const ageMs = input.lastJobUpdatedAt
    ? Date.now() - input.lastJobUpdatedAt.getTime()
    : EDGE_VERSION_STALE_TTL_MS + 1;

  if (ageMs < EDGE_VERSION_STALE_TTL_MS) return;

  logger.warn("storefront_edge_version_stale", {
    alert_type: "storefront_edge_version_stale",
    severity: "warning",
    component: "theme_experiment_edge",
    storeSlug: input.storeSlug,
    storefrontId: input.storefrontId,
    db_version: input.dbVersion,
    edge_version: input.edgeVersion,
    stale_age_ms: ageMs,
    stale_ttl_ms: EDGE_VERSION_STALE_TTL_MS,
  });
}
