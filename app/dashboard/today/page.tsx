import { Suspense } from "react";

import { AiBriefingPanel } from "@/components/dashboard/ai-briefing-panel";
import { AiFeatureApiError } from "@/components/dashboard/ai-feature-api-error";
import { GettingStartedChecklist } from "@/components/dashboard/getting-started-checklist";
import { GettingStartedAttentionStrip } from "@/components/dashboard/getting-started-attention-strip";
import { PilotIntegrationHealthStrip } from "@/components/dashboard/pilot-integration-health-strip";
import { resolveTodayCommercialInflectionUiSlice } from "@/lib/commercial/commercial-pilot-ops-inflection-era28";
import { augmentPilotIntegrationHealthStripWithCommercialInflection } from "@/lib/integrations/pilot-integration-health-commercial-inflection-era28";
import { DemoModeGuidedPath } from "@/components/dashboard/demo-mode-guided-path";
import { OperatorTourLauncher } from "@/components/onboarding/operator-tour";
import { PlaybookTodayStrip } from "@/components/dashboard/playbooks/playbook-today-strip";
import { TodayCommandCenterView } from "@/components/dashboard/today-command-center";
import { LaunchWizardTodayStripSection } from "@/components/dashboard/today/launch-wizard-today-strip-section";
import { OwnerDailyBriefingHeroSection } from "@/components/dashboard/today/owner-daily-briefing-hero-section";
import { TodaySkeleton } from "@/components/dashboard/today-skeleton";
import {
  loadPilotIntegrationHealthStripModelForWorkspace,
  shouldShowPilotIntegrationHealthStrip,
} from "@/lib/integrations/pilot-integration-health-strip-era18";
import { resolveOperatorHomePersona } from "@/lib/navigation/operator-home-era18";
import { showInternalOpsDashboardUi } from "@/lib/ui/customer-facing-dashboard";
import { emptyTodayCommandCenterPayload } from "@/lib/dashboard/empty-today-command-center";
import { emptyGettingStartedPayload } from "@/lib/dashboard/empty-getting-started";
import { safeRequireWorkspacePermissionActor } from "@/lib/permissions/safe-workspace-permission-actor";
import { resolveOperatorSinceDate } from "@/lib/safety/null-reference-guards";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { TodayPageLoadError } from "@/components/dashboard/today-page-load-error";
import {
  MOBILE_TODAY_PAGE_CLASS,
  MOBILE_TODAY_SCROLL_BODY_CLASS,
} from "@/lib/design/mobile-today-scroll-policy";
import { canUseFullSupportInbox } from "@/lib/support/support-permissions";
import { prisma } from "@/lib/prisma";
import { loadGettingStartedStatus } from "@/services/onboarding/getting-started-status";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";
import { loadCommercialPilotOpsStatusModel } from "@/services/commercial/commercial-pilot-ops-status-service";
import { resolveOwnerDailyBriefingVisibility } from "@/services/briefing/owner-daily-briefing-service";
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
  const [profile, integrationHealthModel, commercialOps, kitchenDemoMode] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: dataUserId },
      select: { createdAt: true },
    }),
    showIntegrationHealth
      ? loadPilotIntegrationHealthStripModelForWorkspace(dataUserId).catch(() => null)
      : Promise.resolve(null),
    needsCommercialInflection ? loadCommercialPilotOpsStatusModel().catch(() => null) : Promise.resolve(null),
    prisma.kitchenSettings.findUnique({
      where: { userId: dataUserId },
      select: { demoMode: true },
    }),
  ]);
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
    resolveOperatorSinceDate(profile?.createdAt),
  ).catch((error) => {
    console.error("[today] getting started load failed", error);
    return emptyGettingStartedPayload();
  });
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
      <div className={MOBILE_TODAY_PAGE_CLASS}>
        <div className={MOBILE_TODAY_SCROLL_BODY_CLASS}>
        {kitchenDemoMode?.demoMode ? <DemoModeGuidedPath variant="card" /> : null}
        {todayLoadFailed ? <TodayPageLoadError /> : null}
        {integrationHealthStripModel && !showPilotOwnerBriefing ? (
          <PilotIntegrationHealthStrip model={integrationHealthStripModel} />
        ) : null}
        {gettingStarted.showChecklist &&
        !gettingStarted.allDone &&
        !showPilotOwnerBriefing ? (
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
        {showPilotOwnerBriefing ? (
          <Suspense fallback={<TodaySkeleton section="hero" />}>
            <OwnerDailyBriefingHeroSection
              dataUserId={dataUserId}
              showIntegrationHealth={showIntegrationHealth}
              today={data}
              persona={persona}
              workspaceRole={actor.workspaceRole}
              supportAdmin={supportAdmin}
              granted={actor.granted}
              workspaceId={workspaceId}
              internalOpsUi={internalOpsUi}
              integrationHealthStripModel={integrationHealthStripModel}
            />
          </Suspense>
        ) : null}
        {showLaunchWizardStrip ? (
          <Suspense fallback={<TodaySkeleton section="wizard" />}>
            <LaunchWizardTodayStripSection
              dataUserId={dataUserId}
              briefingActive={showPilotOwnerBriefing}
              persona={persona}
              workspaceRole={actor.workspaceRole}
              supportAdmin={supportAdmin}
            />
          </Suspense>
        ) : null}
        {gettingStarted.showChecklist && !gettingStarted.allDone && !showPilotOwnerBriefing ? (
          <GettingStartedChecklist data={gettingStarted} showAllSteps={showAllChecklistSteps} />
        ) : null}
        <TodayCommandCenterView
          userId={dataUserId}
          email={sessionUser.email ?? null}
          data={data}
          showFullMetrics={showFullMetrics}
          briefingActive={showPilotOwnerBriefing}
        />
        <Suspense fallback={<TodaySkeleton section="playbook" />}>
          <PlaybookTodayStrip
            userId={dataUserId}
            email={sessionUser.email ?? null}
            businessMode={data.settings?.businessType ?? null}
          />
        </Suspense>
        </div>
      </div>
    </>
  );
}
