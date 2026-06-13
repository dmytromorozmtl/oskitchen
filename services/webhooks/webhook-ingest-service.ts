import { IntegrationProvider } from "@prisma/client";

import { getWebhookJobMaxAttempts } from "@/lib/webhooks/webhook-job-config";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

export async function resolveWebhookJobWorkspaceId(input: {
  userId: string;
  workspaceId?: string | null;
}): Promise<string> {
  if (input.workspaceId?.trim()) {
    return input.workspaceId.trim();
  }
  const resolved = await resolveOwnerWorkspaceId(input.userId);
  if (!resolved) {
    throw new Error("Cannot enqueue webhook job — workspace could not be resolved for user");
  }
  return resolved;
}

/** Enqueue async processing for WooCommerce after `WebhookEvent` row exists. */
export async function enqueueWooCommerceWebhookJob(params: {
  webhookEventId: string;
  userId: string;
  workspaceId?: string | null;
}): Promise<void> {
  const workspaceId = await resolveWebhookJobWorkspaceId(params);
  await prisma.webhookProcessingJob.create({
    data: {
      webhookEventId: params.webhookEventId,
      userId: params.userId,
      workspaceId,
      provider: IntegrationProvider.WOOCOMMERCE,
      maxAttempts: getWebhookJobMaxAttempts(),
    },
  });
}

/** Enqueue async processing for Shopify after `WebhookEvent` row exists. */
export async function enqueueShopifyWebhookJob(params: {
  webhookEventId: string;
  userId: string;
  workspaceId?: string | null;
}): Promise<void> {
  const workspaceId = await resolveWebhookJobWorkspaceId(params);
  await prisma.webhookProcessingJob.create({
    data: {
      webhookEventId: params.webhookEventId,
      userId: params.userId,
      workspaceId,
      provider: IntegrationProvider.SHOPIFY,
      maxAttempts: getWebhookJobMaxAttempts(),
    },
  });
}
