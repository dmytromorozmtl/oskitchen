/** Env-driven webhook worker tuning — safe defaults for pilots. */

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(String(raw ?? "").trim(), 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, 5000);
}

export function getWebhookJobBatchSize(): number {
  return parsePositiveInt(process.env.WEBHOOK_JOB_BATCH_SIZE, 40);
}

export function getWebhookJobMaxAttempts(): number {
  return parsePositiveInt(process.env.WEBHOOK_JOB_MAX_ATTEMPTS, 5);
}
