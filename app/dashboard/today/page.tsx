import { GettingStartedChecklist } from "@/components/dashboard/getting-started-checklist";
import { PilotIntegrationHealthStrip } from "@/components/dashboard/pilot-integration-health-strip";
import { OperatorTourLauncher } from "@/components/onboarding/operator-tour";
import { TodayCommandCenterView } from "@/components/dashboard/today-command-center";
import {
  loadPilotIntegrationHealthStripModelForWorkspace,
  shouldShowPilotIntegrationHealthStrip,
} from "@/lib/integrations/pilot-integration-health-strip-era18";
import { resolveOperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { loadGettingStartedStatus } from "@/services/onboarding/getting-started-status";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";

export const dynamic = "force-dynamic";

export default async function TodayOperationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ metrics?: string; checklist?: string }>;
}) {
  const [{ sessionUser, dataUserId }, actor] = await Promise.all([
    getTenantActor(),
    requireWorkspacePermissionActor(),
  ]);
  const resolvedSearchParams = (await searchParams) ?? {};
  const showFullMetrics = resolvedSearchParams.metrics === "all";
  const showAllChecklistSteps = resolvedSearchParams.checklist === "all";
  const persona = resolveOperatorHomePersona({
    workspaceRole: actor.workspaceRole,
    staffRoleType: actor.staffRoleType,
    granted: actor.granted,
    platformBypass: actor.platformBypass,
  });
  const showIntegrationHealth = shouldShowPilotIntegrationHealthStrip({
    workspaceRole: actor.workspaceRole,
    persona,
    granted: actor.granted,
  });
  const [data, profile, integrationHealthModel] = await Promise.all([
    loadTodayCommandCenter(dataUserId),
    prisma.userProfile.findUnique({
      where: { id: dataUserId },
      select: { createdAt: true },
    }),
    showIntegrationHealth
      ? loadPilotIntegrationHealthStripModelForWorkspace(dataUserId)
      : Promise.resolve(null),
  ]);
  const gettingStarted = await loadGettingStartedStatus(
    dataUserId,
    profile?.createdAt ?? new Date(),
  );

  return (
    <>
      <OperatorTourLauncher />
      <div className="space-y-6">
        {integrationHealthModel ? (
          <PilotIntegrationHealthStrip model={integrationHealthModel} />
        ) : null}
        <GettingStartedChecklist data={gettingStarted} showAllSteps={showAllChecklistSteps} />
        <TodayCommandCenterView
          userId={dataUserId}
          email={sessionUser.email ?? null}
          data={data}
          showFullMetrics={showFullMetrics}
        />
      </div>
    </>
  );
}
