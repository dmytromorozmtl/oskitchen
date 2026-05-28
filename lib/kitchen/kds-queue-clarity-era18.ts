/** KDS queue clarity helpers — Evolution Era 18 Workstream G. */

export const KDS_OVERDUE_SECONDS = 900;

export type KdsQueueTicket = {
  id: string;
  status: string;
  elapsedSeconds: number;
  createdAt: string;
};

export type KdsQueueSummary = {
  total: number;
  preparing: number;
  ready: number;
  overdue: number;
  oldestPrepSeconds: number | null;
};

export type KdsQueuePartition<T extends KdsQueueTicket> = {
  preparing: T[];
  ready: T[];
};

export function isKdsTicketOverdue(
  elapsedSeconds: number,
  thresholdSeconds = KDS_OVERDUE_SECONDS,
): boolean {
  return elapsedSeconds >= thresholdSeconds;
}

export function isKdsTicketReady(status: string): boolean {
  return status === "READY" || status === "COMPLETED";
}

export function summarizeKdsQueue(orders: readonly KdsQueueTicket[]): KdsQueueSummary {
  let preparing = 0;
  let ready = 0;
  let overdue = 0;
  let oldestPrepSeconds: number | null = null;

  for (const order of orders) {
    if (isKdsTicketReady(order.status)) {
      ready += 1;
    } else {
      preparing += 1;
      if (oldestPrepSeconds === null || order.elapsedSeconds > oldestPrepSeconds) {
        oldestPrepSeconds = order.elapsedSeconds;
      }
    }
    if (isKdsTicketOverdue(order.elapsedSeconds)) {
      overdue += 1;
    }
  }

  return {
    total: orders.length,
    preparing,
    ready,
    overdue,
    oldestPrepSeconds,
  };
}

/** Oldest tickets first — line cooks see longest-waiting prep at the top. */
export function sortKdsTicketsOldestFirst<T extends KdsQueueTicket>(orders: readonly T[]): T[] {
  return [...orders].sort((left, right) => right.elapsedSeconds - left.elapsedSeconds);
}

export function partitionKdsQueue<T extends KdsQueueTicket>(orders: readonly T[]): KdsQueuePartition<T> {
  const preparing: T[] = [];
  const ready: T[] = [];

  for (const order of orders) {
    if (isKdsTicketReady(order.status)) {
      ready.push(order);
    } else {
      preparing.push(order);
    }
  }

  return {
    preparing: sortKdsTicketsOldestFirst(preparing),
    ready: sortKdsTicketsOldestFirst(ready),
  };
}

export function formatKdsTicketNumber(orderId: string): string {
  const compact = orderId.replace(/-/g, "").slice(-6).toUpperCase();
  return `#${compact || orderId.slice(0, 6).toUpperCase()}`;
}

export function formatKdsElapsedClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function kdsTicketAgeClassName(elapsedSeconds: number): string {
  if (elapsedSeconds < 300) {
    return "border-l-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30";
  }
  if (elapsedSeconds < 600) {
    return "border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/30";
  }
  if (elapsedSeconds < 1200) {
    return "border-l-orange-500 bg-orange-50/80 dark:bg-orange-950/30";
  }
  return "border-l-rose-500 bg-rose-50/80 dark:bg-rose-950/30";
}
