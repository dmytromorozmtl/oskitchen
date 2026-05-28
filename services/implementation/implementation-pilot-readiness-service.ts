import { getWorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import {
  buildImplementationPilotSsoFocusFromView,
  type ImplementationPilotReadinessModel,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveGoLivePilotReadinessTargetProject } from "@/lib/go-live/go-live-pilot-readiness-focus-era18";
import { listChannelPilotLiveProofSlices } from "@/services/developer/integration-health-service";
import { listProjects, workbenchSnapshot } from "@/services/go-live/go-live-service";

export type LoadImplementationPilotReadinessOptions = {
  goLiveProjectId?: string | null;
};

export async function loadImplementationPilotReadinessModel(
  userId: string,
  options?: LoadImplementationPilotReadinessOptions,
): Promise<ImplementationPilotReadinessModel> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  const [channelLiveProofSlices, ssoView, goLiveProjects] = await Promise.all([
    listChannelPilotLiveProofSlices(userId),
    workspaceId
      ? getWorkspaceSsoAdminView({ workspaceId, ownerUserId: userId })
      : Promise.resolve(null),
    listProjects(userId),
  ]);

  const primaryGoLive = resolveGoLivePilotReadinessTargetProject(
    goLiveProjects,
    options?.goLiveProjectId,
  );
  const goLiveSnapshot = primaryGoLive
    ? await workbenchSnapshot(
        userId,
        primaryGoLive.id,
        primaryGoLive.businessType ?? null,
        primaryGoLive.status,
      )
    : null;

  const approvalsPending = goLiveSnapshot
    ? Math.max(
        0,
        goLiveSnapshot.inputs.approvalsRequired - goLiveSnapshot.inputs.approvalsCount,
      )
    : 0;

  return {
    channelLiveProofSlices,
    pilotSso: buildImplementationPilotSsoFocusFromView({
      entitlementEnabled: ssoView?.ssoEntitlementEnabled ?? false,
      configured: ssoView?.configured ?? false,
      active: ssoView?.active ?? false,
      workspaceId,
    }),
    goLive: {
      projectId: primaryGoLive?.id ?? null,
      validation: goLiveSnapshot?.validation ?? null,
      approvalsPending,
    },
  };
}
