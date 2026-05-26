import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { OPEN_SUPPORT_TICKET_STATUSES } from "@/lib/support/support-status";
import { visibleTicketsWhere } from "@/services/support/ticket-service";

export async function supportTicketsByCategory(params: {
  userId: string;
  email: string | null | undefined;
  canTriage: boolean;
  workspaceIds: string[];
}) {
  const base = visibleTicketsWhere({
    userId: params.userId,
    email: params.email,
    canTriage: params.canTriage,
    workspaceIds: params.workspaceIds,
  });
  return prisma.supportTicket.groupBy({
    by: ["category"],
    where: base,
    _count: { _all: true },
  });
}

export async function supportTicketsByPriority(params: {
  userId: string;
  email: string | null | undefined;
  canTriage: boolean;
  workspaceIds: string[];
}) {
  const base = visibleTicketsWhere({
    userId: params.userId,
    email: params.email,
    canTriage: params.canTriage,
    workspaceIds: params.workspaceIds,
  });
  return prisma.supportTicket.groupBy({
    by: ["priority"],
    where: base,
    _count: { _all: true },
  });
}

export async function supportOpenByModule(params: {
  userId: string;
  email: string | null | undefined;
  canTriage: boolean;
  workspaceIds: string[];
}) {
  const base = visibleTicketsWhere({
    userId: params.userId,
    email: params.email,
    canTriage: params.canTriage,
    workspaceIds: params.workspaceIds,
  });
  const open: Prisma.SupportTicketWhereInput = {
    AND: [
      base,
      { status: { in: [...OPEN_SUPPORT_TICKET_STATUSES] } },
      { moduleKey: { not: null } },
    ],
  };
  return prisma.supportTicket.groupBy({
    by: ["moduleKey"],
    where: open,
    _count: { _all: true },
  });
}

export async function supportVolumeByWorkspace(params: {
  userId: string;
  email: string | null | undefined;
  canTriage: boolean;
  workspaceIds: string[];
}) {
  if (!params.canTriage) return [];
  return prisma.supportTicket.groupBy({
    by: ["workspaceId"],
    where: { workspaceId: { not: null } },
    _count: { _all: true },
  });
}
