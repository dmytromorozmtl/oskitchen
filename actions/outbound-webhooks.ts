"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { listOutboundWebhookEventDefinitions } from "@/lib/webhooks/outbound-webhook-events";
import {
  createOutboundWebhookSubscription,
  deleteOutboundWebhookSubscription,
  listOutboundWebhookSubscriptionsForOwner,
  rotateOutboundWebhookSubscriptionSecret,
  updateOutboundWebhookSubscription,
} from "@/services/webhooks/outbound-webhook-subscription-service";
import {
  listRecentOutboundWebhookDeliveries,
  sendOutboundWebhookTestPing,
} from "@/services/webhooks/outbound-webhook-delivery-service";

const createSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url().max(2048),
  description: z.string().max(2000).optional(),
  events: z.array(z.string()).min(1),
});

const updateSchema = z.object({
  subscriptionId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  url: z.string().url().max(2048).optional(),
  description: z.string().max(2000).optional().nullable(),
  events: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
});

const idSchema = z.object({
  subscriptionId: z.string().uuid(),
});

function revalidateOutboundWebhookPaths() {
  revalidatePath("/dashboard/integrations/outbound-webhooks");
  revalidatePath("/dashboard/integrations/extensions");
  revalidatePath("/dashboard/sales-channels/webhooks");
}

export async function loadOutboundWebhooksHubDataAction() {
  const access = await requireIntegrationsActor({ operation: "outbound_webhooks.read" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const [subscriptions, deliveries, events] = await Promise.all([
    listOutboundWebhookSubscriptionsForOwner(access.actor.userId),
    listRecentOutboundWebhookDeliveries(access.actor.userId),
    Promise.resolve(listOutboundWebhookEventDefinitions()),
  ]);

  return {
    ok: true as const,
    subscriptions,
    deliveries,
    events,
  };
}

export async function createOutboundWebhookSubscriptionAction(
  raw: z.infer<typeof createSchema>,
) {
  const access = await requireIntegrationsActor({ operation: "outbound_webhooks.create" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const input = createSchema.safeParse(raw);
  if (!input.success) {
    return { ok: false as const, error: "Invalid subscription payload." };
  }

  const result = await createOutboundWebhookSubscription({
    ownerUserId: access.actor.userId,
    workspaceId: access.workspaceId,
    actorUserId: access.actor.sessionUser.id,
    name: input.data.name,
    url: input.data.url,
    events: input.data.events,
    description: input.data.description,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidateOutboundWebhookPaths();
  return {
    ok: true as const,
    subscription: result.subscription,
    secret: result.secret,
  };
}

export async function updateOutboundWebhookSubscriptionAction(
  raw: z.infer<typeof updateSchema>,
) {
  const access = await requireIntegrationsActor({ operation: "outbound_webhooks.update" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const input = updateSchema.safeParse(raw);
  if (!input.success) {
    return { ok: false as const, error: "Invalid update payload." };
  }

  const result = await updateOutboundWebhookSubscription({
    ownerUserId: access.actor.userId,
    subscriptionId: input.data.subscriptionId,
    actorUserId: access.actor.sessionUser.id,
    workspaceId: access.workspaceId,
    patch: {
      name: input.data.name,
      url: input.data.url,
      events: input.data.events,
      active: input.data.active,
      description: input.data.description,
    },
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidateOutboundWebhookPaths();
  return { ok: true as const };
}

export async function deleteOutboundWebhookSubscriptionAction(
  raw: z.infer<typeof idSchema>,
) {
  const access = await requireIntegrationsActor({ operation: "outbound_webhooks.delete" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const input = idSchema.safeParse(raw);
  if (!input.success) return { ok: false as const, error: "Invalid subscription id." };

  const result = await deleteOutboundWebhookSubscription({
    ownerUserId: access.actor.userId,
    subscriptionId: input.data.subscriptionId,
    actorUserId: access.actor.sessionUser.id,
    workspaceId: access.workspaceId,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidateOutboundWebhookPaths();
  return { ok: true as const };
}

export async function rotateOutboundWebhookSecretAction(raw: z.infer<typeof idSchema>) {
  const access = await requireIntegrationsActor({ operation: "outbound_webhooks.rotate_secret" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const input = idSchema.safeParse(raw);
  if (!input.success) return { ok: false as const, error: "Invalid subscription id." };

  const result = await rotateOutboundWebhookSubscriptionSecret({
    ownerUserId: access.actor.userId,
    subscriptionId: input.data.subscriptionId,
    actorUserId: access.actor.sessionUser.id,
    workspaceId: access.workspaceId,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidateOutboundWebhookPaths();
  return { ok: true as const, secret: result.secret };
}

export async function testOutboundWebhookSubscriptionAction(raw: z.infer<typeof idSchema>) {
  const access = await requireIntegrationsActor({ operation: "outbound_webhooks.test" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const input = idSchema.safeParse(raw);
  if (!input.success) return { ok: false as const, error: "Invalid subscription id." };

  const result = await sendOutboundWebhookTestPing({
    ownerUserId: access.actor.userId,
    subscriptionId: input.data.subscriptionId,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidateOutboundWebhookPaths();
  return { ok: true as const, deliveryId: result.deliveryId };
}
