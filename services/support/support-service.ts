import { SupportTicketStatus } from "@prisma/client";
import { endOfWeek, startOfWeek } from "date-fns";

import { prisma } from "@/lib/prisma";
import { OPEN_SUPPORT_TICKET_STATUSES } from "@/lib/support/support-status";
import { canUseFullSupportInbox, userWorkspaceIds } from "@/lib/support/support-permissions";
import { visibleTicketsWhere } from "@/services/support/ticket-service";

export type SupportCenterSnapshot = {
  canTriage: boolean;
  kpis: {
    openTickets: number;
    awaitingResponse: number;
    assignedToMe: number;
    overdueSla: number;
    criticalIssues: number;
    integrationIssues: number;
    billingTickets: number;
    resolvedThisWeek: number;
  };
};

export async function getSupportCenterSnapshot(params: {
  userId: string;
  email: string | null | undefined;
  profileRole: import("@prisma/client").UserRole;
}): Promise<SupportCenterSnapshot> {
  const canTriage = await canUseFullSupportInbox(params.userId, params.email, params.profileRole);
  const workspaceIds = await userWorkspaceIds(params.userId);
  const baseWhere = visibleTicketsWhere({
    userId: params.userId,
    email: params.email,
    canTriage,
    workspaceIds,
  });

  /** Tickets that still need support attention (excludes waiting-on-customer). */
  const awaitingResponseStatuses = [
    SupportTicketStatus.NEW,
    SupportTicketStatus.TRIAGED,
    SupportTicketStatus.WAITING_ON_SUPPORT,
    SupportTicketStatus.IN_PROGRESS,
    SupportTicketStatus.ESCALATED,
    SupportTicketStatus.OPEN,
    SupportTicketStatus.WAITING,
  ] as const;

  const openWhere = {
    AND: [
      baseWhere,
      { status: { in: [...OPEN_SUPPORT_TICKET_STATUSES] } },
    ],
  };

  const [
    openTickets,
    awaitingResponse,
    assignedToMe,
    overdueSla,
    criticalIssues,
    integrationIssues,
    billingTickets,
    resolvedThisWeek,
  ] = await Promise.all([
    prisma.supportTicket.count({ where: openWhere }),
    prisma.supportTicket.count({
      where: {
        AND: [
          baseWhere,
          { status: { in: [...awaitingResponseStatuses] } },
        ],
      },
    }),
    prisma.supportTicket.count({
      where: { AND: [openWhere, { assignedToId: params.userId }] },
    }),
    prisma.supportTicket.count({
      where: {
        AND: [
          openWhere,
          { slaDueAt: { lt: new Date() } },
        ],
      },
    }),
    prisma.supportTicket.count({
      where: {
        AND: [
          openWhere,
          {
            OR: [
              { priority: "CRITICAL" },
              { category: "SECURITY" },
            ],
          },
        ],
      },
    }),
    prisma.supportTicket.count({
      where: { AND: [openWhere, { category: "INTEGRATION" }] },
    }),
    prisma.supportTicket.count({
      where: { AND: [openWhere, { category: "BILLING" }] },
    }),
    (async () => {
      const now = new Date();
      const ws = startOfWeek(now, { weekStartsOn: 1 });
      const we = endOfWeek(now, { weekStartsOn: 1 });
      return prisma.supportTicket.count({
        where: {
          AND: [
            baseWhere,
            {
              status: {
                in: [SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED],
              },
            },
            { updatedAt: { gte: ws, lte: we } },
          ],
        },
      });
    })(),
  ]);

  return {
    canTriage,
    kpis: {
      openTickets,
      awaitingResponse,
      assignedToMe,
      overdueSla,
      criticalIssues,
      integrationIssues,
      billingTickets,
      resolvedThisWeek,
    },
  };
}
