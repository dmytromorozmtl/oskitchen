import { isOpenSupportStatus } from "@/lib/support/support-status";
import type { PlatformSupportInboxSnapshot } from "@/services/platform/platform-support-service";

export type PlatformSupportInboxTicketFocus = {
  id: string;
  status: string;
  priority: string;
  category: string;
  assignedToId: string | null;
  slaDueAt: string | null;
};

export type PlatformSupportInboxFocusSnapshot = {
  overdueSla: number;
  criticalIssues: number;
  integrationIssues: number;
  escalatedTickets: number;
  awaitingResponse: number;
  assignedToMe: number;
  unassignedUrgent: number;
};

export type PlatformSupportInboxAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type PlatformSupportTicketRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

const TERMINAL_STATUSES = new Set(["RESOLVED", "CLOSED", "CANCELLED", "DUPLICATE"]);

function isOpenTicket(status: string): boolean {
  return isOpenSupportStatus(status as Parameters<typeof isOpenSupportStatus>[0]);
}

export function buildPlatformSupportInboxFocusSnapshot(
  snapshot: PlatformSupportInboxSnapshot,
  tickets: readonly PlatformSupportInboxTicketFocus[],
): PlatformSupportInboxFocusSnapshot {
  let unassignedUrgent = 0;

  for (const ticket of tickets) {
    if (!isOpenTicket(ticket.status)) continue;
    if (
      !ticket.assignedToId &&
      (ticket.priority === "CRITICAL" || ticket.priority === "HIGH")
    ) {
      unassignedUrgent += 1;
    }
  }

  return {
    overdueSla: snapshot.kpis.overdueSla,
    criticalIssues: snapshot.kpis.criticalIssues,
    integrationIssues: snapshot.kpis.integrationIssues,
    escalatedTickets: snapshot.kpis.escalatedTickets,
    awaitingResponse: snapshot.kpis.awaitingResponse,
    assignedToMe: snapshot.kpis.assignedToMe,
    unassignedUrgent,
  };
}

export function summarizePlatformSupportInboxFocus(
  focus: PlatformSupportInboxFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    focus.overdueSla +
    focus.criticalIssues +
    focus.integrationIssues +
    focus.escalatedTickets +
    focus.awaitingResponse +
    focus.unassignedUrgent;

  const hasUrgent =
    focus.overdueSla > 0 ||
    focus.criticalIssues > 0 ||
    focus.integrationIssues > 0 ||
    focus.escalatedTickets > 0 ||
    focus.unassignedUrgent > 0;

  return { totalSignals, hasUrgent };
}

/** Cross-tenant support queue — SLA and pilot blockers first. */
export function pickPlatformSupportInboxAttentionItems(
  focus: PlatformSupportInboxFocusSnapshot,
): PlatformSupportInboxAttentionItem[] {
  const items: PlatformSupportInboxAttentionItem[] = [];

  if (focus.overdueSla > 0) {
    items.push({
      id: "overdue-sla",
      title: `${focus.overdueSla} ticket${focus.overdueSla === 1 ? "" : "s"} past SLA`,
      detail: "Respond or reassign before customer trust erodes across tenants.",
      href: "/platform/support/queue",
      priority: 1,
      tone: "urgent",
    });
  }

  if (focus.criticalIssues > 0) {
    items.push({
      id: "critical-issues",
      title: `${focus.criticalIssues} critical or security ticket${focus.criticalIssues === 1 ? "" : "s"}`,
      detail: "Triage production-impacting and security issues before pulling new volume.",
      href: "/platform/support/queue",
      priority: 2,
      tone: "urgent",
    });
  }

  if (focus.escalatedTickets > 0) {
    items.push({
      id: "escalated-tickets",
      title: `${focus.escalatedTickets} escalated ticket${focus.escalatedTickets === 1 ? "" : "s"}`,
      detail: "Customer escalations may indicate cross-tenant integration or order failures.",
      href: "/platform/support/escalations",
      priority: 3,
      tone: "urgent",
    });
  }

  if (focus.integrationIssues > 0) {
    items.push({
      id: "integration-issues",
      title: `${focus.integrationIssues} integration ticket${focus.integrationIssues === 1 ? "" : "s"} open`,
      detail: "Pair with platform integration health — channel issues block pilot orders.",
      href: "/platform/support/queue",
      priority: 4,
      tone: "urgent",
    });
  }

  if (focus.unassignedUrgent > 0) {
    items.push({
      id: "unassigned-urgent",
      title: `${focus.unassignedUrgent} unassigned urgent ticket${focus.unassignedUrgent === 1 ? "" : "s"}`,
      detail: "Assign an owner so pilots are not waiting on platform support.",
      href: "/platform/support/queue",
      priority: 5,
      tone: "urgent",
    });
  }

  if (focus.assignedToMe > 0 && items.length < 4) {
    items.push({
      id: "assigned-to-me",
      title: `${focus.assignedToMe} ticket${focus.assignedToMe === 1 ? "" : "s"} assigned to you`,
      detail: "Clear your queue before pulling new cross-tenant inbox volume.",
      href: "/platform/support/queue",
      priority: 6,
      tone: "normal",
    });
  }

  if (focus.awaitingResponse > 0 && items.length < 4) {
    items.push({
      id: "awaiting-response",
      title: `${focus.awaitingResponse} awaiting platform response`,
      detail: "Tickets need a reply or status update across workspaces.",
      href: "/platform/support/queue",
      priority: 7,
      tone: focus.overdueSla > 0 ? "urgent" : "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Row-level next action for platform support ticket tables. */
export function resolvePlatformSupportTicketRowNextAction(
  ticket: PlatformSupportInboxTicketFocus,
  now = Date.now(),
): PlatformSupportTicketRowNextAction | null {
  if (TERMINAL_STATUSES.has(ticket.status)) return null;

  const href = `/platform/support/${ticket.id}`;

  if (ticket.slaDueAt && new Date(ticket.slaDueAt).getTime() < now) {
    return { label: "Respond — SLA overdue", href, tone: "urgent" };
  }

  if (ticket.status === "ESCALATED") {
    return { label: "Triage escalation", href, tone: "urgent" };
  }

  if (ticket.priority === "CRITICAL" || ticket.category === "SECURITY") {
    return { label: "Triage critical ticket", href, tone: "urgent" };
  }

  if (ticket.category === "INTEGRATION") {
    return { label: "Review integration issue", href, tone: "urgent" };
  }

  if (
    !ticket.assignedToId &&
    (ticket.status === "NEW" ||
      ticket.status === "OPEN" ||
      ticket.status === "TRIAGED" ||
      ticket.status === "ESCALATED")
  ) {
    return { label: "Assign owner", href, tone: "normal" };
  }

  if (
    ticket.status === "WAITING_ON_SUPPORT" ||
    ticket.status === "IN_PROGRESS" ||
    ticket.status === "ESCALATED"
  ) {
    return { label: "Send update", href, tone: "normal" };
  }

  return null;
}
