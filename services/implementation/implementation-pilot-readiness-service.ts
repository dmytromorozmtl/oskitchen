import { getWorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import {
  buildImplementationPilotSsoFocusFromView,
  type ImplementationPilotReadinessModel,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { listChannelPilotLiveProofSlices } from "@/services/developer/integration-health-service";
import { listProjects, workbenchSnapshot } from "@/services/go-live/go-live-service";

export async function loadImplementationPilotReadinessModel(
  userId: string,
): Promise<ImplementationPilotReadinessModel> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  const [channelLiveProofSlices, ssoView, goLiveProjects] = await Promise.all([
    listChannelPilotLiveProofSlices(userId),
    workspaceId
      ? getWorkspaceSsoAdminView({ workspaceId, ownerUserId: userId })
      : Promise.resolve(null),
    listProjects(userId),
  ]);

  const primaryGoLive = goLiveProjects[0] ?? null;
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
