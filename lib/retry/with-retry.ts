export type RetryOptions = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Exponential backoff with jitter for flaky IO (integrations, webhooks). */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions): Promise<T> {
  const maxDelay = opts.maxDelayMs ?? 8_000;
  let lastError: unknown;
  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt === opts.retries) break;
      const exp = Math.min(maxDelay, opts.baseDelayMs * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 250);
      await sleep(exp + jitter);
    }
  }
  throw lastError;
}
