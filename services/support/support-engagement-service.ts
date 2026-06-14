import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@prisma/client";

import { addMinutes } from "@/lib/support/support-sla";
import { isOpenSupportStatus } from "@/lib/support/support-status";
import { resolveSlaFirstResponseMinutes } from "@/services/support/sla-service";

export type SupportFirstResponseStampInput = {
  firstResponseAt: Date | null;
  actorCanTriage: boolean;
  actorIsAssignedOwner: boolean;
};

export type SupportEscalationEngagementState =
  | "none"
  | "missing_ticket"
  | "unassigned"
  | "awaiting_first_response"
  | "first_response_overdue"
  | "engaged"
  | "resolved";

export type SupportEscalationTicketSnapshot = {
  status: SupportTicketStatus;
  assignedToId: string | null;
  firstResponseAt: Date | null;
};

export function resolveFirstResponseStamp(
  input: SupportFirstResponseStampInput,
  now: Date,
): Date | null {
  if (input.firstResponseAt) return input.firstResponseAt;
  if (!input.actorCanTriage && !input.actorIsAssignedOwner) return null;
  return now;
}

export async function computeSupportTicketFirstResponseDueAt(params: {
  createdAt: Date;
  workspaceId: string | null;
  priority: SupportTicketPriority;
  category: SupportTicketCategory;
}): Promise<Date> {
  const minutes = await resolveSlaFirstResponseMinutes({
    workspaceId: params.workspaceId,
    priority: params.priority,
    category: params.category,
  });
  return addMinutes(params.createdAt, minutes);
}

export function deriveSupportEscalationEngagementState(params: {
  ticket: SupportEscalationTicketSnapshot | null;
  firstResponseDueAt: Date | null;
  now: Date;
}): SupportEscalationEngagementState {
  const { ticket, firstResponseDueAt, now } = params;
  if (!ticket) return "missing_ticket";
  if (!isOpenSupportStatus(ticket.status)) return "resolved";
  if (!ticket.assignedToId) return "unassigned";
  if (ticket.firstResponseAt) return "engaged";
  if (firstResponseDueAt && now.getTime() > firstResponseDueAt.getTime()) {
    return "first_response_overdue";
  }
  return "awaiting_first_response";
}
