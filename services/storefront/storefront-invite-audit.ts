import { toInputJsonValue } from "@/lib/prisma/json";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const STOREFRONT_INVITE_AUDIT_EVENTS = [
  "created",
  "reminded",
  "accepted",
  "cancelled",
  "magic_link_sent",
  "magic_link_failed",
] as const;

export type StorefrontInviteAuditEventType = (typeof STOREFRONT_INVITE_AUDIT_EVENTS)[number];

export async function logStorefrontTeamInviteEvent(input: {
  eventType: StorefrontInviteAuditEventType;
  storefrontId: string;
  workspaceId: string;
  inviteId?: string | null;
  actorUserId?: string | null;
  targetEmail?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.storefrontTeamInviteEvent.create({
      data: {
        eventType: input.eventType,
        storefrontId: input.storefrontId,
        workspaceId: input.workspaceId,
        inviteId: input.inviteId ?? null,
        actorUserId: input.actorUserId ?? null,
        targetEmail: input.targetEmail ?? null,
        metadataJson: input.metadata ? toInputJsonValue(input.metadata) : undefined,
      },
    });
  } catch (err) {
    logger.warn("storefront_invite_audit_write_failed", {
      eventType: input.eventType,
      storefrontId: input.storefrontId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
