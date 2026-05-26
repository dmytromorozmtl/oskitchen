import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Persist a lifecycle analytics event. No email / Resend — safe to import from
 * server actions and auth helpers without pulling `lib/email`.
 */
export async function recordLifecycleEventSafe(
  userId: string,
  eventName: string,
  metadata?: Prisma.InputJsonValue,
): Promise<void> {
  try {
    await prisma.lifecycleEvent.create({
      data: {
        userId,
        eventName: eventName.slice(0, 120),
        metadata: metadata ?? undefined,
      },
    });
  } catch (e) {
    logger.warn("recordLifecycleEvent failed", { userId, eventName, err: e });
  }
}
