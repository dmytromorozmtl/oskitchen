type Bucket = { count: number; windowStart: number };

const store = new Map<string, Bucket>();

function prune(key: string, windowMs: number) {
  const b = store.get(key);
  if (!b) return;
  if (Date.now() - b.windowStart > windowMs * 2) store.delete(key);
}

/** Simple fixed-window counter (per-process). Good for single-region serverless pilots — not a distributed quota. */
export function checkRateLimit(
  key: string,
  opts: { windowMs: number; max: number },
): { ok: boolean; retryAfterMs?: number } {
  prune(key, opts.windowMs);
  const now = Date.now();
  let b = store.get(key);
  if (!b || now - b.windowStart >= opts.windowMs) {
    b = { count: 0, windowStart: now };
    store.set(key, b);
  }
  if (b.count >= opts.max) {
    const retryAfterMs = opts.windowMs - (now - b.windowStart);
    return { ok: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }
  b.count += 1;
  return { ok: true };
}
