import { Prisma } from "@prisma/client";
import type { IntegrationProvider } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

export async function upsertExternalProductRecord(input: {
  userId: string;
  connectionId: string;
  provider: IntegrationProvider;
  externalProductId: string;
  externalVariantId: string;
  title: string;
  sku: string | null;
  price: Prisma.Decimal | null;
  image: string | null;
  rawPayloadJson: unknown;
}) {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const raw = input.rawPayloadJson as Prisma.InputJsonValue;
  const existing = await prisma.externalProduct.findUnique({
    where: {
      connectionId_externalProductId_externalVariantId: {
        connectionId: input.connectionId,
        externalProductId: input.externalProductId,
        externalVariantId: input.externalVariantId,
      },
    },
    select: { workspaceId: true },
  });
  await prisma.externalProduct.upsert({
    where: {
      connectionId_externalProductId_externalVariantId: {
        connectionId: input.connectionId,
        externalProductId: input.externalProductId,
        externalVariantId: input.externalVariantId,
      },
    },
    create: {
      userId: input.userId,
      workspaceId,
      connectionId: input.connectionId,
      provider: input.provider,
      externalProductId: input.externalProductId,
      externalVariantId: input.externalVariantId,
      title: input.title,
      sku: input.sku,
      price: input.price ?? undefined,
      image: input.image ?? undefined,
      rawPayloadJson: raw,
    },
    update: {
      ...(workspaceId && !existing?.workspaceId ? { workspaceId } : {}),
      title: input.title,
      sku: input.sku ?? undefined,
      price: input.price ?? undefined,
      image: input.image ?? undefined,
      rawPayloadJson: raw,
    },
  });
}
