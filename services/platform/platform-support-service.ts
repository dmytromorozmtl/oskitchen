import type { Prisma } from "@prisma/client";
import { SupportTicketStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { PLATFORM_OPEN_TICKET_STATUSES } from "@/services/platform/platform-service";

export type PlatformSupportInboxSnapshot = {
  kpis: {
    openTickets: number;
    awaitingResponse: number;
    assignedToMe: number;
    overdueSla: number;
    criticalIssues: number;
    integrationIssues: number;
    escalatedTickets: number;
  };
};

const AWAITING_RESPONSE_STATUSES = [
  SupportTicketStatus.NEW,
  SupportTicketStatus.TRIAGED,
  SupportTicketStatus.WAITING_ON_SUPPORT,
  SupportTicketStatus.IN_PROGRESS,
  SupportTicketStatus.ESCALATED,
  SupportTicketStatus.OPEN,
  SupportTicketStatus.WAITING,
] as const;

/** Cross-tenant support inbox KPIs for platform operators. */
export async function getPlatformSupportInboxSnapshot(
  actorUserId: string,
): Promise<PlatformSupportInboxSnapshot> {
  const openWhere = { status: { in: PLATFORM_OPEN_TICKET_STATUSES } };

  const [
    openTickets,
    awaitingResponse,
    assignedToMe,
    overdueSla,
    criticalIssues,
    integrationIssues,
    escalatedTickets,
  ] = await Promise.all([
    prisma.supportTicket.count({ where: openWhere }),
    prisma.supportTicket.count({
      where: { status: { in: [...AWAITING_RESPONSE_STATUSES] } },
    }),
    prisma.supportTicket.count({
      where: { AND: [openWhere, { assignedToId: actorUserId }] },
    }),
    prisma.supportTicket.count({
      where: {
        AND: [openWhere, { slaDueAt: { lt: new Date() } }],
      },
    }),
    prisma.supportTicket.count({
      where: {
        AND: [
          openWhere,
          {
            OR: [{ priority: "CRITICAL" }, { category: "SECURITY" }],
          },
        ],
      },
    }),
    prisma.supportTicket.count({
      where: { AND: [openWhere, { category: "INTEGRATION" }] },
    }),
    prisma.supportTicket.count({
      where: { AND: [openWhere, { status: SupportTicketStatus.ESCALATED }] },
    }),
  ]);

  return {
    kpis: {
      openTickets,
      awaitingResponse,
      assignedToMe,
      overdueSla,
      criticalIssues,
      integrationIssues,
      escalatedTickets,
    },
  };
}

const ticketListInclude = {
  workspace: { select: { id: true, name: true } },
  userProfile: { select: { id: true, email: true } },
} satisfies Prisma.SupportTicketInclude;

export type PlatformSupportTicketListRow = Prisma.SupportTicketGetPayload<{
  include: typeof ticketListInclude;
}>;

export async function listPlatformSupportTickets(
  filters: Prisma.SupportTicketWhereInput,
  limit = 100,
): Promise<PlatformSupportTicketListRow[]> {
  return prisma.supportTicket.findMany({
    where: filters,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: ticketListInclude,
  });
}

const ticketAdminInclude = {
  workspace: { select: { id: true, name: true } },
  userProfile: { select: { id: true, email: true } },
  assignedTo: { select: { id: true, email: true } },
  comments: {
    orderBy: { createdAt: "asc" },
    include: {
      authorUser: { select: { id: true, email: true } },
    },
  },
  events: {
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      performedBy: { select: { id: true, email: true } },
    },
  },
} satisfies Prisma.SupportTicketInclude;

export type PlatformSupportTicketAdmin = Prisma.SupportTicketGetPayload<{
  include: typeof ticketAdminInclude;
}>;

export async function getPlatformTicketForAdmin(ticketId: string): Promise<PlatformSupportTicketAdmin | null> {
  return prisma.supportTicket.findFirst({
    where: { id: ticketId },
    include: ticketAdminInclude,
  });
}

/** Cross-tenant support inbox slice for platform operators (open-like statuses). */
export async function listPlatformSupportInboxPreview(limit = 40) {
  return prisma.supportTicket.findMany({
    where: { status: { in: PLATFORM_OPEN_TICKET_STATUSES } },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      category: true,
      workspaceId: true,
      email: true,
      createdAt: true,
    },
  });
}
