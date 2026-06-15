/**
 * Prisma query-count harness for N+1 regression tests (Absolute Final Task 53).
 */

export type PrismaCallTracker = {
  track: (label: string) => void;
  count: (label?: string) => number;
  labels: () => readonly string[];
  reset: () => void;
};

export function createPrismaCallTracker(): PrismaCallTracker {
  const calls: string[] = [];

  return {
    track(label: string) {
      calls.push(label);
    },
    count(label?: string) {
      if (!label) return calls.length;
      return calls.filter((entry) => entry === label).length;
    },
    labels() {
      return [...calls];
    },
    reset() {
      calls.length = 0;
    },
  };
}

export function assertMaxQueries(actual: number, max: number, context: string): void {
  if (actual > max) {
    throw new Error(`${context}: expected ≤${max} prisma calls, got ${actual}`);
  }
}

export type QueryScaleSample = {
  itemCount: number;
  queryCount: number;
};

/**
 * Assert query count does not grow linearly with item count (N+1 guard).
 * Allows at most `maxExtraQueriesPerItem` additional calls across the scale range.
 */
export function assertSubLinearQueryGrowth(
  samples: readonly QueryScaleSample[],
  maxExtraQueriesPerItem: number,
  context: string,
): void {
  if (samples.length < 2) return;

  const sorted = [...samples].sort((a, b) => a.itemCount - b.itemCount);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const itemDelta = last.itemCount - first.itemCount;
  const queryDelta = last.queryCount - first.queryCount;

  if (queryDelta > itemDelta * maxExtraQueriesPerItem) {
    throw new Error(
      `${context}: query count grew ${queryDelta} for +${itemDelta} items ` +
        `(max +${maxExtraQueriesPerItem}/item). Samples: ${JSON.stringify(sorted)}`,
    );
  }
}
