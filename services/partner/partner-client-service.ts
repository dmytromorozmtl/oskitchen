import { prisma } from "@/lib/prisma";

export async function listPartnerClientsForAccounts(accountIds: string[], take = 200) {
  if (accountIds.length === 0) return [];
  return prisma.partnerClient.findMany({
    where: { partnerAccountId: { in: accountIds } },
    orderBy: [{ updatedAt: "desc" }],
    take,
    include: {
      workspace: { select: { id: true, name: true, active: true } },
      clientUser: { select: { id: true, email: true, fullName: true } },
      assignedManager: { select: { id: true, fullName: true, email: true } },
    },
  });
}
