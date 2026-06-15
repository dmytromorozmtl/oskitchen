import { requireUserProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { canUseGoLive, type GoLiveCapability } from "@/lib/go-live/go-live-permissions";
import { resolveGoLiveActorScope } from "@/lib/go-live/resolve-go-live-actor-scope";

export async function getGoLivePageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = resolveGoLiveActorScope({
    workspaceRole: actor.workspaceRole,
    email: actor.email,
    profileRole: profile.role ?? null,
    profileEmail: profile.email ?? null,
    platformBypass: actor.platformBypass,
  });
  const canManage = hasPermission(actor.granted, "go-live.manage");
  const canUnlock = hasPermission(actor.granted, "go-live.unlock");

  function capability(cap: GoLiveCapability): boolean {
    if (cap === "go-live.view") {
      return hasPermission(actor.granted, "workspace.view") && canUseGoLive(scope, cap);
    }
    if (cap === "go-live.unlock") {
      return canUnlock && canUseGoLive(scope, cap);
    }
    return canManage && canUseGoLive(scope, cap);
  }

  return {
    actor,
    userId: actor.userId,
    sessionUserId: actor.sessionUserId,
    scope,
    canView: capability("go-live.view"),
    canCreate: capability("go-live.create"),
    canEdit: capability("go-live.edit"),
    canUpdateChecklist: capability("go-live.checklist.update"),
    canSimulate: capability("go-live.simulate"),
    canApprove: capability("go-live.approve"),
    canUnlock: capability("go-live.unlock"),
    canLaunch: capability("go-live.launch"),
    canRollback: capability("go-live.rollback"),
    canCreateIncident: capability("go-live.incident.create"),
    canResolveIncident: capability("go-live.incident.resolve"),
  };
}
