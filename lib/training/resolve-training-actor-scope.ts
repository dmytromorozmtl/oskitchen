import type { UserRole } from "@prisma/client";

import type { TrainingActorScope } from "@/lib/training/training-permissions";

/** Build training capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveTrainingActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
}): TrainingActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
  };
}
