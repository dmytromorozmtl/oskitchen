import { prisma } from "@/lib/prisma";

/**
 * Workspace-scoped replay: integration owner or workspace OWNER/ADMIN acting for that owner's workspace.
 */
export async function assertWorkspaceWebhookReplayAllowed(params: {
  actorUserId: string;
  eventOwnerUserId: string;
}): Promise<void> {
  if (params.actorUserId === params.eventOwnerUserId) return;
  const member = await prisma.workspaceMember.findFirst({
    where: {
      userId: params.actorUserId,
      role: { in: ["OWNER", "ADMIN"] },
      workspace: { ownerUserId: params.eventOwnerUserId },
    },
    select: { id: true },
  });
  if (!member) {
    throw new Error("You do not have permission to replay webhooks for this workspace.");
  }
}

export const WEBHOOK_REPLAY_REASON_MIN = 8;
export const WEBHOOK_REPLAY_REASON_MAX = 2000;
