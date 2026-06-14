import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  menuRotationRuleListWhereForOwner,
  storefrontSettingsListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";

/** Calendar-based auto-publish: activate menus scheduled for today's DOW. */
export async function runMenuRotationForUser(userId: string): Promise<{ published: string[] }> {
  const dow = new Date().getDay();
  const ruleScope = await menuRotationRuleListWhereForOwner(userId);
  const rules = await prisma.menuRotationRule.findMany({
    where: { AND: [ruleScope, { active: true, dayOfWeek: dow }] },
    include: { menu: { select: { id: true, title: true, published: true } } },
  });

  const published: string[] = [];
  const hour = new Date().getHours();

  for (const rule of rules) {
    if (hour < rule.publishHour) continue;
    if (rule.lastRunAt && rule.lastRunAt.toDateString() === new Date().toDateString()) continue;

    await prisma.menu.update({
      where: { id: rule.menuId },
      data: { published: true, active: true },
    });

    const storefrontScope = await storefrontSettingsListWhereForOwner(userId);
    const sf = await prisma.storefrontSettings.findFirst({
      where: storefrontScope,
      select: { storeSlug: true },
    });
    if (sf?.storeSlug) {
      await prisma.storefrontSettings.updateMany({
        where: storefrontScope,
        data: { activeMenuId: rule.menuId },
      });
      revalidateStorefrontDashboardAndPublic(sf.storeSlug, "catalog", { ownerUserId: userId });
    }

    await prisma.menuRotationRule.update({
      where: { id: rule.id },
      data: { lastRunAt: new Date() },
    });

    published.push(rule.menu.title);
  }

  return { published };
}

export type MenuRotationCronSummary = {
  usersScanned: number;
  menusPublished: number;
  publishedByUser: { userId: string; menus: string[] }[];
  errors: { userId: string; error: string }[];
};

/** Run rotation for every owner with active rules (production cron). */
export async function runMenuRotationForAllUsers(): Promise<MenuRotationCronSummary> {
  const userIds = await prisma.menuRotationRule.findMany({
    where: { active: true },
    distinct: ["userId"],
    select: { userId: true },
    take: 500,
  });

  const summary: MenuRotationCronSummary = {
    usersScanned: userIds.length,
    menusPublished: 0,
    publishedByUser: [],
    errors: [],
  };

  for (const { userId } of userIds) {
    try {
      const { published } = await runMenuRotationForUser(userId);
      if (published.length) {
        summary.menusPublished += published.length;
        summary.publishedByUser.push({ userId, menus: published });
      }
    } catch (err) {
      summary.errors.push({
        userId,
        error: err instanceof Error ? err.message : "rotation_failed",
      });
    }
  }

  return summary;
}

export async function upsertMenuRotationRule(params: {
  userId: string;
  menuId: string;
  dayOfWeek: number;
  publishHour?: number;
  active?: boolean;
}) {
  const workspaceId = await resolveOwnerWorkspaceId(params.userId);
  return prisma.menuRotationRule.upsert({
    where: {
      userId_menuId_dayOfWeek: {
        userId: params.userId,
        menuId: params.menuId,
        dayOfWeek: params.dayOfWeek,
      },
    },
    create: {
      userId: params.userId,
      workspaceId,
      menuId: params.menuId,
      dayOfWeek: params.dayOfWeek,
      publishHour: params.publishHour ?? 6,
      active: params.active ?? true,
    },
    update: {
      publishHour: params.publishHour,
      active: params.active,
    },
  });
}
