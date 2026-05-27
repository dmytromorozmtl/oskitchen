import type { UserRole } from "@prisma/client";

import type { BrandActorScope } from "@/lib/brands/brand-permissions";

/** Build brand capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveBrandActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  platformBypass?: boolean;
  assignedBrandIds?: readonly string[] | null;
}): BrandActorScope {
  return {
    isWorkspaceOwner: input.workspaceRole === "OWNER",
    email: input.email,
    platformBypass: input.platformBypass,
    assignedBrandIds: input.assignedBrandIds,
  };
}
