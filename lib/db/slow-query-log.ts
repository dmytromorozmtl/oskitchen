/**
 * Placeholder for Prisma query logging extension.
 * Wire via `prisma.$extends` when you need slow-query capture to APM.
 */
export const SLOW_QUERY_MS_THRESHOLD = 750;

export function describeSlowQueryPlaceholder(): string {
  return `Log queries slower than ${SLOW_QUERY_MS_THRESHOLD}ms via prisma.$extends or external APM.`;
}
