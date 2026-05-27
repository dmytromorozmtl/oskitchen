import type { UserRole } from "@prisma/client";

import type { TaskActorScope } from "@/lib/tasks/task-permissions";

/** Build task capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveTaskActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
  platformBypass?: boolean;
}): TaskActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
    platformBypass: input.platformBypass,
  };
}
