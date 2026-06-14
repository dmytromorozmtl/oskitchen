import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { billingEventListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function recordBillingEvent(input: {
  userId: string;
  workspaceId?: string | null;
  eventType: string;
  source?: "internal" | "stripe" | "admin" | "user";
  stripeEventId?: string | null;
  performedById?: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  if (input.stripeEventId) {
    const exists = await prisma.billingEvent.findUnique({
      where: { stripeEventId: input.stripeEventId },
    });
    if (exists) return;
  }
  const workspaceId =
    input.workspaceId ?? (await ensureOwnerWorkspaceId(input.userId));
  await prisma.billingEvent.create({
    data: {
      userId: input.userId,
      workspaceId,
      eventType: input.eventType,
      source: input.source ?? "internal",
      stripeEventId: input.stripeEventId ?? undefined,
      performedById: input.performedById ?? undefined,
      summary: input.summary ?? undefined,
      metadataJson: input.metadata ? (input.metadata as unknown as Prisma.InputJsonValue) : undefined,
    },
  });
}

export async function listBillingEvents(userId: string, limit = 50) {
  return prisma.billingEvent.findMany({
    where: await billingEventListWhereForOwner(userId),
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    include: { performedBy: { select: { id: true, fullName: true, email: true } } },
  });
}

export async function ensureBillingCustomer(input: {
  userId: string;
  workspaceId?: string | null;
  stripeCustomerId?: string | null;
  billingEmail?: string | null;
  billingName?: string | null;
}) {
  const workspaceId =
    input.workspaceId ?? (await ensureOwnerWorkspaceId(input.userId));
  return prisma.billingCustomer.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      workspaceId: workspaceId ?? undefined,
      stripeCustomerId: input.stripeCustomerId ?? undefined,
      billingEmail: input.billingEmail ?? undefined,
      billingName: input.billingName ?? undefined,
    },
    update: {
      workspaceId: workspaceId ?? undefined,
      stripeCustomerId: input.stripeCustomerId ?? undefined,
      billingEmail: input.billingEmail ?? undefined,
      billingName: input.billingName ?? undefined,
    },
  });
}

export async function getBillingCustomer(userId: string) {
  return prisma.billingCustomer.findUnique({ where: { userId } });
}
