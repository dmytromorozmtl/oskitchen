import type { UserRole } from "@prisma/client";

import type { StaffActorScope } from "@/lib/staff/staff-permissions";

/** Build staff capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveStaffActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
}): StaffActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
  };
}
