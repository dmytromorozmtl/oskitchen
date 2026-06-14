import type { StorefrontEdgeSyncJobStatus } from "@prisma/client";
import { toJsonValue } from "@/lib/prisma/json";

import { prisma } from "@/lib/prisma";
import {
  purgeStorefrontCdnAfterThemePublish,
  purgeStorefrontThemeExperimentArmTags,
} from "@/lib/storefront/cdn-purge";
import { parseThemeExperimentStored } from "@/lib/storefront/theme-experiment-version";
import { logEdgeSyncDlq, logThemeExperimentObservability } from "@/lib/storefront/theme-experiment-observability";
import { getThemeExperimentVersion } from "@/lib/storefront/theme-experiment-version";
import { syncThemeExperimentToEdgeConfig } from "@/services/storefront/theme-experiment-edge-sync";

const RETRY_BACKOFF_MS = [60_000, 120_000, 300_000, 600_000, 900_000];

function nextBackoff(attemptCount: number): Date {
  const ms = RETRY_BACKOFF_MS[Math.min(attemptCount, RETRY_BACKOFF_MS.length - 1)] ?? 900_000;
  return new Date(Date.now() + ms);
}

/** CDN purge only after verified edge sync (versions aligned). */
async function purgeCdnAfterVerifiedEdgeSync(storefrontId: string): Promise<void> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: storefrontId },
    select: {
      id: true,
      storeSlug: true,
      themePublishedAt: true,
      themeExperimentJson: true,
    },
  });
  if (!sf) return;

  const stored = parseThemeExperimentStored(sf.themeExperimentJson);
  if (stored?.enabled) {
    await purgeStorefrontCdnAfterThemePublish({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      themePublishedAt: sf.themePublishedAt,
      themeExperimentJson: sf.themeExperimentJson,
    });
  } else {
    await purgeStorefrontThemeExperimentArmTags(sf.storeSlug);
  }

  logThemeExperimentObservability("cdn_purge_after_edge_sync", {
    storeSlug: sf.storeSlug,
    edge_sync_version: getThemeExperimentVersion(sf.themeExperimentJson),
    experiment_enabled: stored?.enabled === true,
  });
}

export async function countBlockingEdgeSyncJobs(storefrontId: string): Promise<number> {
  return prisma.storefrontEdgeSyncJob.count({
    where: {
      storefrontId,
      kind: "theme_experiment",
      status: { in: ["QUEUED", "PROCESSING"] },
    },
  });
}

/**
 * Re-queue edge sync with current DB payload — does **not** bump `themeExperimentJson.version`.
 * Use from Advanced “Retry edge sync” after drift or DLQ recovery.
 */
export async function reenqueueThemeExperimentEdgeSync(input: {
  storefrontId: string;
  storeSlug: string;
  themeExperimentJson: unknown;
}): Promise<{ jobId: string; synced: boolean; error?: string }> {
  const expectedVersion = getThemeExperimentVersion(input.themeExperimentJson);

  const job = await prisma.storefrontEdgeSyncJob.create({
    data: {
      storefrontId: input.storefrontId,
      storeSlug: input.storeSlug,
      kind: "theme_experiment",
      payloadJson: input.themeExperimentJson as object,
      expectedVersion,
      status: "QUEUED",
      nextAttemptAt: new Date(),
    },
  });

  const result = await processEdgeSyncJobById(job.id);
  return {
    jobId: job.id,
    synced: result.status === "SUCCEEDED",
    error: result.lastError ?? undefined,
  };
}

/** Enqueue outbox row and attempt immediate sync (5C). */
export async function enqueueThemeExperimentEdgeSync(input: {
  storefrontId: string;
  storeSlug: string;
  themeExperimentJson: unknown;
}): Promise<{ jobId: string; synced: boolean; error?: string }> {
  const expectedVersion = getThemeExperimentVersion(input.themeExperimentJson);

  const job = await prisma.storefrontEdgeSyncJob.create({
    data: {
      storefrontId: input.storefrontId,
      storeSlug: input.storeSlug,
      kind: "theme_experiment",
      payloadJson: input.themeExperimentJson as object,
      expectedVersion,
      status: "QUEUED",
      nextAttemptAt: new Date(),
    },
  });

  const result = await processEdgeSyncJobById(job.id);
  return {
    jobId: job.id,
    synced: result.status === "SUCCEEDED",
    error: result.lastError ?? undefined,
  };
}

export async function processEdgeSyncJobById(jobId: string): Promise<{
  status: StorefrontEdgeSyncJobStatus;
  lastError: string | null;
}> {
  const job = await prisma.storefrontEdgeSyncJob.findUnique({ where: { id: jobId } });
  if (!job) return { status: "DEAD", lastError: "job_not_found" };

  if (job.status === "SUCCEEDED" || job.status === "DEAD") {
    return { status: job.status, lastError: job.lastError };
  }

  await prisma.storefrontEdgeSyncJob.update({
    where: { id: job.id },
    data: { status: "PROCESSING", attemptCount: { increment: 1 } },
  });

  const sync = await syncThemeExperimentToEdgeConfig({
    storeSlug: job.storeSlug,
    storefrontId: job.storefrontId,
    themeExperimentJson: job.payloadJson,
    expectedVersion: job.expectedVersion,
  });

  if (sync.ok && sync.verified) {
    await prisma.storefrontEdgeSyncJob.update({
      where: { id: job.id },
      data: { status: "SUCCEEDED", lastError: null, nextAttemptAt: null },
    });
    await purgeCdnAfterVerifiedEdgeSync(job.storefrontId);
    logThemeExperimentObservability("edge_sync_job_succeeded", {
      jobId: job.id,
      storeSlug: job.storeSlug,
      edge_sync_version: job.expectedVersion,
      verified: true,
    });
    return { status: "SUCCEEDED", lastError: null };
  }

  if (sync.ok && sync.skipped) {
    await prisma.storefrontEdgeSyncJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        lastError: "edge_config_skipped",
        nextAttemptAt: null,
      },
    });
    return { status: "SUCCEEDED", lastError: "edge_config_skipped" };
  }

  const updated = await prisma.storefrontEdgeSyncJob.findUnique({ where: { id: job.id } });
  const attempts = updated?.attemptCount ?? job.attemptCount + 1;
  const max = job.maxAttempts;
  const err = !sync.ok ? sync.error : "verify_failed";

  if (attempts >= max) {
    await prisma.storefrontEdgeSyncJob.update({
      where: { id: job.id },
      data: { status: "DEAD", lastError: err, nextAttemptAt: null },
    });
    logEdgeSyncDlq({
      jobId: job.id,
      storefrontId: job.storefrontId,
      storeSlug: job.storeSlug,
      expectedVersion: job.expectedVersion,
      attemptCount: attempts,
      lastError: err,
    });
    return { status: "DEAD", lastError: err };
  }

  await prisma.storefrontEdgeSyncJob.update({
    where: { id: job.id },
    data: {
      status: "QUEUED",
      lastError: err,
      nextAttemptAt: nextBackoff(attempts - 1),
    },
  });
  return { status: "QUEUED", lastError: err };
}

export async function drainStorefrontEdgeSyncJobs(batchSize = 20): Promise<{
  attempted: number;
  succeeded: number;
  rescheduled: number;
  dead: number;
}> {
  const now = new Date();
  const jobs = await prisma.storefrontEdgeSyncJob.findMany({
    where: {
      status: "QUEUED",
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
    },
    orderBy: { createdAt: "asc" },
    take: batchSize,
  });

  let succeeded = 0;
  let rescheduled = 0;
  let dead = 0;

  for (const job of jobs) {
    const r = await processEdgeSyncJobById(job.id);
    if (r.status === "SUCCEEDED") succeeded++;
    else if (r.status === "DEAD") dead++;
    else rescheduled++;
  }

  return { attempted: jobs.length, succeeded, rescheduled, dead };
}
