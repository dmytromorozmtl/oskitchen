import { prisma } from "@/lib/prisma";
import { notificationRuleListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function countNotificationRules(userId: string) {
  const scope = await notificationRuleListWhereForOwner(userId);
  return prisma.notificationRule.count({ where: scope });
}

export async function listNotificationRulesSummary(userId: string) {
  const scope = await notificationRuleListWhereForOwner(userId);
  return prisma.notificationRule.findMany({
    where: scope,
    orderBy: { updatedAt: "desc" },
    take: 40,
    select: { id: true, ruleKey: true, type: true, enabled: true, updatedAt: true },
  });
}
