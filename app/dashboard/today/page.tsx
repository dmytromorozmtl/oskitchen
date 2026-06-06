import { AiBriefingPanel } from "@/components/dashboard/ai-briefing-panel";
import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { GettingStartedChecklist } from "@/components/dashboard/getting-started-checklist";
import { GettingStartedAttentionStrip } from "@/components/dashboard/getting-started-attention-strip";
import { OwnerDailyBriefingHero } from "@/components/dashboard/owner-daily-briefing-hero";
import { OwnerDailyBriefingBreakthroughEra25Panel } from "@/components/dashboard/owner-daily-briefing-breakthrough-era25-panel";
import { buildOwnerDailyBriefingBreakthroughEra25UiSlice } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import { PilotIntegrationHealthStrip } from "@/components/dashboard/pilot-integration-health-strip";
import { resolveTodayCommercialInflectionUiSlice } from "@/lib/commercial/commercial-pilot-ops-inflection-era28";
import { augmentPilotIntegrationHealthStripWithCommercialInflection } from "@/lib/integrations/pilot-integration-health-commercial-inflection-era28";
import { OperatorTourLauncher } from "@/components/onboarding/operator-tour";
import { PlaybookTodayStrip } from "@/components/dashboard/playbooks/playbook-today-strip";
import { TodayCommandCenterView } from "@/components/dashboard/today-command-center";
import { LaunchWizardTodayStrip } from "@/components/dashboard/launch-wizard/launch-wizard-today-strip";
import {
  loadPilotIntegrationHealthStripModelForWorkspace,
  shouldShowPilotIntegrationHealthStrip,
} from "@/lib/integrations/pilot-integration-health-strip-era18";
import { resolveOperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import { showInternalOpsDashboardUi } from "@/lib/ui/customer-facing-dashboard";
import { emptyTodayCommandCenterPayload } from "@/lib/dashboard/empty-today-command-center";
import { safeRequireWorkspacePermissionActor } from "@/lib/permissions/safe-workspace-permission-actor";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { TodayPageLoadError } from "@/components/dashboard/today-page-load-error";
import { canUseFullSupportInbox } from "@/lib/support/support-permissions";
import { prisma } from "@/lib/prisma";
import { loadGettingStartedStatus } from "@/services/onboarding/getting-started-status";
import {
  loadOwnerDailyBriefing,
  resolveOwnerDailyBriefingVisibility,
} from "@/services/briefing/owner-daily-briefing-service";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";
import { loadLaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";
import { loadCommercialPilotOpsStatusModel } from "@/services/commercial/commercial-pilot-ops-status-service";
import { loadAiFeaturePage } from "@/lib/ai/load-ai-feature-page";
import { generateDailyBriefing } from "@/services/ai/ai-restaurant-brain";

/** PAGE_LAYOUT_EXCEPTION — Today command-center composite layout (DES-27). */

export const dynamic = "force-dynamic";

export default async function TodayOperationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ metrics?: string; checklist?: string }>;
}) {
  const [{ sessionUser, dataUserId, workspaceId }, actor] = await Promise.all([
    getTenantActor(),
    safeRequireWorkspacePermissionActor(),
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
  const internalOpsUi = showInternalOpsDashboardUi({ platformBypass: actor.platformBypass });
  const wantsOwnerBriefing = resolveOwnerDailyBriefingVisibility({
    workspaceRole: actor.workspaceRole,
    persona,
    granted: actor.granted,
    supportAdmin,
  });
  /** Pilot/engineering briefing (SSO smoke, P0 artifacts) — internal ops only. */
  const showPilotOwnerBriefing = wantsOwnerBriefing && internalOpsUi;
  const showLaunchWizardStrip = actor.workspaceRole === "OWNER";
  const needsCommercialInflection = showPilotOwnerBriefing && showIntegrationHealth;
  let todayLoadFailed = false;
  let data = emptyTodayCommandCenterPayload();
  try {
    data = await loadTodayCommandCenter(dataUserId);
  } catch (error) {
    todayLoadFailed = true;
    console.error("[today] loadTodayCommandCenter failed", error);
  }
  const [profile, integrationHealthModel, launchWizardModel, commercialOps] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: dataUserId },
      select: { createdAt: true },
    }),
    showIntegrationHealth
      ? loadPilotIntegrationHealthStripModelForWorkspace(dataUserId).catch(() => null)
      : Promise.resolve(null),
    showLaunchWizardStrip ? loadLaunchWizardModel(dataUserId).catch(() => null) : Promise.resolve(null),
    needsCommercialInflection ? loadCommercialPilotOpsStatusModel().catch(() => null) : Promise.resolve(null),
  ]);
  const ownerBriefing = showPilotOwnerBriefing
    ? await loadOwnerDailyBriefing(dataUserId, {
        showIntegrationHealth,
        today: data,
        persona,
        workspaceRole: actor.workspaceRole,
        supportAdmin,
        granted: actor.granted,
        workspaceId,
        launchWizard: launchWizardModel
          ? {
              commercialBlockers: launchWizardModel.commercialBlockers,
              commercialSetup: launchWizardModel.commercialSetup,
              nextStep: launchWizardModel.nextStep,
              progress: launchWizardModel.progress,
            }
          : undefined,
      }).catch((error) => {
        console.error("[today] owner briefing load failed", error);
        return null;
      })
    : null;
  let aiBriefing = null;
  let aiBriefingError: unknown = null;
  if (showPilotOwnerBriefing && workspaceId) {
    const briefingLoad = await loadAiFeaturePage(() => generateDailyBriefing(workspaceId));
    if (briefingLoad.ok) {
      aiBriefing = briefingLoad.data;
    } else {
      aiBriefingError = briefingLoad.error;
    }
  }
  const gettingStarted = await loadGettingStartedStatus(
    dataUserId,
    profile?.createdAt ?? new Date(),
  );
  let breakthroughEra25 = null;
  if (showPilotOwnerBriefing) {
    try {
      breakthroughEra25 = buildOwnerDailyBriefingBreakthroughEra25UiSlice({ blueprintVisible: true });
    } catch (error) {
      console.error("[today] breakthrough era25 slice failed", error);
    }
  }

  let commercialInflectionUiSlice = null;
  try {
    commercialInflectionUiSlice = commercialOps
      ? resolveTodayCommercialInflectionUiSlice(commercialOps)
      : null;
  } catch (error) {
    console.error("[today] commercial inflection slice failed", error);
  }
  const integrationHealthStripModel =
    integrationHealthModel && showPilotOwnerBriefing
      ? augmentPilotIntegrationHealthStripWithCommercialInflection(
          integrationHealthModel,
          commercialInflectionUiSlice,
        )
      : integrationHealthModel;

  return (
    <>
      <OperatorTourLauncher />
      <div className="space-y-6">
        {todayLoadFailed ? <TodayPageLoadError /> : null}
        {integrationHealthStripModel && !ownerBriefing?.showIntegrationHealthLane ? (
          <PilotIntegrationHealthStrip model={integrationHealthStripModel} />
        ) : null}
        {gettingStarted.showChecklist &&
        !gettingStarted.allDone &&
        !ownerBriefing ? (
          <GettingStartedAttentionStrip data={gettingStarted} />
        ) : null}
        {aiBriefingError ? (
          <AiFeatureApiError
            featureName="Today's AI Briefing"
            error={aiBriefingError}
            variant="inline"
          />
        ) : null}
        {aiBriefing ? <AiBriefingPanel briefing={aiBriefing} /> : null}
        {ownerBriefing ? <OwnerDailyBriefingHero briefing={ownerBriefing} /> : null}
        {breakthroughEra25 && internalOpsUi && !ownerBriefing?.pureOperationalModeEra25Active ? (
          <OwnerDailyBriefingBreakthroughEra25Panel slice={breakthroughEra25} />
        ) : null}
        {launchWizardModel ? (
          <LaunchWizardTodayStrip
            model={launchWizardModel}
            briefingActive={Boolean(ownerBriefing)}
            rolePack={ownerBriefing?.rolePack ?? null}
          />
        ) : null}
        {gettingStarted.showChecklist && !gettingStarted.allDone && !ownerBriefing ? (
          <GettingStartedChecklist data={gettingStarted} showAllSteps={showAllChecklistSteps} />
        ) : null}
        <TodayCommandCenterView
          userId={dataUserId}
          email={sessionUser.email ?? null}
          data={data}
          showFullMetrics={showFullMetrics}
          briefingActive={Boolean(ownerBriefing)}
        />
        <PlaybookTodayStrip
          userId={dataUserId}
          email={sessionUser.email ?? null}
          businessMode={data.settings?.businessType ?? null}
        />
      </div>
    </>
  );
}
