import type { StaffRoleType, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireTenantActor, type TenantActor } from "@/lib/scope/require-tenant-actor";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { resolveWorkspacePermissions, type PermissionContext } from "@/services/permissions/permission-service";
import { ensurePlatformOwnerBootstrap } from "@/lib/platform-admin";
import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";

export type WorkspacePermissionActor = TenantActor & {
  workspaceRole: UserRole;
  staffRoleType: StaffRoleType | null;
  email: string | null;
  granted: ReadonlySet<PermissionKey>;
  platformBypass: boolean;
};

/** Load session + tenant owner + workspace permission set. */
export async function requireWorkspacePermissionActor(): Promise<WorkspacePermissionActor> {
  const tenant = await requireTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: tenant.sessionUser.id },
    select: { role: true, email: true },
  });
  const workspaceRole = (profile?.role ?? "STAFF") as UserRole;
  const email = profile?.email ?? tenant.sessionUser.email ?? null;
  const staffMember = await prisma.staffMember.findFirst({
    where: {
      linkedUserId: tenant.sessionUser.id,
      userId: tenant.userId,
      active: true,
    },
    select: { roleType: true },
  });
  await ensurePlatformOwnerBootstrap(tenant.sessionUser.id, email);
  const platformBypass = await hasSuperAdminRoleRow(tenant.sessionUser.id);
  const ctx: PermissionContext = {
    userId: tenant.userId,
    email,
    workspaceRole,
    platformBypass,
    staffRoleType: staffMember?.roleType ?? null,
  };
  return {
    ...tenant,
    workspaceRole,
    staffRoleType: staffMember?.roleType ?? null,
    email,
    granted: resolveWorkspacePermissions(ctx),
    platformBypass,
  };
}

export async function requireWorkspacePermission(required: PermissionKey): Promise<WorkspacePermissionActor> {
  const actor = await requireWorkspacePermissionActor();
  if (!hasPermission(actor.granted, required)) {
    throw new Error("FORBIDDEN");
  }
  return actor;
}
