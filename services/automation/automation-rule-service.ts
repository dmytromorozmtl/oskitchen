import { prisma } from "@/lib/prisma";
import { automationRuleListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function countAutomationRulesForUser(userId: string): Promise<number> {
  const scope = await automationRuleListWhereForOwner(userId);
  return prisma.automationRule.count({ where: scope });
}

export async function listAutomationRulesSummary(userId: string) {
  const scope = await automationRuleListWhereForOwner(userId);
  return prisma.automationRule.findMany({
    where: scope,
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, name: true, enabled: true, updatedAt: true },
  });
}
