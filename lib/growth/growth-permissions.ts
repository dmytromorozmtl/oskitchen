import type { UserRole } from "@prisma/client";

import { canAccessOwnerOnlySurfaces } from "@/lib/platform-admin";
import { hasPermission } from "@/lib/permissions/guards";
import { workspacePermissionForGrowthCapability } from "@/lib/growth/growth-permission-keys";
import type { GrowthActorScope, GrowthCapability } from "@/lib/growth/growth-types";
import { prisma } from "@/lib/prisma";

const GTM_PLATFORM_ROLES = ["SUPER_ADMIN", "PLATFORM_ADMIN", "GROWTH_ADMIN", "PARTNER_ADMIN", "SUPPORT_ADMIN"] as const;

/**
 * Growth / founder CRM is restricted to workspace owners, platform superadmins,
 * and selected platform GTM roles — never normal staff/tenant users.
 */
export async function canAccessGrowthModule(
  userId: string,
  email: string | null | undefined,
  profileRole: UserRole,
): Promise<boolean> {
  if (await canAccessOwnerOnlySurfaces(userId, email, profileRole)) return true;
  const row = await prisma.platformUserRole.findFirst({
    where: { userId, role: { in: [...GTM_PLATFORM_ROLES] } },
    select: { id: true },
  });
  return Boolean(row);
}

export function canUseGrowth(scope: GrowthActorScope, capability: GrowthCapability): boolean {
  if (scope.platformBypass) return true;
  const required = workspacePermissionForGrowthCapability(capability);
  if (scope.granted && hasPermission(scope.granted, required)) return true;
  return false;
}
