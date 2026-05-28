import { HomeOverview } from "@/components/dashboard/home-overview";
import { OperatorHomePanel } from "@/components/dashboard/operator-home-panel";
import { PilotIntegrationHealthStrip } from "@/components/dashboard/pilot-integration-health-strip";
import {
  listOperatorHomeActions,
  resolveOperatorHomePersona,
} from "@/lib/navigation/operator-home-era18";
import {
  loadPilotIntegrationHealthStripModelForWorkspace,
  shouldShowPilotIntegrationHealthStrip,
} from "@/lib/integrations/pilot-integration-health-strip-era18";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function DashboardHomePage() {
  const [{ dataUserId }, actor] = await Promise.all([
    getTenantActor(),
    requireWorkspacePermissionActor(),
  ]);

  const persona = resolveOperatorHomePersona({
    workspaceRole: actor.workspaceRole,
    staffRoleType: actor.staffRoleType,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });

  if (persona === "owner") {
    return <HomeOverview userId={dataUserId} />;
  }

  const actions = listOperatorHomeActions(persona, actor.granted);

  let integrationHealthStrip = null;
  if (
    shouldShowPilotIntegrationHealthStrip({
      workspaceRole: actor.workspaceRole,
      persona,
      granted: actor.granted,
    })
  ) {
    integrationHealthStrip = (
      <PilotIntegrationHealthStrip
        model={await loadPilotIntegrationHealthStripModelForWorkspace(dataUserId)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {integrationHealthStrip}
      <OperatorHomePanel persona={persona} actions={actions} />
    </div>
  );
}
