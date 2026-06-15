import { requireUserProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { canUseTraining, type TrainingCapability } from "@/lib/training/training-permissions";
import { resolveTrainingActorScope } from "@/lib/training/resolve-training-actor-scope";

export async function getTrainingPageAccess() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await requireUserProfile();
  const scope = resolveTrainingActorScope({
    workspaceRole: actor.workspaceRole,
    email: actor.email,
    profileRole: profile.role ?? null,
    profileEmail: profile.email ?? null,
    platformBypass: actor.platformBypass,
  });
  const canManage = hasPermission(actor.granted, "training.manage");
  const canParticipate = hasPermission(actor.granted, "training.participate");

  function capability(cap: TrainingCapability): boolean {
    if (cap === "training.progress.write" || cap === "training.quiz.attempt" || cap === "training.sim.run" || cap === "training.sop.acknowledge") {
      return canParticipate && canUseTraining(scope, cap);
    }
    return canManage && canUseTraining(scope, cap);
  }

  return {
    actor,
    userId: actor.userId,
    sessionUserId: actor.sessionUserId,
    scope,
    canManage,
    canParticipate,
    canView: hasPermission(actor.granted, "workspace.view"),
    canCreateProgram: capability("training.program.create"),
    canAssign: capability("training.assign"),
    canManageCerts: capability("training.cert.issue"),
    canManageSops: capability("training.sop.create"),
    canPublishSops: capability("training.sop.publish"),
    canRunSimulations: capability("training.sim.run"),
    canRecordProgress: capability("training.progress.write"),
  };
}
