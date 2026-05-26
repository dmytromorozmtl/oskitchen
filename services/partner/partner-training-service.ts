import { prisma } from "@/lib/prisma";
import { trainingEventListWhereForOwner } from "@/lib/scope/workspace-training-scope";

export async function countTrainingEventsForUser(userId: string, sinceDays = 90) {
  const since = new Date(Date.now() - sinceDays * 86400000);
  const scope = await trainingEventListWhereForOwner(userId);
  return prisma.trainingEvent.count({
    where: { AND: [scope, { createdAt: { gte: since } }] },
  });
}

export async function partnerTrainingCompletionProxy(params: {
  clientUserId: string;
}): Promise<number> {
  const ks = await prisma.kitchenSettings.findFirst({
    where: { userId: params.clientUserId },
    select: { businessName: true, businessType: true, country: true },
  });
  const hasBasics = Boolean(ks?.businessName && ks?.businessType && ks?.country);
  let pct = hasBasics ? 55 : 20;
  const events = await countTrainingEventsForUser(params.clientUserId, 120);
  pct += Math.min(40, events * 3);
  return Math.min(100, pct);
}
