import type { LabelAuditProfileType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function appendLabelVerificationEvent(input: {
  userId: string;
  productId: string;
  profileType: LabelAuditProfileType;
  action: string;
  performedById: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.labelVerificationEvent.create({
    data: {
      userId: input.userId,
      productId: input.productId,
      profileType: input.profileType,
      action: input.action.slice(0, 80),
      performedById: input.performedById,
      metadataJson: input.metadata
        ? (JSON.parse(JSON.stringify(input.metadata)) as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
