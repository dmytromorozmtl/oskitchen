import { logger } from "@/lib/logger";

/**
 * Wraps an async DB read for optional slow-query logging.
 * Set `QUERY_PROFILE=1` in env to emit timings over 200ms.
 */
export async function profileQuery<T>(
  label: string,
  fn: () => Promise<T>,
  slowMs = 200,
): Promise<T> {
  if (process.env.QUERY_PROFILE !== "1") {
    return fn();
  }
  const started = Date.now();
  try {
    return await fn();
  } finally {
    const ms = Date.now() - started;
    if (ms >= slowMs) {
      logger.warn("slow_query", { label, durationMs: ms });
    }
  }
}
