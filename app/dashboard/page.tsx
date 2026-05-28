import { HomeOverview } from "@/components/dashboard/home-overview";
import { OperatorHomePanel } from "@/components/dashboard/operator-home-panel";
import {
  listOperatorHomeActions,
  resolveOperatorHomePersona,
} from "@/lib/navigation/operator-home-era18";
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

  return <OperatorHomePanel persona={persona} actions={actions} />;
}
