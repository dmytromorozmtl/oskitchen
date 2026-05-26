/** Capped exponential backoff in ms for webhook worker retries (max ~15 minutes). */
export function webhookRetryDelayMs(attemptAfterIncrement: number): number {
  const n = Math.max(1, attemptAfterIncrement);
  const base = Math.min(15 * 60 * 1000, 1000 * 2 ** Math.min(n - 1, 10));
  const jitter = Math.floor(Math.random() * 500);
  return base + jitter;
}
