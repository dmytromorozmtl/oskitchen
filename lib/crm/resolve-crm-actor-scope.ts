import type { UserRole } from "@prisma/client";

import type { CrmActorScope } from "@/lib/crm/customer-permissions";

/** Build CRM capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveCrmActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
  platformBypass?: boolean;
}): CrmActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
    platformBypass: input.platformBypass,
  };
}
