import type { UserRole } from "@prisma/client";

import { getTenantActor } from "@/lib/scope/cached-tenant";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import {
  requireWorkspacePermissionActor,
  type WorkspacePermissionActor,
} from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";

/** Dashboard pages must not 500 when permission bootstrap queries fail. */
export async function safeRequireWorkspacePermissionActor(): Promise<WorkspacePermissionActor> {
  try {
    return await requireWorkspacePermissionActor();
  } catch (error) {
    console.error("[permissions] requireWorkspacePermissionActor failed", error);
    const tenant = await getTenantActor();
    const profile = await prisma.userProfile
      .findUnique({
        where: { id: tenant.sessionUser.id },
        select: { role: true, email: true },
      })
      .catch(() => null);
    const workspaceRole = (profile?.role ?? "OWNER") as UserRole;
    return {
      ...tenant,
      workspaceRole,
      staffRoleType: null,
      email: profile?.email ?? tenant.sessionUser.email ?? null,
      granted: defaultPermissionsForWorkspaceRole(workspaceRole),
      platformBypass: false,
    };
  }
}
