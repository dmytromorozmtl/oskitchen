import { batchQueries } from "@/lib/db/query-batch";

export { batchQueries };

type QueryMap = Record<string, () => Promise<unknown>>;

/**
 * Run named independent reads in parallel (one round-trip wave).
 */
export async function batchNamedQueries<T extends QueryMap>(
  queries: T,
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const keys = Object.keys(queries) as (keyof T)[];
  const values = await Promise.all(keys.map((key) => queries[key]()));
  return Object.fromEntries(keys.map((key, i) => [key, values[i]])) as {
    [K in keyof T]: Awaited<ReturnType<T[K]>>;
  };
}

/** Parallel reads with a hard timeout — fails fast under pool pressure. */
export async function parallelRead<T>(
  queries: Promise<T>[],
  timeoutMs = 5000,
): Promise<T[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.all(queries),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
