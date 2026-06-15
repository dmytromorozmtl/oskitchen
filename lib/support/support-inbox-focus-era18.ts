import { isOpenSupportStatus } from "@/lib/support/support-status";
import type { SupportCenterSnapshot } from "@/services/support/support-service";

export type SupportInboxTicketFocus = {
  id: string;
  status: string;
  priority: string;
  category: string;
  assignedToId: string | null;
  slaDueAt: string | null;
};

export type SupportInboxFocusSnapshot = {
  canTriage: boolean;
  overdueSla: number;
  criticalIssues: number;
  integrationIssues: number;
  awaitingResponse: number;
  assignedToMe: number;
  unassignedUrgent: number;
};

export type SupportInboxAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export type SupportTicketRowNextAction = {
  label: string;
  href: string;
  tone: "urgent" | "normal";
};

const TERMINAL_STATUSES = new Set(["RESOLVED", "CLOSED", "CANCELLED", "DUPLICATE"]);

function isOpenTicket(status: string): boolean {
  return isOpenSupportStatus(status as Parameters<typeof isOpenSupportStatus>[0]);
}

export function buildSupportInboxFocusSnapshot(
  snapshot: SupportCenterSnapshot,
  tickets: readonly SupportInboxTicketFocus[],
): SupportInboxFocusSnapshot {
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
    canTriage: snapshot.canTriage,
    overdueSla: snapshot.kpis.overdueSla,
    criticalIssues: snapshot.kpis.criticalIssues,
    integrationIssues: snapshot.kpis.integrationIssues,
    awaitingResponse: snapshot.kpis.awaitingResponse,
    assignedToMe: snapshot.kpis.assignedToMe,
    unassignedUrgent,
  };
}

export function summarizeSupportInboxFocus(
  focus: SupportInboxFocusSnapshot,
): { totalSignals: number; hasUrgent: boolean } {
  const totalSignals =
    focus.overdueSla +
    focus.criticalIssues +
    focus.integrationIssues +
    focus.awaitingResponse +
    focus.unassignedUrgent;

  const hasUrgent =
    focus.overdueSla > 0 ||
    focus.criticalIssues > 0 ||
    focus.integrationIssues > 0 ||
    focus.unassignedUrgent > 0;

  return { totalSignals, hasUrgent };
}

/** Prioritized support queue categories — SLA and pilot blockers first. */
export function pickSupportInboxAttentionItems(
  focus: SupportInboxFocusSnapshot,
): SupportInboxAttentionItem[] {
  const items: SupportInboxAttentionItem[] = [];

  if (focus.overdueSla > 0) {
    items.push({
      id: "overdue-sla",
      title: `${focus.overdueSla} ticket${focus.overdueSla === 1 ? "" : "s"} past SLA`,
      detail: focus.canTriage
        ? "Respond or reassign before customer trust erodes."
        : "Your open ticket needs a response — open it below.",
      href: focus.canTriage ? "/dashboard/support?tab=inbox" : "/dashboard/support?tab=my",
      priority: 1,
      tone: "urgent",
    });
  }

  if (focus.criticalIssues > 0) {
    items.push({
      id: "critical-issues",
      title: `${focus.criticalIssues} critical or security ticket${focus.criticalIssues === 1 ? "" : "s"}`,
      detail: "Triage production-impacting and security issues first.",
      href: "/dashboard/support?tab=critical",
      priority: 2,
      tone: "urgent",
    });
  }

  if (focus.integrationIssues > 0) {
    items.push({
      id: "integration-issues",
      title: `${focus.integrationIssues} integration ticket${focus.integrationIssues === 1 ? "" : "s"} open`,
      detail: "Pair with integration health — channel issues block pilot orders.",
      href: "/dashboard/support?tab=integrations",
      priority: 3,
      tone: "urgent",
    });
  }

  if (focus.canTriage && focus.unassignedUrgent > 0) {
    items.push({
      id: "unassigned-urgent",
      title: `${focus.unassignedUrgent} unassigned urgent ticket${focus.unassignedUrgent === 1 ? "" : "s"}`,
      detail: "Assign an owner so pilots are not waiting on support.",
      href: "/dashboard/support?tab=inbox",
      priority: 4,
      tone: "urgent",
    });
  }

  if (focus.canTriage && focus.assignedToMe > 0 && items.length < 4) {
    items.push({
      id: "assigned-to-me",
      title: `${focus.assignedToMe} ticket${focus.assignedToMe === 1 ? "" : "s"} assigned to you`,
      detail: "Clear your queue before pulling new inbox volume.",
      href: "/dashboard/support?tab=assigned",
      priority: 5,
      tone: "normal",
    });
  }

  if (focus.awaitingResponse > 0 && items.length < 4) {
    items.push({
      id: "awaiting-response",
      title: `${focus.awaitingResponse} awaiting support response`,
      detail: "Tickets need a reply or status update.",
      href: focus.canTriage ? "/dashboard/support?tab=inbox" : "/dashboard/support?tab=my",
      priority: 6,
      tone: focus.overdueSla > 0 ? "urgent" : "normal",
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/** Row-level next action for support ticket tables. */
export function resolveSupportTicketRowNextAction(
  ticket: SupportInboxTicketFocus,
  now = Date.now(),
): SupportTicketRowNextAction | null {
  if (TERMINAL_STATUSES.has(ticket.status)) return null;

  const href = `/dashboard/support/${ticket.id}`;

  if (ticket.slaDueAt && new Date(ticket.slaDueAt).getTime() < now) {
    return { label: "Respond — SLA overdue", href, tone: "urgent" };
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
