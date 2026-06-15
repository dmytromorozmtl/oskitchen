import type { UserRole } from "@prisma/client";

import type { MealPlanActorScope } from "@/lib/meal-plans/meal-plan-permissions";

/** Build meal-plan capability scope from workspace RBAC + profile (never assume isOwner). */
export function resolveMealPlanActorScope(input: {
  workspaceRole: UserRole;
  email: string | null;
  profileRole: string | null;
  profileEmail: string | null;
  platformBypass?: boolean;
}): MealPlanActorScope {
  return {
    isOwner: input.workspaceRole === "OWNER",
    role: input.profileRole ?? input.workspaceRole,
    email: input.profileEmail ?? input.email,
    platformBypass: input.platformBypass,
  };
}
