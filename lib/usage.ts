import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const USAGE_EVENT_NAMES = [
  "onboarding_started",
  "onboarding_completed",
  "menu_created",
  "product_created",
  "order_created",
  "integration_connected",
  "external_order_imported",
  "production_task_completed",
  "packing_exported",
  "demo_launched",
  "billing_checkout_started",
  "account_created",
] as const;

export type UsageEventName = (typeof USAGE_EVENT_NAMES)[number];

function trackingEnabled(): boolean {
  return process.env.USAGE_TRACKING_DISABLED !== "1";
}

/** Fire-and-forget product usage event (no PII in metadata). */
export async function trackUsageEvent(params: {
  userId: string;
  eventName: UsageEventName | string;
  route?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!trackingEnabled()) return;
  try {
    await prisma.usageEvent.create({
      data: {
        userId: params.userId,
        eventName: params.eventName.slice(0, 120),
        route: params.route?.slice(0, 512) ?? null,
        metadata:
          params.metadata === undefined
            ? undefined
            : (params.metadata as Prisma.InputJsonValue),
      },
    });
  } catch (e) {
    logger.warn("trackUsageEvent failed", { eventName: params.eventName, err: e });
  }
}
