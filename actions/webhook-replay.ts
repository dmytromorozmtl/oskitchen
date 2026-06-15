"use server";


import { fail, ok } from "@/lib/action-result";
import { z } from "zod";

import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { assertWorkspaceWebhookReplayAllowed } from "@/lib/webhooks/webhook-replay-permissions";
import { prisma } from "@/lib/prisma";
import { requestWebhookReplay } from "@/services/webhooks/webhook-replay-service";

const schema = z.object({
  webhookEventId: z.string().uuid(),
  reason: z.string().min(8).max(2000),
  surface: z.enum(["platform", "workspace"]),
  allowInvalidSignature: z.enum(["on", ""]).optional(),
});

export type WebhookReplayActionState =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function replayWebhookEventAction(
  _prev: WebhookReplayActionState | undefined,
  formData: FormData,
): Promise<WebhookReplayActionState> {
  const parsed = schema.safeParse({
    webhookEventId: formData.get("webhookEventId"),
    reason: formData.get("reason"),
    surface: formData.get("surface"),
    allowInvalidSignature: formData.get("allowInvalidSignature")?.toString(),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid replay request." };
  }

  const d = parsed.data;
  const allowInvalidSignature = d.allowInvalidSignature === "on";

  if (d.surface === "platform") {
    const ctx = await requirePlatformAccess();
    if (!hasPlatformPermission(ctx.permissions, "platform:integrations:repair")) {
      return { ok: false, error: "Missing platform:integrations:repair permission." };
    }
    const res = await requestWebhookReplay({
      webhookEventId: d.webhookEventId,
      reason: d.reason,
      actorUserId: ctx.userId,
      actorEmail: ctx.email,
      surface: "platform",
      allowInvalidSignature,
    });
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, message: "Replay recorded. Async jobs will process on the next cron tick when enabled." };
  }

  const integrations = await requireIntegrationsActor({
    operation: "webhooks.replay",
    metadata: { surface: "workspace", webhookEventId: d.webhookEventId },
  });
  if (!integrations.ok) {
    return { ok: false, error: integrations.error };
  }
  const { sessionUser: user } = await requireTenantActor();
  const event = await prisma.webhookEvent.findUnique({
    where: { id: d.webhookEventId },
    select: { userId: true },
  });
  if (!event) {
    return { ok: false, error: "Webhook event not found." };
  }
  try {
    await assertWorkspaceWebhookReplayAllowed({
      actorUserId: user.id,
      eventOwnerUserId: event.userId,
    });
  } catch {
    return { ok: false, error: "Forbidden." };
  }

  const res = await requestWebhookReplay({
    webhookEventId: d.webhookEventId,
    reason: d.reason,
    actorUserId: user.id,
    actorEmail: user.email ?? null,
    surface: "workspace",
    allowInvalidSignature: false,
  });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, message: "Replay recorded." };
}
