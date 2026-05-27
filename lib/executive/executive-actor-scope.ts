import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import type { ExecutiveActorScope } from "@/lib/executive/executive-permissions";

/** Build executive scope from workspace RBAC (never assume isOwner). */
export function createExecutiveActorScope(actor: WorkspacePermissionActor): ExecutiveActorScope {
  return createReportActorScope({
    sessionUserId: actor.sessionUserId,
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    workspaceRole: actor.workspaceRole,
    staffRoleType: actor.staffRoleType,
    email: actor.email,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });
}
