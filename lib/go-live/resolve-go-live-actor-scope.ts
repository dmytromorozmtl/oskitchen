import type { UserRole } from "@prisma/client";

import type { GoLiveActorScope } from "@/lib/go-live/go-live-permissions";

/** Build go-live capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveGoLiveActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
  platformBypass?: boolean;
}): GoLiveActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
    platformBypass: input.platformBypass,
  };
}
