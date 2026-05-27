import { requireUserProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { canManageStaff, type StaffCapability } from "@/lib/staff/staff-permissions";
import { resolveStaffActorScope } from "@/lib/staff/resolve-staff-actor-scope";

export async function getStaffPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = resolveStaffActorScope({
    workspaceRole: actor.workspaceRole,
    email: actor.email,
    profileRole: profile.role ?? null,
    profileEmail: profile.email ?? null,
  });
  const canManage = hasPermission(actor.granted, "staff.manage");

  function capability(cap: StaffCapability): boolean {
    return canManage && canManageStaff(scope, cap);
  }

  return {
    actor,
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    scope,
    canManage,
    canPII: capability("staff.view.pii"),
    canEdit: capability("staff.update"),
    canCertWrite: capability("staff.cert.write"),
    canRoleManage: capability("staff.role.create"),
  };
}
