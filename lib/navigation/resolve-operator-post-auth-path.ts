import type { StaffRoleType, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensurePlatformOwnerBootstrap } from "@/lib/platform-admin";
import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";
import {
  resolveOperatorDefaultLandingPath,
  resolveOperatorHomePersona,
} from "@/lib/navigation/operator-home-era18";
import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";
import { resolveWorkspacePermissions } from "@/services/permissions/permission-service";

/** Session-aware post-auth path — persona landing for staff, today for owners. */
export async function resolvePostAuthPathForSessionUser(sessionUserId: string): Promise<string> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: sessionUserId },
    select: { role: true, onboardingCompleted: true, email: true },
  });

  if (!profile?.onboardingCompleted) {
    return "/onboarding";
  }

  const workspaceRole = (profile.role ?? "OWNER") as UserRole;
  if (workspaceRole === "OWNER") {
    return resolveOperatorDefaultLandingPath({
      persona: "owner",
      granted: resolveWorkspacePermissions({
        userId: sessionUserId,
        email: profile.email,
        workspaceRole: "OWNER",
        platformBypass: false,
      }),
    });
  }

  const dataUserId = await resolveTenantDataUserId(sessionUserId);
  const staffMember = await prisma.staffMember.findFirst({
    where: {
      linkedUserId: sessionUserId,
      userId: dataUserId,
      active: true,
    },
    select: { roleType: true },
  });

  const email = profile.email;
  await ensurePlatformOwnerBootstrap(sessionUserId, email);
  const platformBypass = await hasSuperAdminRoleRow(sessionUserId);
  const staffRoleType = (staffMember?.roleType ?? null) as StaffRoleType | null;
  const granted = resolveWorkspacePermissions({
    userId: dataUserId,
    email,
    workspaceRole,
    platformBypass,
    staffRoleType,
  });

  const persona = resolveOperatorHomePersona({
    workspaceRole,
    staffRoleType,
    granted,
    platformBypass,
  });

  return resolveOperatorDefaultLandingPath({ persona, granted });
}
