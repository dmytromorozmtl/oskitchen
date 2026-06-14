import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { getThemeExperimentVersion } from "@/lib/storefront/theme-experiment-version";
import { logEdgeExperimentVersionStale } from "@/lib/storefront/theme-experiment-edge-stale";
import { edgeVersionMatchesExpected } from "@/lib/storefront/theme-experiment-edge-verify";
import { readEdgeExperimentVersion } from "@/services/storefront/theme-experiment-edge-sync";

export type EdgeSyncDashboardLabel =
  | "synced"
  | "queued"
  | "processing"
  | "retrying"
  | "dead"
  | "not_configured"
  | "app_only";

export type ThemeExperimentEdgeSyncDashboardStatus = {
  label: EdgeSyncDashboardLabel;
  headline: string;
  detail: string;
  dbVersion: number;
  edgeVersion: number | null;
  versionsMatch: boolean;
  edgeConfigured: boolean;
  lastJob: {
    id: string;
    status: string;
    expectedVersion: number;
    attemptCount: number;
    lastError: string | null;
    updatedAt: Date;
  } | null;
};

export async function getThemeExperimentEdgeSyncDashboardStatus(input: {
  storefrontId: string;
  storeSlug: string;
  themeExperimentJson: unknown;
}): Promise<ThemeExperimentEdgeSyncDashboardStatus> {
  const dbVersion = getThemeExperimentVersion(input.themeExperimentJson);
  const experimentEnabled = parseThemeExperimentConfig(input.themeExperimentJson)?.enabled === true;
  const edgeConfigured = Boolean(
    process.env.EDGE_CONFIG_ID?.trim() && process.env.VERCEL_API_TOKEN?.trim(),
  );

  const edgeVersion = edgeConfigured ? await readEdgeExperimentVersion(input.storeSlug) : null;
  const versionsMatch = edgeVersionMatchesExpected({
    experimentEnabled,
    expectedVersion: dbVersion,
    edgeVersion,
  });

  const lastJob = await prisma.storefrontEdgeSyncJob.findFirst({
    where: { storefrontId: input.storefrontId, kind: "theme_experiment" },
    orderBy: { createdAt: "desc" },
  });

  logEdgeExperimentVersionStale({
    storeSlug: input.storeSlug,
    storefrontId: input.storefrontId,
    dbVersion,
    edgeVersion,
    lastJobUpdatedAt: lastJob?.updatedAt ?? null,
    versionsMatch,
  });

  if (!edgeConfigured) {
    return {
      label: "app_only",
      headline: "Edge sync: app assigner only",
      detail: "Set EDGE_CONFIG_ID and VERCEL_API_TOKEN to sync experiment config to Vercel Edge Config.",
      dbVersion,
      edgeVersion,
      versionsMatch: true,
      edgeConfigured: false,
      lastJob: lastJob
        ? {
            id: lastJob.id,
            status: lastJob.status,
            expectedVersion: lastJob.expectedVersion,
            attemptCount: lastJob.attemptCount,
            lastError: lastJob.lastError,
            updatedAt: lastJob.updatedAt,
          }
        : null,
    };
  }

  if (lastJob?.status === "DEAD") {
    return {
      label: "dead",
      headline: `Edge sync: failed (v${lastJob.expectedVersion})`,
      detail: lastJob.lastError ?? "Check logs for storefront_edge_sync_dlq.",
      dbVersion,
      edgeVersion,
      versionsMatch,
      edgeConfigured: true,
      lastJob: {
        id: lastJob.id,
        status: lastJob.status,
        expectedVersion: lastJob.expectedVersion,
        attemptCount: lastJob.attemptCount,
        lastError: lastJob.lastError,
        updatedAt: lastJob.updatedAt,
      },
    };
  }

  if (lastJob?.status === "QUEUED" || lastJob?.status === "PROCESSING") {
    return {
      label: lastJob.status === "PROCESSING" ? "processing" : "queued",
      headline: `Edge sync: ${lastJob.status === "PROCESSING" ? "processing" : "queued"} (v${lastJob.expectedVersion})`,
      detail: "Theme publish is blocked until sync completes. Cron retries every 2 minutes.",
      dbVersion,
      edgeVersion,
      versionsMatch,
      edgeConfigured: true,
      lastJob: {
        id: lastJob.id,
        status: lastJob.status,
        expectedVersion: lastJob.expectedVersion,
        attemptCount: lastJob.attemptCount,
        lastError: lastJob.lastError,
        updatedAt: lastJob.updatedAt,
      },
    };
  }

  if (lastJob?.status === "SUCCEEDED" && versionsMatch) {
    return {
      label: "synced",
      headline: `Edge sync: synced v${dbVersion}`,
      detail: "Edge Config matches database. Arm CDN tags are safe to purge on theme publish.",
      dbVersion,
      edgeVersion,
      versionsMatch: true,
      edgeConfigured: true,
      lastJob: {
        id: lastJob.id,
        status: lastJob.status,
        expectedVersion: lastJob.expectedVersion,
        attemptCount: lastJob.attemptCount,
        lastError: lastJob.lastError,
        updatedAt: lastJob.updatedAt,
      },
    };
  }

  if (lastJob?.lastError && lastJob.status === "SUCCEEDED" && !versionsMatch) {
    return {
      label: "retrying",
      headline: `Edge sync: verifying v${dbVersion}`,
      detail: `Edge read v${edgeVersion ?? "—"} — waiting for propagation. Save again or wait for cron.`,
      dbVersion,
      edgeVersion,
      versionsMatch,
      edgeConfigured: true,
      lastJob: {
        id: lastJob.id,
        status: lastJob.status,
        expectedVersion: lastJob.expectedVersion,
        attemptCount: lastJob.attemptCount,
        lastError: lastJob.lastError,
        updatedAt: lastJob.updatedAt,
      },
    };
  }

  return {
    label: versionsMatch ? "synced" : "retrying",
    headline: versionsMatch ? `Edge sync: synced v${dbVersion}` : `Edge sync: drift (DB v${dbVersion}, Edge v${edgeVersion ?? "—"})`,
    detail: versionsMatch
      ? "Config aligned."
      : "Save experiment again to enqueue a fresh sync job.",
    dbVersion,
    edgeVersion,
    versionsMatch,
    edgeConfigured: true,
    lastJob: lastJob
      ? {
          id: lastJob.id,
          status: lastJob.status,
          expectedVersion: lastJob.expectedVersion,
          attemptCount: lastJob.attemptCount,
          lastError: lastJob.lastError,
          updatedAt: lastJob.updatedAt,
        }
      : null,
  };
}

/** Pure helper — safe for Server Components (do not import from client modules). */
export function edgeSyncCanRetry(status: ThemeExperimentEdgeSyncDashboardStatus): boolean {
  return (
    status.edgeConfigured &&
    (status.label === "dead" ||
      status.label === "retrying" ||
      status.label === "queued" ||
      !status.versionsMatch)
  );
}
