import { LIVE_CAPABLE_INTEGRATION_PROVIDERS } from "@/lib/channels/channel-registry";
import { resolveCommercialPilotOpsDecision } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { buildPilotIntegrationLiveProofRows } from "@/lib/integrations/pilot-integration-health-live-proof-era18";
import {
  buildLaunchWizardCommercialBlockersSlice,
  resolveLaunchWizardChannelLiveProofBlocked,
  resolveLaunchWizardSsoProofBlocked,
} from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import {
  buildLaunchWizardSteps,
  launchWizardHeadline,
  pickLaunchWizardNextStep,
  summarizeLaunchWizardProgress,
  type LaunchWizardSignals,
  type LaunchWizardStep,
} from "@/lib/launch-wizard/launch-wizard-era19";
import { LAUNCH_WIZARD_ERA19_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { connectedPilotChannelsPilotReady } from "@/lib/onboarding/getting-started-pilot-channel-live-proof-era18";
import {
  pickImplementationPilotReadinessAttentionItems,
  summarizeImplementationPilotReadiness,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import { resolveGoLivePilotReadinessTargetProject } from "@/lib/go-live/go-live-pilot-readiness-focus-era18";
import { prisma } from "@/lib/prisma";
import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
  ownerScopedAnd,
  productListWhereForOwner,
  storefrontSettingsListWhereForOwner,
  usageEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { loadCommercialPilotOpsStatusModel } from "@/services/commercial/commercial-pilot-ops-status-service";
import { listChannelPilotLiveProofSlices } from "@/services/developer/integration-health-service";
import { listProjects, workbenchSnapshot } from "@/services/go-live/go-live-service";
import { loadImplementationPilotReadinessModel } from "@/services/implementation/implementation-pilot-readiness-service";
import {
  buildLaunchWizardCommercialSetupSlice,
  mergeLaunchWizardCommercialBlockers,
  type LaunchWizardCommercialSetupSlice,
} from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
import type { LaunchWizardCommercialBlockersSlice } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import {
  buildLaunchWizardProductionGradeSnapshot,
  finalizeLaunchWizardStepsForProductionGrade,
  type LaunchWizardProductionGradeSnapshot,
} from "@/lib/launch-wizard/launch-wizard-production-grade-era20";
import { LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-production-grade-era20-policy";

export type LaunchWizardModel = {
  policyId: typeof LAUNCH_WIZARD_ERA19_POLICY_ID;
  productionGradePolicyId: typeof LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID;
  loadedAt: string;
  steps: LaunchWizardStep[];
  progress: ReturnType<typeof summarizeLaunchWizardProgress>;
  headline: string;
  nextStep: LaunchWizardStep | null;
  commercialBlockers: LaunchWizardCommercialBlockersSlice;
  commercialSetup: LaunchWizardCommercialSetupSlice;
  productionGrade: LaunchWizardProductionGradeSnapshot;
};

async function loadLaunchWizardContext(userId: string): Promise<{
  signals: LaunchWizardSignals;
  commercialOps: Awaited<ReturnType<typeof loadCommercialPilotOpsStatusModel>> | null;
  goLiveBlockers: import("@/lib/go-live/blocker-engine").LaunchBlocker[];
}> {
  const liveProviderFilter = {
    provider: { in: [...LIVE_CAPABLE_INTEGRATION_PROVIDERS] },
  };

  const [
    settings,
    activation,
    menuScope,
    productScope,
    storefrontScope,
    usageScope,
    connectionScope,
    pilotChannelSlices,
    pilotReadiness,
    commercialOps,
    goLiveProjects,
  ] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { businessName: true, businessType: true },
    }),
    prisma.activationState.findUnique({ where: { userId } }),
    menuListWhereForOwner(userId),
    productListWhereForOwner(userId),
    storefrontSettingsListWhereForOwner(userId),
    usageEventListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
    listChannelPilotLiveProofSlices(userId),
    loadImplementationPilotReadinessModel(userId),
    loadCommercialPilotOpsStatusModel().catch(() => null),
    listProjects(userId),
  ]);

  const productionPlanWhere = await ownerScopedAnd(userId, {});
  const [
    resolvedMenuCount,
    resolvedProductCount,
    resolvedStorefrontPublished,
    resolvedPosUseCount,
    resolvedProductionPlanCount,
    resolvedChannelConnectedCount,
    resolvedChannelErrorCount,
  ] = await Promise.all([
    prisma.menu.count({ where: menuScope }),
    prisma.product.count({ where: productScope }),
    prisma.storefrontSettings.count({
      where: { AND: [storefrontScope, { enabled: true, published: true }] },
    }),
    prisma.usageEvent.count({
      where: { AND: [usageScope, { eventName: "pos_first_use" }] },
    }),
    prisma.productionPlanTask.count({ where: productionPlanWhere }),
    prisma.integrationConnection.count({
      where: { AND: [connectionScope, liveProviderFilter, { status: "CONNECTED" }] },
    }),
    prisma.integrationConnection.count({
      where: { AND: [connectionScope, liveProviderFilter, { status: "ERROR" }] },
    }),
  ]);

  const primaryGoLive = resolveGoLivePilotReadinessTargetProject(goLiveProjects);
  const goLiveSnapshot = primaryGoLive
    ? await workbenchSnapshot(
        userId,
        primaryGoLive.id,
        primaryGoLive.businessType ?? null,
        primaryGoLive.status,
      )
    : null;

  const latestSimulation = primaryGoLive
    ? await prisma.goLiveSimulation.findFirst({
        where: { projectId: primaryGoLive.id, result: "PASS" },
        select: { id: true },
      })
    : null;

  const pilotAttentionItems = pickImplementationPilotReadinessAttentionItems(pilotReadiness);
  const pilotSummary = summarizeImplementationPilotReadiness(pilotAttentionItems);
  const liveProofRows = buildPilotIntegrationLiveProofRows(pilotReadiness.channelLiveProofSlices);
  const commercialDecision = commercialOps
    ? resolveCommercialPilotOpsDecision(commercialOps.goNoGo)
    : null;
  const p0Summary = commercialOps?.p0Staging.summary ?? null;
  const customerExecutionStatus =
    commercialOps?.goNoGo.summary?.customerExecutionStatus ?? null;

  const criticalBlockerCount =
    goLiveSnapshot?.validation?.blockers.filter(
      (blocker) => blocker.severity === "CRITICAL" || blocker.severity === "HIGH_RISK",
    ).length ?? 0;

  const approvalsPending = goLiveSnapshot
    ? Math.max(
        0,
        goLiveSnapshot.inputs.approvalsRequired - goLiveSnapshot.inputs.approvalsCount,
      )
    : 0;

  return {
    signals: {
    businessProfile: {
      businessName: settings?.businessName ?? null,
      businessType: settings?.businessType ?? null,
      settingsCompleted: Boolean(activation?.businessSettingsCompleted),
    },
    menuCatalog: {
      menuCount: resolvedMenuCount,
      productCount: resolvedProductCount,
      firstMenuCreated: Boolean(activation?.firstMenuCreated),
      firstProductCreated: Boolean(activation?.firstProductCreated),
    },
    storefront: {
      publishedCount: resolvedStorefrontPublished,
    },
    pos: {
      firstUse: resolvedPosUseCount > 0,
    },
    production: {
      firstProductionCompleted: Boolean(activation?.firstProductionCompleted),
      productionPlanCount: resolvedProductionPlanCount,
    },
    integrations: {
      connectedCount: resolvedChannelConnectedCount,
      errorCount: resolvedChannelErrorCount,
      pilotChannelsReady: connectedPilotChannelsPilotReady(pilotChannelSlices),
      liveProofIncompleteCount: liveProofRows.length,
    },
    goLive: {
      projectId: primaryGoLive?.id ?? null,
      criticalBlockerCount,
      simulationPassed: Boolean(latestSimulation),
      approvalsPending,
    },
    pilotReadiness: {
      workspaceAttentionCount: pilotSummary.totalSignals,
      hasUrgent: pilotSummary.hasUrgent,
      commercialDecision,
      p0Blocked: p0Summary?.p0ProofStatus !== "proof_passed",
      customerExecutionStatus,
      ssoProofBlocked: resolveLaunchWizardSsoProofBlocked(p0Summary),
      channelLiveProofBlocked: resolveLaunchWizardChannelLiveProofBlocked(p0Summary),
    },
    },
    commercialOps,
    goLiveBlockers: goLiveSnapshot?.validation?.blockers ?? [],
  };
}

export async function loadLaunchWizardModel(userId: string): Promise<LaunchWizardModel> {
  const { signals, commercialOps, goLiveBlockers } = await loadLaunchWizardContext(userId);
  const rawSteps = buildLaunchWizardSteps(signals);
  const steps = finalizeLaunchWizardStepsForProductionGrade(rawSteps);
  const progress = summarizeLaunchWizardProgress(steps);
  const nextStep = pickLaunchWizardNextStep(steps);
  const p0Summary = commercialOps?.p0Staging.summary ?? null;
  const baseCommercialBlockers = buildLaunchWizardCommercialBlockersSlice({
    commercialOps,
    p0Blocked: signals.pilotReadiness.p0Blocked,
    ssoProofBlocked: signals.pilotReadiness.ssoProofBlocked,
    channelLiveProofBlocked: signals.pilotReadiness.channelLiveProofBlocked,
  });
  const mergedBlockers = mergeLaunchWizardCommercialBlockers({
    baseBlockers: baseCommercialBlockers.blockers,
    goLiveBlockers,
  });
  const commercialBlockers: LaunchWizardCommercialBlockersSlice = {
    ...baseCommercialBlockers,
    blockers: mergedBlockers,
    headline:
      mergedBlockers.length > baseCommercialBlockers.blockers.length
        ? `${mergedBlockers.length} commercial and go-live blocker(s) — resolve before paid pilot traffic.`
        : baseCommercialBlockers.headline,
  };
  const commercialSetup = buildLaunchWizardCommercialSetupSlice({
    blockers: commercialBlockers.blockers,
  });

  const productionGrade = buildLaunchWizardProductionGradeSnapshot({
    steps,
    commercialBlockerCount: commercialBlockers.blockers.length,
    p0: p0Summary,
  });

  return {
    policyId: LAUNCH_WIZARD_ERA19_POLICY_ID,
    productionGradePolicyId: LAUNCH_WIZARD_PRODUCTION_GRADE_ERA20_POLICY_ID,
    loadedAt: new Date().toISOString(),
    steps,
    progress,
    headline: launchWizardHeadline(progress),
    nextStep,
    commercialBlockers,
    commercialSetup,
    productionGrade,
  };
}
