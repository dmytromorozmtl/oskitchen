import { subDays } from "date-fns";

import { prisma } from "@/lib/prisma";
import {
  integrationConnectionListWhereForOwner,
  orderListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";

/** Lightweight health proxy (0–100) when `health_score` not yet curated. */
export async function computePartnerClientHealthScore(params: {
  clientUserId: string;
  workspaceId: string | null;
}): Promise<number> {
  let score = 52;
  const ks = await prisma.kitchenSettings.findFirst({
    where: { userId: params.clientUserId },
    select: { businessName: true, businessType: true, country: true },
  });
  if (ks?.businessName && ks?.businessType && ks?.country) score += 22;

  const wsId =
    params.workspaceId ??
    (
      await prisma.workspace.findFirst({
        where: { ownerUserId: params.clientUserId, active: true },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      })
    )?.id;
  if (wsId) {
    const integrationScope = await integrationConnectionListWhereForOwner(params.clientUserId);
    const n = await prisma.integrationConnection.count({ where: integrationScope });
    score += Math.min(18, n * 4);
    const orders = await prisma.order.count({
      where: await orderListWhereForOwnerAnd(params.clientUserId, {
        createdAt: { gte: subDays(new Date(), 30) },
      }),
    });
    if (orders > 0) score += 8;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
