import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getPrimaryOwnerStorefront } from "@/lib/storefront/resolve-owner-storefront";
import { storefrontPermissionsForRole, type StorefrontPermission } from "@/lib/storefront/storefront-permissions";

export async function getStorefrontPermissionSetForUser(userId: string): Promise<{
  role: UserRole;
  email: string | null;
  permissions: Set<StorefrontPermission>;
}> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { role: true, email: true },
  });
  const role = profile?.role ?? "STAFF";
  const email = profile?.email ?? null;
  const sf = await getPrimaryOwnerStorefront(userId);
  const staffBuilder =
    role === "STAFF" &&
    (sf?.staffCanEditStorefront === true || process.env.STOREFRONT_STAFF_CAN_EDIT === "true");
  const staffPublish =
    role === "STAFF" &&
    staffBuilder &&
    (sf?.staffCanPublishStorefront === true || process.env.STOREFRONT_STAFF_CAN_PUBLISH === "true");
  return {
    role,
    email,
    permissions: storefrontPermissionsForRole(role, {
      marketingDraft: staffBuilder,
      staffPublish,
    }),
  };
}
