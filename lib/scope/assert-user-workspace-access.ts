import { userWorkspaceIds } from "@/lib/support/support-permissions";

/**
 * Thrown when a user attempts to bind a mutation or read to a workspace they do not belong to.
 * Server actions should catch and map to a generic client message (avoid leaking whether id exists).
 */
export class WorkspaceAccessDeniedError extends Error {
  readonly code = "WORKSPACE_ACCESS_DENIED" as const;

  constructor() {
    super("Workspace access denied");
    this.name = "WorkspaceAccessDeniedError";
  }
}

/** True if the user owns or is an active member of the workspace. */
export async function userHasWorkspaceAccess(userId: string, workspaceId: string): Promise<boolean> {
  const allowed = await userWorkspaceIds(userId);
  return allowed.includes(workspaceId);
}

/** Throws {@link WorkspaceAccessDeniedError} if the user cannot access the workspace. */
export async function assertUserCanAccessWorkspace(userId: string, workspaceId: string): Promise<void> {
  if (!(await userHasWorkspaceAccess(userId, workspaceId))) {
    throw new WorkspaceAccessDeniedError();
  }
}
