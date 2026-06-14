import type { SupportTicket } from "@prisma/client";

import { notifyGrowthInbound } from "@/lib/growth/growth-notify";
import { isOpenSupportStatus } from "@/lib/support/support-status";

/** Heuristic escalation signals (does not send synthetic email). */
export function evaluateEscalationSignals(ticket: SupportTicket): string[] {
  const reasons: string[] = [];
  const now = Date.now();
  if (ticket.slaDueAt && ticket.slaDueAt.getTime() < now && isOpenSupportStatus(ticket.status)) {
    reasons.push("SLA overdue");
  }
  if (ticket.priority === "CRITICAL") reasons.push("Critical priority");
  if (ticket.category === "SECURITY") reasons.push("Security category");
  if (ticket.status === "ESCALATED") reasons.push("Already escalated");
  return reasons;
}

export async function escalateSupportTicketNotify(params: {
  ticket: Pick<SupportTicket, "id" | "subject" | "email" | "category" | "priority">;
  reasons: string[];
}) {
  const body = `Ticket ${params.ticket.id}\nSubject: ${params.ticket.subject}\nRequester: ${params.ticket.email}\nReasons: ${params.reasons.join("; ")}`;
  return notifyGrowthInbound(`Support escalation: ${params.ticket.subject}`, body);
}
