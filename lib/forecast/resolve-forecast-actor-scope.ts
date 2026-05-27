import type { UserRole } from "@prisma/client";

import type { ForecastActorScope } from "@/lib/forecast/forecast-permissions";

/** Build forecast capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveForecastActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
  platformBypass?: boolean;
}): ForecastActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
    platformBypass: input.platformBypass,
  };
}
