import { prisma } from "@/lib/prisma";

const workspaceDetailInclude = {
  owner: {
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      subscription: {
        select: {
          plan: true,
          status: true,
          billingMode: true,
          stripeSubscriptionId: true,
        },
      },
      trialState: {
        select: {
          status: true,
          trialEndsAt: true,
        },
      },
    },
  },
  organization: { select: { id: true, name: true, slug: true } },
  _count: { select: { members: true, supportTickets: true } },
} as const;

export async function platformGetWorkspace(workspaceId: string) {
  return prisma.workspace.findFirst({
    where: { id: workspaceId },
    include: workspaceDetailInclude,
  });
}

export async function listRecentWorkspacesForPlatform(limit = 30) {
  return prisma.workspace.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      active: true,
      ownerUserId: true,
      updatedAt: true,
    },
  });
}
