import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import { logger } from "@/lib/logger";
import { getWebhookJobBatchSize } from "@/lib/webhooks/webhook-job-config";
import { drainWebhookJobs } from "@/services/webhooks/webhook-job-service";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron: `vercel.json` schedules this route. Vercel sends `Authorization: Bearer CRON_SECRET`
 * when `CRON_SECRET` is configured on the project.
 */
async function handleCron(request: Request) {
  return runCronRoute(request, async () => {
  const started = Date.now();
  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "1" || url.searchParams.get("dry_run") === "1";
  const batchSize = getWebhookJobBatchSize();

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      batchSize,
      durationMs: Date.now() - started,
      processed: 0,
      retried: 0,
      failed: 0,
      skipped: 0,
    });
  }

  const stats = await drainWebhookJobs(batchSize);
  const durationMs = Date.now() - started;

  logger.info("webhook_job_cron_batch", {
    ...stats,
    durationMs,
    batchSize,
  });

  return NextResponse.json({
    ok: true,
    dryRun: false,
    batchSize,
    durationMs,
    processed: stats.succeeded,
    retried: stats.rescheduled,
    failed: stats.failed,
    skipped: stats.skipped,
    attempted: stats.attempted,
  });
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
