import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import type { ProductMappingActorScope } from "@/lib/product-mapping/mapping-permissions";

/** Build product-mapping scope from workspace RBAC + profile role (never assume isOwner). */
export function createProductMappingActorScope(
  actor: WorkspacePermissionActor,
  profileRole: string | null,
): ProductMappingActorScope {
  const base = createReportActorScope({
    sessionUserId: actor.sessionUserId,
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    workspaceRole: actor.workspaceRole,
    staffRoleType: actor.staffRoleType,
    email: actor.email,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });
  return {
    isOwner: base.isOwner,
    role: profileRole ?? base.role ?? null,
    email: actor.email,
    granted: base.granted,
    platformBypass: actor.platformBypass,
  };
}
