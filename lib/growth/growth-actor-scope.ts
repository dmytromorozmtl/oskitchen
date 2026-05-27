import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import type { GrowthActorScope } from "@/lib/growth/growth-types";

/** Build growth scope from workspace RBAC + profile role (never assume isOwner). */
export function createGrowthActorScope(
  actor: WorkspacePermissionActor,
  profileRole: string | null,
): GrowthActorScope {
  const base = createReportActorScope({
    sessionUserId: actor.sessionUserId,
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    workspaceRole: actor.workspaceRole,
    staffRoleType: actor.staffRoleType,
    email: actor.email,
    granted: actor.granted,
  });
  return {
    userId: actor.userId,
    email: actor.email,
    isOwner: base.isOwner,
    role: profileRole ?? base.role ?? null,
    granted: base.granted,
  };
}
