import type { UserRole } from "@prisma/client";

import type { LocationActorScope } from "@/lib/locations/location-permissions";

/** Build location capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveLocationActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
  platformBypass?: boolean;
  allowedLocationIds?: readonly string[] | null;
}): LocationActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
    platformBypass: input.platformBypass,
    allowedLocationIds: input.allowedLocationIds,
  };
}
