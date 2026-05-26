import { SupportTicketStatus } from "@prisma/client";

export const SUPPORT_STATUS_LABEL: Record<SupportTicketStatus, string> = {
  NEW: "New",
  OPEN: "Open",
  WAITING: "Waiting",
  TRIAGED: "Triaged",
  WAITING_ON_SUPPORT: "Waiting on support",
  WAITING_ON_CUSTOMER: "Waiting on customer",
  IN_PROGRESS: "In progress",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  DUPLICATE: "Duplicate",
  CANCELLED: "Cancelled",
};

/** Non-terminal statuses — use in Prisma `in` filters so queries work if PG enum lacks CANCELLED/DUPLICATE yet. */
export const OPEN_SUPPORT_TICKET_STATUSES = [
  SupportTicketStatus.NEW,
  SupportTicketStatus.OPEN,
  SupportTicketStatus.TRIAGED,
  SupportTicketStatus.WAITING_ON_SUPPORT,
  SupportTicketStatus.WAITING_ON_CUSTOMER,
  SupportTicketStatus.WAITING,
  SupportTicketStatus.IN_PROGRESS,
  SupportTicketStatus.ESCALATED,
] as const;

const OPEN_SET = new Set<SupportTicketStatus>(OPEN_SUPPORT_TICKET_STATUSES);

export function isOpenSupportStatus(status: SupportTicketStatus): boolean {
  return OPEN_SET.has(status);
}

export const SUPPORT_STATUS_BADGE_VARIANT: Partial<
  Record<SupportTicketStatus, "default" | "secondary" | "destructive" | "outline">
> = {
  NEW: "default",
  ESCALATED: "destructive",
  RESOLVED: "secondary",
  CLOSED: "outline",
  DUPLICATE: "outline",
  CANCELLED: "outline",
};
