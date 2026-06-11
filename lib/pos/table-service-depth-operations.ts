/**
 * Pure helpers for table service depth (Blueprint P2-89).
 */

export type BarModeQuickItem = {
  id: string;
  name: string;
  price: number;
  category: "beer" | "wine" | "cocktail" | "food";
};

export const BAR_MODE_QUICK_ITEMS: readonly BarModeQuickItem[] = [
  { id: "beer", name: "Beer", price: 6, category: "beer" },
  { id: "wine", name: "Wine", price: 9, category: "wine" },
  { id: "cocktail", name: "Cocktail", price: 12, category: "cocktail" },
  { id: "pizza", name: "Pizza", price: 14, category: "food" },
  { id: "burger", name: "Burger", price: 12, category: "food" },
  { id: "fries", name: "Fries", price: 5, category: "food" },
] as const;

export type ClosedTabTipRow = {
  tabName: string;
  tip: number;
  total: number;
  closedAt: string;
};

export type ServerBankingRow = {
  serverLabel: string;
  tabCount: number;
  tipsTotal: number;
  salesTotal: number;
};

export type TipsReconciliationResult = {
  declaredTips: number;
  recordedTips: number;
  variance: number;
  withinTolerance: boolean;
  message: string;
};

export function extractServerLabelFromTabName(tabName: string): string {
  const trimmed = tabName.trim();
  const dashIdx = trimmed.indexOf(" - ");
  if (dashIdx > 0) return trimmed.slice(0, dashIdx).trim();
  const pipeIdx = trimmed.indexOf("|");
  if (pipeIdx > 0) return trimmed.slice(0, pipeIdx).trim();
  return trimmed || "Unassigned";
}

export function computeServerBankingSummary(rows: ClosedTabTipRow[]): ServerBankingRow[] {
  const byServer = new Map<string, ServerBankingRow>();

  for (const row of rows) {
    const serverLabel = extractServerLabelFromTabName(row.tabName);
    const existing = byServer.get(serverLabel) ?? {
      serverLabel,
      tabCount: 0,
      tipsTotal: 0,
      salesTotal: 0,
    };
    existing.tabCount += 1;
    existing.tipsTotal = round2(existing.tipsTotal + row.tip);
    existing.salesTotal = round2(existing.salesTotal + row.total);
    byServer.set(serverLabel, existing);
  }

  return [...byServer.values()].sort((a, b) => b.tipsTotal - a.tipsTotal);
}

export function reconcileTips(input: {
  declaredTips: number;
  recordedTips: number;
  tolerancePercent?: number;
}): TipsReconciliationResult {
  const tolerance = input.tolerancePercent ?? 5;
  const variance = round2(input.recordedTips - input.declaredTips);
  const base = Math.max(input.declaredTips, 1);
  const variancePct = Math.abs(variance / base) * 100;
  const withinTolerance = variancePct <= tolerance;

  return {
    declaredTips: round2(input.declaredTips),
    recordedTips: round2(input.recordedTips),
    variance,
    withinTolerance,
    message: withinTolerance
      ? `Tips within ${tolerance}% tolerance (${variancePct.toFixed(1)}% variance).`
      : `Tips variance ${variancePct.toFixed(1)}% exceeds ${tolerance}% — manager review recommended.`,
  };
}

export function validateMergeTabs(input: {
  sourceTabId: string;
  targetTabId: string;
  sourceStatus: string;
  targetStatus: string;
}): { ok: true } | { ok: false; reason: string } {
  if (input.sourceTabId === input.targetTabId) {
    return { ok: false, reason: "Cannot merge a tab with itself." };
  }
  if (input.sourceStatus !== "OPEN" || input.targetStatus !== "OPEN") {
    return { ok: false, reason: "Both tabs must be open to merge." };
  }
  return { ok: true };
}

export function validateTransferSeat(input: {
  fromSeatId: string;
  toSeatId: string;
  itemCount: number;
}): { ok: true } | { ok: false; reason: string } {
  if (!input.fromSeatId.trim() || !input.toSeatId.trim()) {
    return { ok: false, reason: "From and to seat ids are required." };
  }
  if (input.fromSeatId === input.toSeatId) {
    return { ok: false, reason: "From and to seat must differ." };
  }
  if (input.itemCount <= 0) {
    return { ok: false, reason: "No items assigned to the source seat." };
  }
  return { ok: true };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
