import {
  formatKdsElapsedClock,
  formatKdsTicketNumber,
  isKdsTicketOverdue,
  type KdsQueueTicket,
} from "@/lib/kitchen/kds-queue-clarity-era18";

export type KdsBumpNextTicket = KdsQueueTicket & {
  customerName?: string;
  tableName?: string | null;
};

export function pickKdsBumpNextTicket<T extends KdsBumpNextTicket>(
  preparing: readonly T[],
): T | null {
  return preparing[0] ?? null;
}

export function pickKdsRecallNextTicket<T extends KdsBumpNextTicket>(
  ready: readonly T[],
): T | null {
  return ready[0] ?? null;
}

export function shouldShowKdsBumpNextHero(input: {
  canBump: boolean;
  preparingCount: number;
}): boolean {
  return input.canBump && input.preparingCount > 0;
}

export function shouldShowKdsRecallNextHero(input: {
  canRecall: boolean;
  readyCount: number;
}): boolean {
  return input.canRecall && input.readyCount > 0;
}

export function kdsBumpNextDetail(ticket: KdsBumpNextTicket): string {
  const parts: string[] = [];
  if (ticket.tableName?.trim()) parts.push(`Table ${ticket.tableName.trim()}`);
  parts.push(`Waiting ${formatKdsElapsedClock(ticket.elapsedSeconds)}`);
  return parts.join(" · ");
}

export function kdsBumpNextLabel(ticket: KdsBumpNextTicket): string {
  const number = formatKdsTicketNumber(ticket.id);
  const name = ticket.customerName?.trim();
  return name ? `${number} · ${name}` : number;
}

export function isKdsBumpNextUrgent(ticket: KdsBumpNextTicket): boolean {
  return isKdsTicketOverdue(ticket.elapsedSeconds);
}
