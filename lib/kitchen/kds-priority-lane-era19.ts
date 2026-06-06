import {
  formatKdsElapsedClock,
  formatKdsTicketNumber,
  isKdsTicketOverdue,
  isKdsTicketReady,
  partitionKdsQueue,
  type KdsQueueTicket,
} from "@/lib/kitchen/kds-queue-clarity-era18";
import { kdsTicketAnchor } from "@/lib/kitchen/kds-ticket-focus-era18";
import {
  KDS_PRIORITY_LANE_ERA19_POLICY_ID,
  KDS_PRIORITY_LANE_MAX_ITEMS,
} from "@/lib/kitchen/kds-priority-lane-era19-policy";

export const KDS_PRIORITY_LANE_AGGREGATOR_ERA19_POLICY_ID =
  "era19-kds-priority-lane-aggregator-v1" as const;

const ALLERGEN_PREP_BOOST = 20_000;
const ALLERGEN_EXPO_BOOST = 15_000;
const OVERDUE_PREP_BOOST = 10_000;
const OVERDUE_EXPO_BOOST = 8_000;

export type KdsPriorityTicket = KdsQueueTicket & {
  customerName?: string;
  tableName?: string | null;
  hasAllergenConflict?: boolean;
};

export type KdsPriorityReason = "allergen" | "overdue_prep" | "overdue_expo";

export type KdsPriorityLaneItem = {
  order: KdsPriorityTicket;
  score: number;
  reasons: KdsPriorityReason[];
  lane: "prep" | "expo";
  rank: number;
  ticketNumber: string;
  elapsedLabel: string;
  href: string;
};

export function scoreKdsTicketPriority(ticket: KdsPriorityTicket): number {
  const ready = isKdsTicketReady(ticket.status);
  const overdue = isKdsTicketOverdue(ticket.elapsedSeconds);
  let score = ticket.elapsedSeconds;

  if (ticket.hasAllergenConflict) {
    score += ready ? ALLERGEN_EXPO_BOOST : ALLERGEN_PREP_BOOST;
  }
  if (overdue) {
    score += ready ? OVERDUE_EXPO_BOOST : OVERDUE_PREP_BOOST;
  }

  return score;
}

export function resolveKdsPriorityReasons(ticket: KdsPriorityTicket): KdsPriorityReason[] {
  const ready = isKdsTicketReady(ticket.status);
  const overdue = isKdsTicketOverdue(ticket.elapsedSeconds);
  const reasons: KdsPriorityReason[] = [];

  if (ticket.hasAllergenConflict && !ready) {
    reasons.push("allergen");
  }
  if (overdue) {
    reasons.push(ready ? "overdue_expo" : "overdue_prep");
  }

  return reasons;
}

export function isKdsPriorityLaneCandidate(ticket: KdsPriorityTicket): boolean {
  return resolveKdsPriorityReasons(ticket).length > 0;
}

export function sortKdsTicketsByPriority<T extends KdsPriorityTicket>(orders: readonly T[]): T[] {
  return [...orders].sort(
    (left, right) => scoreKdsTicketPriority(right) - scoreKdsTicketPriority(left),
  );
}

export function partitionKdsQueueByPriority<T extends KdsPriorityTicket>(
  orders: readonly T[],
): { preparing: T[]; ready: T[] } {
  const base = partitionKdsQueue(orders);
  return {
    preparing: sortKdsTicketsByPriority(base.preparing),
    ready: sortKdsTicketsByPriority(base.ready),
  };
}

export function shouldShowKdsPriorityLane(orders: readonly KdsPriorityTicket[]): boolean {
  return orders.some(isKdsPriorityLaneCandidate);
}

export function buildKdsPriorityLaneItems(
  preparing: readonly KdsPriorityTicket[],
  ready: readonly KdsPriorityTicket[],
  maxItems: number = KDS_PRIORITY_LANE_MAX_ITEMS,
): KdsPriorityLaneItem[] {
  const candidates: KdsPriorityLaneItem[] = [];

  for (const order of preparing) {
    if (!isKdsPriorityLaneCandidate(order)) continue;
    candidates.push(mapKdsPriorityLaneItem(order, "prep"));
  }

  for (const order of ready) {
    if (!isKdsPriorityLaneCandidate(order)) continue;
    candidates.push(mapKdsPriorityLaneItem(order, "expo"));
  }

  return candidates
    .sort((left, right) => right.score - left.score)
    .slice(0, maxItems)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

function mapKdsPriorityLaneItem(
  order: KdsPriorityTicket,
  lane: "prep" | "expo",
): KdsPriorityLaneItem {
  return {
    order,
    score: scoreKdsTicketPriority(order),
    reasons: resolveKdsPriorityReasons(order),
    lane,
    rank: 0,
    ticketNumber: formatKdsTicketNumber(order.id),
    elapsedLabel: formatKdsElapsedClock(order.elapsedSeconds),
    href: kdsTicketAnchor(order.id),
  };
}

export function formatKdsPriorityReasonLabel(reason: KdsPriorityReason): string {
  switch (reason) {
    case "allergen":
      return "Allergy alert";
    case "overdue_prep":
      return "Overdue prep";
    case "overdue_expo":
      return "Overdue expo";
  }
}

export function kdsPriorityLanePolicySnapshot(): {
  policyId: typeof KDS_PRIORITY_LANE_ERA19_POLICY_ID;
  maxItems: typeof KDS_PRIORITY_LANE_MAX_ITEMS;
} {
  return {
    policyId: KDS_PRIORITY_LANE_ERA19_POLICY_ID,
    maxItems: KDS_PRIORITY_LANE_MAX_ITEMS,
  };
}
