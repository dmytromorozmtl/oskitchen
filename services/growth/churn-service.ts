import { prisma } from "@/lib/prisma";
import { usageEventListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

import { scoreChurnHeuristic } from "@/lib/growth/growth-scoring";

export type AtRiskRow = {
  userId: string;
  email: string;
  fullName: string;
  churnScore: number;
  reasons: string[];
};

export async function sampleAtRiskAccounts(take = 12): Promise<AtRiskRow[]> {
  const users = await prisma.userProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      subscription: true,
      activationState: true,
      integrationConnections: { select: { status: true } },
    },
  });

  const out: AtRiskRow[] = [];
  for (const u of users) {
    const usageScope = await usageEventListWhereForOwner(u.id);
    const last = await prisma.usageEvent.findFirst({
      where: usageScope,
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    const daysSince = last ? Math.floor((Date.now() - last.createdAt.getTime()) / 86400000) : null;
    const integrationErrors = u.integrationConnections.filter((c) => c.status === "ERROR").length;
    const subLabel = u.subscription?.statusDetail ?? u.subscription?.status ?? "none";
    const { score, reasons } = scoreChurnHeuristic({
      daysSinceLastUsageEvent: daysSince,
      onboardingCompleted: u.activationState?.onboardingCompleted ?? false,
      integrationErrors,
      subscriptionStatusLabel: subLabel,
    });
    if (score >= 45) {
      out.push({ userId: u.id, email: u.email, fullName: u.fullName, churnScore: score, reasons });
    }
    if (out.length >= take) break;
  }
  return out.sort((a, b) => b.churnScore - a.churnScore).slice(0, take);
}
