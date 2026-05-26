import { getWebhookJobBatchSize } from "@/lib/webhooks/webhook-job-config";

import { runWebhookJobBatch } from "./webhook-job-runner";

/** Bounded drain used by cron and manual diagnostics. */
export async function drainWebhookJobs(maxJobs?: number) {
  const cap = maxJobs ?? getWebhookJobBatchSize();
  return runWebhookJobBatch(cap);
}
