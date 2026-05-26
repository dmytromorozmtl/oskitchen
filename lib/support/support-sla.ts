import type { SupportTicketPriority } from "@prisma/client";

/** Fallback resolution SLA in minutes when no DB policy row matches. */
export const DEFAULT_RESOLUTION_SLA_MINUTES: Record<SupportTicketPriority, number> = {
  CRITICAL: 24 * 60,
  URGENT: 48 * 60,
  HIGH: 3 * 8 * 60,
  MEDIUM: 5 * 8 * 60,
  LOW: 7 * 24 * 60,
};

export const DEFAULT_FIRST_RESPONSE_SLA_MINUTES: Record<SupportTicketPriority, number> = {
  CRITICAL: 60,
  URGENT: 4 * 60,
  HIGH: 8 * 60,
  MEDIUM: 24 * 60,
  LOW: 48 * 60,
};

export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}
