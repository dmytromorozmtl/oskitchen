import { prisma } from "@/lib/prisma";
import { assertUserCanAccessWorkspace, WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";

/**
 * Resolves which `KitchenSettings.userId` row mutations should target.
 * Workspace members read/write the workspace owner's settings (after access check).
 */
export async function resolveKitchenSettingsDataUserId(sessionUserId: string): Promise<string> {
  const owned = await prisma.workspace.findFirst({
    where: { ownerUserId: sessionUserId },
    select: { id: true, ownerUserId: true },
    orderBy: { createdAt: "asc" },
  });
  if (owned) return owned.ownerUserId;

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: sessionUserId },
    select: { workspaceId: true, workspace: { select: { ownerUserId: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (membership?.workspace) {
    await assertUserCanAccessWorkspace(sessionUserId, membership.workspaceId);
    return membership.workspace.ownerUserId;
  }

  return sessionUserId;
}

export async function resolveKitchenSettingsDataUserIdForWorkspace(
  sessionUserId: string,
  workspaceId: string,
): Promise<string> {
  await assertUserCanAccessWorkspace(sessionUserId, workspaceId);
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerUserId: true },
  });
  if (!ws) throw new WorkspaceAccessDeniedError();
  return ws.ownerUserId;
}
