/**
 * Pure null-safe helpers — regression-locked by tests/unit/null-reference-regression.test.ts
 */

export const MARKETPLACE_PO_LINE_ITEM_PRISMA_DELEGATE = "marketplacePOLineItem" as const;

/** Today page — getting-started anchor date when profile.createdAt is absent. */
export function resolveOperatorSinceDate(
  profileCreatedAt: Date | null | undefined,
  now: Date = new Date(),
): Date {
  return profileCreatedAt ?? now;
}

/** Playbook today strip — render only when a recommendation or active run exists. */
export function shouldRenderPlaybookTodayStrip<T>(
  recommended: readonly T[],
  activeRuns: readonly unknown[],
): boolean {
  return recommended.length > 0 || activeRuns.length > 0;
}

export function resolvePlaybookTopPick<T>(recommended: readonly T[]): T | undefined {
  return recommended[0];
}

/** Meal prep dashboard — never surface null customer labels in UI rows. */
export function resolveMealPrepCustomerName(
  displayName: string | null | undefined,
  name: string | null | undefined,
): string {
  const trimmedDisplay = displayName?.trim();
  if (trimmedDisplay) return trimmedDisplay;
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  return "";
}

export function isMarketplacePOLineItemDelegate(
  delegate: string,
): delegate is typeof MARKETPLACE_PO_LINE_ITEM_PRISMA_DELEGATE {
  return delegate === MARKETPLACE_PO_LINE_ITEM_PRISMA_DELEGATE;
}

type Identifiable = { id?: string | null };

/** Brand analytics — drop malformed brand rows before id-scoped Prisma queries. */
export function filterRecordsWithId<T extends Identifiable>(
  records: readonly T[],
): (T & { id: string })[] {
  return records.filter((record): record is T & { id: string } => Boolean(record?.id?.trim()));
}

export type SettledTabCountResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown };

export type OrderHubTabCountFallback = {
  id: string;
  label: string;
  internal: number;
  external: number;
  total: number;
  internalCapped?: boolean;
};

/**
 * Order hub exact counts — map Promise.allSettled results to tab rows;
 * rejected tabs fall back to zero counts instead of failing the fleet.
 */
export function resolveSettledOrderHubTabCounts<
  T extends OrderHubTabCountFallback,
>(
  tabResults: readonly SettledTabCountResult<T>[],
  tabs: readonly { id: string; label: string }[],
): T[] {
  return tabResults.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    const tab = tabs[index];
    if (!tab) {
      throw new Error(`[order-hub] missing tab metadata at index ${index}`);
    }
    return {
      id: tab.id,
      label: tab.label,
      internal: 0,
      external: 0,
      total: 0,
    } as T;
  });
}
