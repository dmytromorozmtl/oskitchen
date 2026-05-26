"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserProfile } from "@/lib/auth";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

import { safeError } from "@/lib/security";
import { canUseNotifications, type NotificationActorScope } from "@/lib/notifications/notification-permissions";
import { sendNotification, retryNotification, cancelQueuedNotification } from "@/services/notifications/notification-service";
import { installDefaultRules, updateRule } from "@/services/notifications/reminder-service";
import { getSystemTemplate } from "@/lib/notifications/template-registry";

async function actor(): Promise<NotificationActorScope> {
  const { userId } = await requireTenantActor();
  const profile = await requireUserProfile();
  return { userId, email: profile.email ?? null, role: profile.role ?? null };
}

const sendTestSchema = z.object({
  templateKey: z.string().min(1).max(80),
  recipient: z.string().email().max(255),
});

export async function sendTestEmailAction(formData: FormData) {
  try {
    const a = await actor();
    if (!canUseNotifications(a, "send_test_email")) return { ok: false as const, error: "Not allowed." };
    const parsed = sendTestSchema.safeParse({
      templateKey: formData.get("templateKey"),
      recipient: formData.get("recipient"),
    });
    if (!parsed.success) return { ok: false as const, error: "Invalid input." };
    const tpl = getSystemTemplate(parsed.data.templateKey);
    if (!tpl) return { ok: false as const, error: "Template not found." };

    const variables: Record<string, string> = {};
    for (const v of tpl.variables) variables[v.key] = v.example;

    const res = await sendNotification({
      userId: a.userId,
      templateKey: parsed.data.templateKey,
      type: "CRON_REMINDER",
      category: tpl.category,
      channel: "EMAIL",
      recipient: parsed.data.recipient,
      variables,
      triggerType: "TEST_EMAIL",
      sourceType: "TEST_EMAIL",
      sourceId: `${Date.now()}`,
      dedupeKey: `test|${parsed.data.templateKey}|${parsed.data.recipient}|${Date.now()}`,
      metadata: { test: true, requestedBy: a.userId },
    });

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard/notifications/log");
    return res.ok
      ? { ok: true as const, status: res.status, providerMessageId: res.providerMessageId ?? null }
      : { ok: false as const, status: res.status, error: res.reason };
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}

export async function retryNotificationAction(formData: FormData) {
  try {
    const a = await actor();
    if (!canUseNotifications(a, "retry_failed")) return { ok: false as const, error: "Not allowed." };
    const logId = String(formData.get("logId") ?? "");
    if (!logId) return { ok: false as const, error: "Missing log id." };
    const res = await retryNotification(logId, a.userId);
    revalidatePath("/dashboard/notifications/retry");
    revalidatePath("/dashboard/notifications/log");
    return res.ok ? { ok: true as const, status: res.status } : { ok: false as const, error: res.reason };
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}

export async function cancelNotificationAction(formData: FormData) {
  try {
    const a = await actor();
    if (!canUseNotifications(a, "retry_failed")) return { ok: false as const, error: "Not allowed." };
    const logId = String(formData.get("logId") ?? "");
    if (!logId) return { ok: false as const, error: "Missing log id." };
    const res = await cancelQueuedNotification(logId, a.userId);
    revalidatePath("/dashboard/notifications/retry");
    revalidatePath("/dashboard/notifications/log");
    return res.ok ? { ok: true as const } : { ok: false as const, error: res.reason };
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}

export async function installDefaultRulesAction() {
  try {
    const a = await actor();
    if (!canUseNotifications(a, "manage_rules")) return { ok: false as const, error: "Not allowed." };
    const res = await installDefaultRules(a.userId);
    revalidatePath("/dashboard/notifications/rules");
    return { ok: true as const, created: res.created };
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}

const updateRuleSchema = z.object({
  id: z.string().uuid(),
  enabled: z.coerce.boolean().optional(),
  offsetMinutes: z.coerce.number().int().min(-7 * 24 * 60).max(7 * 24 * 60).optional(),
  dedupeWindowMinutes: z.coerce.number().int().min(1).max(7 * 24 * 60).optional(),
});

export async function updateRuleAction(formData: FormData) {
  try {
    const a = await actor();
    if (!canUseNotifications(a, "manage_rules")) return { ok: false as const, error: "Not allowed." };
    const parsed = updateRuleSchema.safeParse({
      id: formData.get("id"),
      enabled: formData.get("enabled") ?? undefined,
      offsetMinutes: formData.get("offsetMinutes") ?? undefined,
      dedupeWindowMinutes: formData.get("dedupeWindowMinutes") ?? undefined,
    });
    if (!parsed.success) return { ok: false as const, error: "Invalid input." };
    const res = await updateRule(a.userId, parsed.data.id, parsed.data);
    revalidatePath("/dashboard/notifications/rules");
    return res.ok ? { ok: true as const } : { ok: false as const, error: res.error };
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}
