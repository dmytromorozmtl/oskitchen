import type { NotificationType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/** Serialize caller metadata into Prisma JSON column input (plain JSON values only). */
function toPrismaJsonMetadata(
  meta: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined {
  if (meta === undefined) return undefined;
  const serialized = JSON.stringify(meta);
  const parsed: unknown = JSON.parse(serialized);
  return parsed as Prisma.InputJsonValue;
}

export async function tryRecordNotification(params: {
  userId: string;
  type: NotificationType;
  dedupeKey: string;
  recipient: string;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<boolean> {
  try {
    await prisma.notificationLog.create({
      data: {
        userId: params.userId,
        type: params.type,
        dedupeKey: params.dedupeKey,
        recipient: params.recipient,
        orderId: params.orderId ?? undefined,
        metadata: toPrismaJsonMetadata(params.metadata),
      },
    });
    return true;
  } catch (e) {
    logger.debug("Notification dedupe or insert skip", e);
    return false;
  }
}
