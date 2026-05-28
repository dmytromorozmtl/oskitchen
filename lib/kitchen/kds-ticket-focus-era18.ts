import {
  formatKdsElapsedClock,
  formatKdsTicketNumber,
  isKdsTicketOverdue,
  isKdsTicketReady,
  type KdsQueueSummary,
  type KdsQueueTicket,
} from "@/lib/kitchen/kds-queue-clarity-era18";
import { KDS_EXPO_BACKLOG_READY_THRESHOLD } from "@/lib/kitchen/kds-ticket-focus-era18-policy";

export type KdsTicketFocusOrder = KdsQueueTicket & {
  customerName?: string;
  tableName?: string | null;
  hasAllergenConflict?: boolean;
};

export type KdsTicketFocusSnapshot = {
  overduePrepCount: number;
  allergenPrepCount: number;
  readyBacklogCount: number;
  overdueReadyCount: number;
};

export type KdsTicketAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type KdsTicketRowNextAction = {
  label: string;
  kind: "bump" | "recall";
  tone: "urgent" | "normal";
};

export function kdsTicketAnchor(orderId: string): string {
  return `#kds-ticket-${orderId}`;
}

export function buildKdsTicketFocusSnapshot(
  orders: readonly KdsTicketFocusOrder[],
): KdsTicketFocusSnapshot {
  let overduePrepCount = 0;
  let allergenPrepCount = 0;
  let readyBacklogCount = 0;
  let overdueReadyCount = 0;

  for (const order of orders) {
    if (isKdsTicketReady(order.status)) {
      readyBacklogCount += 1;
      if (isKdsTicketOverdue(order.elapsedSeconds)) overdueReadyCount += 1;
    } else {
      if (isKdsTicketOverdue(order.elapsedSeconds)) overduePrepCount += 1;
      if (order.hasAllergenConflict) allergenPrepCount += 1;
    }
  }

  return {
    overduePrepCount,
    allergenPrepCount,
    readyBacklogCount,
    overdueReadyCount,
  };
}

export function summarizeKdsTicketFocus(
  focus: KdsTicketFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    (focus.overduePrepCount > 0 ? 1 : 0) +
    (focus.allergenPrepCount > 0 ? 1 : 0) +
    (focus.readyBacklogCount >= KDS_EXPO_BACKLOG_READY_THRESHOLD ? 1 : 0) +
    (focus.overdueReadyCount > 0 ? 1 : 0);

  const hasUrgent =
    focus.overduePrepCount > 0 ||
    focus.allergenPrepCount > 0 ||
    focus.overdueReadyCount > 0;

  return { totalSignals, hasUrgent };
}

function firstOverduePrep(
  preparing: readonly KdsTicketFocusOrder[],
): KdsTicketFocusOrder | null {
  return preparing.find((order) => isKdsTicketOverdue(order.elapsedSeconds)) ?? null;
}

function firstAllergenPrep(
  preparing: readonly KdsTicketFocusOrder[],
): KdsTicketFocusOrder | null {
  return preparing.find((order) => order.hasAllergenConflict) ?? null;
}

function oldestReady(
  ready: readonly KdsTicketFocusOrder[],
): KdsTicketFocusOrder | null {
  return ready[0] ?? null;
}

/** Kitchen display — overdue prep, allergens, and expo backlog first. */
export function pickKdsTicketAttentionItems(
  preparing: readonly KdsTicketFocusOrder[],
  ready: readonly KdsTicketFocusOrder[],
  focus: KdsTicketFocusSnapshot,
): KdsTicketAttentionItem[] {
  const items: KdsTicketAttentionItem[] = [];

  if (focus.overduePrepCount > 0) {
    const overdue = firstOverduePrep(preparing);
    items.push({
      id: "overdue-prep",
      title: `${focus.overduePrepCount} overdue ticket${focus.overduePrepCount === 1 ? "" : "s"} on the line`,
      detail: overdue
        ? `${formatKdsTicketNumber(overdue.id)} waiting ${formatKdsElapsedClock(overdue.elapsedSeconds)} — bump or re-fire before guests wait longer.`
        : "Prep tickets exceeded the 15-minute target — prioritize oldest first.",
      href: overdue ? kdsTicketAnchor(overdue.id) : kdsTicketAnchor(preparing[0]?.id ?? ""),
      priority: 4,
      tone: "urgent",
    });
  }

  if (focus.allergenPrepCount > 0) {
    const allergen = firstAllergenPrep(preparing);
    items.push({
      id: "allergen-prep",
      title: `${focus.allergenPrepCount} allergy alert${focus.allergenPrepCount === 1 ? "" : "s"} on prep`,
      detail: allergen
        ? `${formatKdsTicketNumber(allergen.id)} — verify ingredients before bumping to expo.`
        : "Allergen conflicts on the line — confirm prep before handoff.",
      href: allergen ? kdsTicketAnchor(allergen.id) : kdsTicketAnchor(preparing[0]?.id ?? ""),
      priority: 3,
      tone: "urgent",
    });
  }

  if (focus.overdueReadyCount > 0) {
    const waiting = oldestReady(ready.filter((order) => isKdsTicketOverdue(order.elapsedSeconds)));
    items.push({
      id: "overdue-expo",
      title: `${focus.overdueReadyCount} ticket${focus.overdueReadyCount === 1 ? "" : "s"} waiting too long at expo`,
      detail: waiting
        ? `${formatKdsTicketNumber(waiting.id)} on expo ${formatKdsElapsedClock(waiting.elapsedSeconds)} — run food or recall to prep.`
        : "Ready tickets exceeded wait target — expo should hand off or recall.",
      href: waiting ? kdsTicketAnchor(waiting.id) : kdsTicketAnchor(ready[0]?.id ?? ""),
      priority: 2,
      tone: "urgent",
    });
  }

  if (
    focus.readyBacklogCount >= KDS_EXPO_BACKLOG_READY_THRESHOLD &&
    items.length < 4
  ) {
    const oldest = oldestReady(ready);
    items.push({
      id: "expo-backlog",
      title: `${focus.readyBacklogCount} tickets at expo`,
      detail: oldest
        ? `Oldest ready: ${formatKdsTicketNumber(oldest.id)} — runners should pick up or recall stale tickets.`
        : "Expo backlog building — prioritize oldest ready tickets.",
      href: oldest ? kdsTicketAnchor(oldest.id) : kdsTicketAnchor(ready[0]?.id ?? ""),
      priority: 1,
      tone: focus.overdueReadyCount > 0 ? "normal" : "urgent",
    });
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

/** Row-level next action for KDS ticket cards. */
export function resolveKdsTicketRowNextAction(
  order: KdsTicketFocusOrder,
  input: { canBump: boolean; canRecall: boolean },
): KdsTicketRowNextAction | null {
  const ready = isKdsTicketReady(order.status);
  const overdue = isKdsTicketOverdue(order.elapsedSeconds);

  if (ready) {
    if (!input.canRecall) return null;
    if (overdue) {
      return { label: "Recall — waiting too long", kind: "recall", tone: "urgent" };
    }
    return { label: "Recall to prep", kind: "recall", tone: "normal" };
  }

  if (!input.canBump) return null;

  if (order.hasAllergenConflict) {
    return { label: "Bump after allergy check", kind: "bump", tone: "urgent" };
  }

  if (overdue) {
    return { label: "Bump now — overdue", kind: "bump", tone: "urgent" };
  }

  return { label: "Mark ready", kind: "bump", tone: "normal" };
}

export function shouldShowKdsTicketAttentionStrip(
  focus: KdsTicketFocusSnapshot,
  summary: KdsQueueSummary,
): boolean {
  if (summary.total === 0) return false;

  const { totalSignals } = summarizeKdsTicketFocus(focus);
  return totalSignals > 0;
}
