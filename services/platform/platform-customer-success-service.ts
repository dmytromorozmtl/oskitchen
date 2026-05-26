import { SupportTicketStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const TERMINAL: SupportTicketStatus[] = ["RESOLVED", "CLOSED", "DUPLICATE", "CANCELLED"];

/** Lightweight health heuristics — extend with snapshots table when introduced. */
export async function platformCustomerSuccessRollup() {
  const [workspaces, openTickets] = await Promise.all([
    prisma.workspace.count({ where: { active: true } }).catch(() => 0),
    prisma.supportTicket
      .count({
        where: { status: { notIn: TERMINAL } },
      })
      .catch(() => 0),
  ]);
  return { activeWorkspaces: workspaces, openTickets };
}
