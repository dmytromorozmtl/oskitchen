import { GettingStartedChecklist } from "@/components/dashboard/getting-started-checklist";
import { GettingStartedAttentionStrip } from "@/components/dashboard/getting-started-attention-strip";
import { OwnerDailyBriefingHero } from "@/components/dashboard/owner-daily-briefing-hero";
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
import {
  loadOwnerDailyBriefing,
  resolveOwnerDailyBriefingVisibility,
} from "@/services/briefing/owner-daily-briefing-service";
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
  const showOwnerBriefing = resolveOwnerDailyBriefingVisibility({
    workspaceRole: actor.workspaceRole,
    persona,
    granted: actor.granted,
  });
  const data = await loadTodayCommandCenter(dataUserId);
  const [profile, integrationHealthModel, ownerBriefing] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: dataUserId },
      select: { createdAt: true },
    }),
    showIntegrationHealth
      ? loadPilotIntegrationHealthStripModelForWorkspace(dataUserId)
      : Promise.resolve(null),
    showOwnerBriefing
      ? loadOwnerDailyBriefing(dataUserId, {
          showIntegrationHealth,
          today: data,
          persona,
          workspaceRole: actor.workspaceRole,
        })
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
        {integrationHealthModel && !ownerBriefing?.showIntegrationHealthLane ? (
          <PilotIntegrationHealthStrip model={integrationHealthModel} />
        ) : null}
        {gettingStarted.showChecklist && !gettingStarted.allDone ? (
          <GettingStartedAttentionStrip data={gettingStarted} />
        ) : null}
        {ownerBriefing ? <OwnerDailyBriefingHero briefing={ownerBriefing} /> : null}
        <GettingStartedChecklist data={gettingStarted} showAllSteps={showAllChecklistSteps} />
        <TodayCommandCenterView
          userId={dataUserId}
          email={sessionUser.email ?? null}
          data={data}
          showFullMetrics={showFullMetrics}
          briefingActive={Boolean(ownerBriefing)}
        />
      </div>
    </>
  );
}
