import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function platformGlobalSearch(query: string, take = 15) {
  const q = query.trim();
  if (q.length < 2) {
    return { users: [], workspaces: [], organizations: [], tickets: [] };
  }

  const [users, workspaces, organizations, tickets] = await Promise.all([
    prisma.userProfile.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { fullName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, email: true, fullName: true },
      take,
    }),
    prisma.workspace.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { brandName: { contains: q, mode: "insensitive" } },
          { owner: { email: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: { id: true, name: true, active: true, owner: { select: { email: true } } },
      take,
    }),
    prisma.organization.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, slug: true },
      take,
    }),
    searchTickets(q, take),
  ]);

  return { users, workspaces, organizations, tickets };
}

async function searchTickets(q: string, take: number) {
  const where: Prisma.SupportTicketWhereInput = {
    OR: [
      { subject: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { message: { contains: q, mode: "insensitive" } },
    ],
  };
  return prisma.supportTicket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take,
    select: { id: true, subject: true, status: true, email: true, workspaceId: true },
  });
}
