import { GettingStartedChecklist } from "@/components/dashboard/getting-started-checklist";
import { GettingStartedAttentionStrip } from "@/components/dashboard/getting-started-attention-strip";
import { OwnerDailyBriefingHero } from "@/components/dashboard/owner-daily-briefing-hero";
import { PilotIntegrationHealthStrip } from "@/components/dashboard/pilot-integration-health-strip";
import { OperatorTourLauncher } from "@/components/onboarding/operator-tour";
import { TodayCommandCenterView } from "@/components/dashboard/today-command-center";
import { LaunchWizardTodayStrip } from "@/components/dashboard/launch-wizard/launch-wizard-today-strip";
import {
  loadPilotIntegrationHealthStripModelForWorkspace,
  shouldShowPilotIntegrationHealthStrip,
} from "@/lib/integrations/pilot-integration-health-strip-era18";
import { resolveOperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { canUseFullSupportInbox } from "@/lib/support/support-permissions";
import { prisma } from "@/lib/prisma";
import { loadGettingStartedStatus } from "@/services/onboarding/getting-started-status";
import {
  loadOwnerDailyBriefing,
  resolveOwnerDailyBriefingVisibility,
} from "@/services/briefing/owner-daily-briefing-service";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";
import { loadLaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";

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
  const supportAdmin =
    actor.platformBypass ||
    (await canUseFullSupportInbox(actor.sessionUserId, actor.email, actor.workspaceRole));
  const showOwnerBriefing = resolveOwnerDailyBriefingVisibility({
    workspaceRole: actor.workspaceRole,
    persona,
    granted: actor.granted,
    supportAdmin,
  });
  const showLaunchWizardStrip = actor.workspaceRole === "OWNER";
  const data = await loadTodayCommandCenter(dataUserId);
  const [profile, integrationHealthModel, launchWizardModel] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: dataUserId },
      select: { createdAt: true },
    }),
    showIntegrationHealth
      ? loadPilotIntegrationHealthStripModelForWorkspace(dataUserId)
      : Promise.resolve(null),
    showLaunchWizardStrip ? loadLaunchWizardModel(dataUserId) : Promise.resolve(null),
  ]);
  const ownerBriefing = showOwnerBriefing
    ? await loadOwnerDailyBriefing(dataUserId, {
        showIntegrationHealth,
        today: data,
        persona,
        workspaceRole: actor.workspaceRole,
        supportAdmin,
        launchWizard: launchWizardModel
          ? {
              commercialBlockers: launchWizardModel.commercialBlockers,
              commercialSetup: launchWizardModel.commercialSetup,
            }
          : undefined,
      })
    : null;
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
        {launchWizardModel ? (
          <LaunchWizardTodayStrip
            model={launchWizardModel}
            briefingActive={Boolean(ownerBriefing)}
            rolePack={ownerBriefing?.rolePack ?? null}
          />
        ) : null}
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
