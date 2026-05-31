import { randomBytes } from "crypto";

import type { Prisma } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import { encryptSecret, isEncryptionConfigured } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import {
  isKnownOutboundWebhookEventType,
  validateOutboundWebhookEventTypes,
} from "@/lib/webhooks/outbound-webhook-events";

export type OutboundWebhookSubscriptionView = {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastDeliveryAt: Date | null;
  lastSuccessAt: Date | null;
  lastFailureAt: Date | null;
  consecutiveFailures: number;
  secretPreview: string;
};

function secretPreviewFromEncrypted(secretEncrypted: string): string {
  return `whsec_••••${secretEncrypted.slice(-6)}`;
}

function validateWebhookUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "Endpoint URL must be a valid URL.";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "Endpoint URL must use http or https.";
  }
  if (parsed.protocol === "http:" && !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    return "Non-localhost endpoints must use HTTPS.";
  }
  return null;
}

export async function listOutboundWebhookSubscriptionsForOwner(
  ownerUserId: string,
): Promise<OutboundWebhookSubscriptionView[]> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  const rows = await prisma.outboundWebhookSubscription.findMany({
    where: scope as Prisma.OutboundWebhookSubscriptionWhereInput,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    events: row.events,
    active: row.active,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastDeliveryAt: row.lastDeliveryAt,
    lastSuccessAt: row.lastSuccessAt,
    lastFailureAt: row.lastFailureAt,
    consecutiveFailures: row.consecutiveFailures,
    secretPreview: secretPreviewFromEncrypted(row.secretEncrypted),
  }));
}

export async function createOutboundWebhookSubscription(input: {
  ownerUserId: string;
  workspaceId: string | null;
  actorUserId: string;
  name: string;
  url: string;
  events: string[];
  description?: string | null;
}): Promise<
  | { ok: true; subscription: OutboundWebhookSubscriptionView; secret: string }
  | { ok: false; error: string }
> {
  if (!isEncryptionConfigured()) {
    return {
      ok: false,
      error: "ENCRYPTION_KEY is required before creating outbound webhook subscriptions.",
    };
  }

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };

  const urlError = validateWebhookUrl(input.url.trim());
  if (urlError) return { ok: false, error: urlError };

  const eventErrors = validateOutboundWebhookEventTypes(input.events);
  if (eventErrors.length > 0) {
    return { ok: false, error: eventErrors[0] ?? "Invalid events." };
  }

  const secret = randomBytes(32).toString("hex");
  const row = await prisma.outboundWebhookSubscription.create({
    data: {
      userId: input.ownerUserId,
      workspaceId: input.workspaceId,
      name,
      url: input.url.trim(),
      events: input.events.filter(isKnownOutboundWebhookEventType),
      secretEncrypted: encryptSecret(secret),
      description: input.description?.trim() || null,
      active: true,
    },
  });

  await recordAuditLog({
    userId: input.actorUserId,
    workspaceId: input.workspaceId,
    action: "OUTBOUND_WEBHOOK_SUBSCRIPTION_CREATED",
    entityType: "OutboundWebhookSubscription",
    entityId: row.id,
    metadata: { name, url: row.url, events: row.events },
  });

  return {
    ok: true,
    secret,
    subscription: {
      id: row.id,
      name: row.name,
      url: row.url,
      events: row.events,
      active: row.active,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastDeliveryAt: row.lastDeliveryAt,
      lastSuccessAt: row.lastSuccessAt,
      lastFailureAt: row.lastFailureAt,
      consecutiveFailures: row.consecutiveFailures,
      secretPreview: secretPreviewFromEncrypted(row.secretEncrypted),
    },
  };
}

export async function updateOutboundWebhookSubscription(input: {
  ownerUserId: string;
  subscriptionId: string;
  actorUserId: string;
  workspaceId: string | null;
  patch: {
    name?: string;
    url?: string;
    events?: string[];
    active?: boolean;
    description?: string | null;
  };
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await resolveOwnerScopedWhere(input.ownerUserId);
  const existing = await prisma.outboundWebhookSubscription.findFirst({
    where: { AND: [scope as Prisma.OutboundWebhookSubscriptionWhereInput, { id: input.subscriptionId }] },
  });
  if (!existing) return { ok: false, error: "Subscription not found." };

  const data: Prisma.OutboundWebhookSubscriptionUpdateInput = {};
  if (typeof input.patch.name === "string") {
    const name = input.patch.name.trim();
    if (!name) return { ok: false, error: "Name cannot be empty." };
    data.name = name;
  }
  if (typeof input.patch.url === "string") {
    const urlError = validateWebhookUrl(input.patch.url.trim());
    if (urlError) return { ok: false, error: urlError };
    data.url = input.patch.url.trim();
  }
  if (input.patch.events) {
    const eventErrors = validateOutboundWebhookEventTypes(input.patch.events);
    if (eventErrors.length > 0) return { ok: false, error: eventErrors[0] ?? "Invalid events." };
    data.events = input.patch.events.filter(isKnownOutboundWebhookEventType);
  }
  if (typeof input.patch.active === "boolean") {
    data.active = input.patch.active;
  }
  if (input.patch.description !== undefined) {
    data.description = input.patch.description?.trim() || null;
  }

  await prisma.outboundWebhookSubscription.update({
    where: { id: existing.id },
    data,
  });

  await recordAuditLog({
    userId: input.actorUserId,
    workspaceId: input.workspaceId,
    action: "OUTBOUND_WEBHOOK_SUBSCRIPTION_UPDATED",
    entityType: "OutboundWebhookSubscription",
    entityId: existing.id,
    metadata: { patch: input.patch },
  });

  return { ok: true };
}

export async function deleteOutboundWebhookSubscription(input: {
  ownerUserId: string;
  subscriptionId: string;
  actorUserId: string;
  workspaceId: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await resolveOwnerScopedWhere(input.ownerUserId);
  const existing = await prisma.outboundWebhookSubscription.findFirst({
    where: { AND: [scope as Prisma.OutboundWebhookSubscriptionWhereInput, { id: input.subscriptionId }] },
  });
  if (!existing) return { ok: false, error: "Subscription not found." };

  await prisma.outboundWebhookSubscription.delete({ where: { id: existing.id } });

  await recordAuditLog({
    userId: input.actorUserId,
    workspaceId: input.workspaceId,
    action: "OUTBOUND_WEBHOOK_SUBSCRIPTION_DELETED",
    entityType: "OutboundWebhookSubscription",
    entityId: existing.id,
    metadata: { name: existing.name, url: existing.url },
  });

  return { ok: true };
}

export async function rotateOutboundWebhookSubscriptionSecret(input: {
  ownerUserId: string;
  subscriptionId: string;
  actorUserId: string;
  workspaceId: string | null;
}): Promise<{ ok: true; secret: string } | { ok: false; error: string }> {
  if (!isEncryptionConfigured()) {
    return { ok: false, error: "ENCRYPTION_KEY is required before rotating webhook secrets." };
  }

  const scope = await resolveOwnerScopedWhere(input.ownerUserId);
  const existing = await prisma.outboundWebhookSubscription.findFirst({
    where: { AND: [scope as Prisma.OutboundWebhookSubscriptionWhereInput, { id: input.subscriptionId }] },
  });
  if (!existing) return { ok: false, error: "Subscription not found." };

  const secret = randomBytes(32).toString("hex");
  await prisma.outboundWebhookSubscription.update({
    where: { id: existing.id },
    data: { secretEncrypted: encryptSecret(secret), consecutiveFailures: 0 },
  });

  await recordAuditLog({
    userId: input.actorUserId,
    workspaceId: input.workspaceId,
    action: "OUTBOUND_WEBHOOK_SECRET_ROTATED",
    entityType: "OutboundWebhookSubscription",
    entityId: existing.id,
  });

  return { ok: true, secret };
}

export async function getOutboundWebhookSubscriptionSecretForDelivery(
  subscriptionId: string,
): Promise<string | null> {
  const row = await prisma.outboundWebhookSubscription.findUnique({
    where: { id: subscriptionId },
    select: { secretEncrypted: true, active: true },
  });
  if (!row?.active) return null;
  try {
    const { decryptSecret } = await import("@/lib/crypto");
    return decryptSecret(row.secretEncrypted);
  } catch {
    return null;
  }
}
