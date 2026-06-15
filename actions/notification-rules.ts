"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { logSettingsPermissionDenied } from "@/services/settings/settings-permission-audit";
import { NotificationRuleChannel, NotificationRuleTrigger, NotificationType } from "@prisma/client";

async function requireNotificationRulesManageAccess(operation: string) {
  const access = await requireMutationPermission("workspace.settings");
  if (!access.ok) {
    await logSettingsPermissionDenied(access.actor, {
      requiredPermission: "workspace.settings",
      operation,
    });
    return { ok: false as const, error: access.error };
  }
  return { ok: true as const, actor: access.actor };
}

export async function toggleNotificationRuleAction(formData: FormData) {
  try {
    const manage = await requireNotificationRulesManageAccess("notification_rules.toggle");
    if (!manage.ok) return { error: manage.error };

    const { userId } = await requireTenantActor();
    const id = String(formData.get("id") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid rule." };
    const enabled = formData.get("enabled") === "true";
    await prisma.notificationRule.updateMany({
      where: { id, userId },
      data: { enabled },
    });
    revalidatePath("/dashboard/notifications/rules");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

const seedSchema = z.object({
  confirm: z.literal("seed"),
});

export async function seedNotificationRulesAction(formData: FormData) {
  try {
    const manage = await requireNotificationRulesManageAccess("notification_rules.seed");
    if (!manage.ok) return { error: manage.error };

    const { userId } = await requireTenantActor();
    const parsed = seedSchema.safeParse({ confirm: formData.get("confirm") });
    if (!parsed.success) return { error: "Invalid request." };

    const existing = await prisma.notificationRule.count({ where: { userId } });
    if (existing > 0) return { error: "Rules already exist — edit toggles instead." };

    const defaults: {
      type: NotificationType;
      trigger: NotificationRuleTrigger;
      channel: NotificationRuleChannel;
      template: string | null;
      timingMinutes: number;
    }[] = [
      {
        type: "PREORDER_REMINDER",
        trigger: "PREORDER_DEADLINE",
        channel: "EMAIL",
        template: "Friendly preorder cutoff reminder for {{business}}.",
        timingMinutes: 120,
      },
      {
        type: "ORDER_CONFIRMATION",
        trigger: "ORDER_CONFIRMED",
        channel: "EMAIL",
        template: "Thanks — we received your order.",
        timingMinutes: 0,
      },
      {
        type: "PICKUP_REMINDER",
        trigger: "PICKUP_REMINDER",
        channel: "EMAIL",
        template: "Pickup window reminder.",
        timingMinutes: 60,
      },
      {
        type: "DELIVERY_REMINDER",
        trigger: "DELIVERY_REMINDER",
        channel: "EMAIL",
        template: "Driver en route / delivery window heads-up.",
        timingMinutes: 45,
      },
      {
        type: "CRON_REMINDER",
        trigger: "LOW_STOCK",
        channel: "IN_APP",
        template: "Low stock threshold crossed for key SKU.",
        timingMinutes: 0,
      },
    ];

    await prisma.notificationRule.createMany({
      data: defaults.map((d) => ({
        userId,
        type: d.type,
        trigger: d.trigger,
        channel: d.channel,
        template: d.template,
        timingMinutes: d.timingMinutes,
        enabled: true,
      })),
    });

    revalidatePath("/dashboard/notifications/rules");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function toggleNotificationRuleFormAction(formData: FormData): Promise<void> {
  void (await toggleNotificationRuleAction(formData));
}

export async function seedNotificationRulesFormAction(formData: FormData): Promise<void> {
  void (await seedNotificationRulesAction(formData));
}
