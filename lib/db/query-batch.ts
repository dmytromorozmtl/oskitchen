/**
 * Run independent Prisma reads in parallel — reduces POS/dashboard waterfall latency.
 */
export async function batchQueries<T extends readonly unknown[]>(
  queries: { [K in keyof T]: () => Promise<T[K]> },
): Promise<T> {
  const results = await Promise.all(queries.map((q) => q()));
  return results as unknown as T;
}
