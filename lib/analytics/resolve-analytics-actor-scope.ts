import type { UserRole } from "@prisma/client";

import type { AnalyticsActorScope } from "@/lib/analytics/analytics-permissions";

/** Build analytics capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveAnalyticsActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
  platformBypass?: boolean;
}): AnalyticsActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
    platformBypass: input.platformBypass,
  };
}
