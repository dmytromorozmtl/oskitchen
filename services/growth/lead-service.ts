import type { GrowthLifecycleStage } from "@/lib/growth/growth-events";
import { resolveLeadLane } from "@/lib/growth/growth-funnel";
import { prisma } from "@/lib/prisma";

export async function listRecentLeads(take = 500) {
  return prisma.betaLead.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true,
      fullName: true,
      email: true,
      businessName: true,
      status: true,
      lifecycleStage: true,
      score: true,
      source: true,
      utmSource: true,
      utmCampaign: true,
      createdAt: true,
    },
  });
}

export async function countLeadsByStatus() {
  return prisma.betaLead.groupBy({
    by: ["status"],
    _count: { status: true },
  });
}

export function groupLeadsByLifecycleLane(
  leads: Awaited<ReturnType<typeof listRecentLeads>>,
): Record<GrowthLifecycleStage, typeof leads> {
  const stages: GrowthLifecycleStage[] = [
    "VISITOR",
    "LEAD",
    "MQL",
    "SQL",
    "DEMO_SCHEDULED",
    "TRIAL_STARTED",
    "ACTIVATED",
    "PAYING",
    "EXPANSION",
    "AT_RISK",
    "CHURNED",
  ];
  const empty = {} as Record<GrowthLifecycleStage, typeof leads>;
  for (const s of stages) empty[s] = [];
  for (const lead of leads) {
    const lane = resolveLeadLane({ lifecycleStage: lead.lifecycleStage, status: lead.status });
    empty[lane].push(lead);
  }
  return empty;
}
