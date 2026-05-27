import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import type { TemplateActorScope } from "@/lib/templates/template-types";

export type TemplateTenantScope = TemplateActorScope & {
  userId: string;
  email: string | null;
};

/** Build template scope from workspace RBAC + profile role (never assume isOwner). */
export function createTemplateActorScope(
  actor: WorkspacePermissionActor,
  profileRole: string | null,
): TemplateTenantScope {
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
