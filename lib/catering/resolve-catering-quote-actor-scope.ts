import type { UserRole } from "@prisma/client";

import type { CateringQuoteActorScope } from "@/lib/catering/quote-permissions";

/** Build catering quote capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveCateringQuoteActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
  platformBypass?: boolean;
}): CateringQuoteActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
    platformBypass: input.platformBypass,
  };
}
