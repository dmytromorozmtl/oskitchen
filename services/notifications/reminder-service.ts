import { prisma } from "@/lib/prisma";
import { notificationRuleListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { REMINDER_RULE_DEFAULTS } from "@/lib/notifications/reminder-rules";

export type RuleSnapshot = {
  id: string;
  ruleKey: string;
  enabled: boolean;
  category: string;
  channel: string;
  audience: string;
  templateKey: string;
  triggerKey: string;
  offsetMinutes: number;
  dedupeWindowMinutes: number;
  description: string | null;
};

const TRIGGER_ENUM_FALLBACK = {
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_READY: "ORDER_CONFIRMED",
  PICKUP_REMINDER: "PICKUP_REMINDER",
  DELIVERY_REMINDER: "DELIVERY_REMINDER",
  PREORDER_DEADLINE: "PREORDER_DEADLINE",
  WEEKLY_MENU_LIVE: "PREORDER_DEADLINE",
  CATERING_QUOTE_FOLLOWUP: "QUOTE_FOLLOWUP",
  MEAL_PLAN_CYCLE_REMINDER: "SUBSCRIPTION_RENEWAL",
  ROUTE_DRIVER_REMINDER: "PRODUCTION_DUE",
  PACKING_DEADLINE_REMINDER: "PRODUCTION_DUE",
  PRODUCTION_DUE: "PRODUCTION_DUE",
  LOW_STOCK: "LOW_STOCK",
  WEBHOOK_FAILED: "WEBHOOK_FAILED",
} as const;

const TYPE_ENUM_FALLBACK = {
  ORDER_CONFIRMED: "ORDER_CONFIRMATION",
  ORDER_READY: "ORDER_READY",
  PICKUP_REMINDER: "PICKUP_REMINDER",
  DELIVERY_REMINDER: "DELIVERY_REMINDER",
  PREORDER_DEADLINE: "PREORDER_REMINDER",
  WEEKLY_MENU_LIVE: "CRON_REMINDER",
  CATERING_QUOTE_FOLLOWUP: "CRON_REMINDER",
  MEAL_PLAN_CYCLE_REMINDER: "CRON_REMINDER",
  ROUTE_DRIVER_REMINDER: "CRON_REMINDER",
  PACKING_DEADLINE_REMINDER: "CRON_REMINDER",
  PRODUCTION_DUE: "CRON_REMINDER",
  LOW_STOCK: "CRON_REMINDER",
  WEBHOOK_FAILED: "CRON_REMINDER",
} as const;

/** Install the default rule pack for a workspace. Idempotent — skips existing keys. */
export async function installDefaultRules(userId: string): Promise<{ created: number }> {
  const ruleScope = await notificationRuleListWhereForOwner(userId);
  let created = 0;
  for (const def of REMINDER_RULE_DEFAULTS) {
    const existing = await prisma.notificationRule.findFirst({
      where: { AND: [ruleScope, { ruleKey: def.key }] },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.notificationRule.create({
      data: {
        userId,
        type: TYPE_ENUM_FALLBACK[def.triggerType],
        trigger: TRIGGER_ENUM_FALLBACK[def.triggerType],
        channel: def.channel === "EMAIL" ? "EMAIL" : def.channel === "IN_APP" ? "IN_APP" : "SMS",
        template: null,
        timingMinutes: def.offsetMinutes,
        ruleKey: def.key,
        category: def.category,
        audience: def.audience,
        templateKey: def.templateKey,
        triggerKey: def.triggerType,
        dedupeWindowMinutes: def.dedupeWindowMinutes,
        enabled: true,
      },
    });
    created++;
  }
  return { created };
}

export async function listRulesForWorkspace(userId: string): Promise<RuleSnapshot[]> {
  const ruleScope = await notificationRuleListWhereForOwner(userId);
  const rows = await prisma.notificationRule.findMany({
    where: ruleScope,
    orderBy: [{ category: "asc" }, { ruleKey: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => {
    const def = r.ruleKey ? REMINDER_RULE_DEFAULTS.find((d) => d.key === r.ruleKey) : undefined;
    return {
      id: r.id,
      ruleKey: r.ruleKey ?? `legacy-${r.id.slice(0, 8)}`,
      enabled: r.enabled,
      category: r.category ?? def?.category ?? "GUEST_TRANSACTIONAL",
      channel: r.channel,
      audience: r.audience ?? def?.audience ?? "CUSTOMER",
      templateKey: r.templateKey ?? def?.templateKey ?? "order_confirmation",
      triggerKey: r.triggerKey ?? def?.triggerType ?? "ORDER_CONFIRMED",
      offsetMinutes: r.timingMinutes,
      dedupeWindowMinutes: r.dedupeWindowMinutes ?? def?.dedupeWindowMinutes ?? 24 * 60,
      description: def?.description ?? null,
    };
  });
}

export async function updateRule(
  userId: string,
  id: string,
  patch: Partial<Pick<RuleSnapshot, "enabled" | "offsetMinutes" | "dedupeWindowMinutes" | "templateKey" | "audience">>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ruleScope = await notificationRuleListWhereForOwner(userId);
  const existing = await prisma.notificationRule.findFirst({ where: { AND: [ruleScope, { id }] } });
  if (!existing) return { ok: false, error: "Rule not found." };
  await prisma.notificationRule.update({
    where: { id },
    data: {
      enabled: patch.enabled ?? undefined,
      timingMinutes: patch.offsetMinutes ?? undefined,
      dedupeWindowMinutes: patch.dedupeWindowMinutes ?? undefined,
      templateKey: patch.templateKey ?? undefined,
      audience: patch.audience ?? undefined,
    },
  });
  return { ok: true };
}
