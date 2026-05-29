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
import {
  buildLaunchWizardCommercialInflectionSlice,
  type LaunchWizardCommercialInflectionSlice,
} from "@/lib/launch-wizard/launch-wizard-commercial-inflection-era28";
import {
  buildLaunchWizardCommercialGoClosureSlice,
  type LaunchWizardCommercialGoClosureSlice,
} from "@/lib/launch-wizard/launch-wizard-commercial-go-closure-era28";
import {
  buildLaunchWizardPilotWeek1Slice,
  type LaunchWizardPilotWeek1Slice,
} from "@/lib/launch-wizard/launch-wizard-pilot-week1-era28";
import {
  buildLaunchWizardMonth2Slice,
  type LaunchWizardMonth2Slice,
} from "@/lib/launch-wizard/launch-wizard-month2-era29";
import {
  buildLaunchWizardScaleSlice,
  type LaunchWizardScaleSlice,
} from "@/lib/launch-wizard/launch-wizard-scale-era30";
import {
  buildLaunchWizardSeriesASlice,
  type LaunchWizardSeriesASlice,
} from "@/lib/launch-wizard/launch-wizard-series-a-era31";
import {
  buildLaunchWizardMarketLeaderSlice,
  type LaunchWizardMarketLeaderSlice,
} from "@/lib/launch-wizard/launch-wizard-market-leader-era32";
import {
  buildLaunchWizardSustainedOpsSlice,
  type LaunchWizardSustainedOpsSlice,
} from "@/lib/launch-wizard/launch-wizard-sustained-ops-era33";
import {
  buildLaunchWizardImprovementLoopSlice,
  type LaunchWizardImprovementLoopSlice,
} from "@/lib/launch-wizard/launch-wizard-improvement-loop-era34";
import {
  buildLaunchWizardProductEvolutionSlice,
  type LaunchWizardProductEvolutionSlice,
} from "@/lib/launch-wizard/launch-wizard-product-evolution-era35";
import {
  buildLaunchWizardMaintenanceModeSlice,
  type LaunchWizardMaintenanceModeSlice,
} from "@/lib/launch-wizard/launch-wizard-maintenance-mode-era36";
import {
  buildLaunchWizardEngineeringTerminusSlice,
  type LaunchWizardEngineeringTerminusSlice,
} from "@/lib/launch-wizard/launch-wizard-engineering-terminus-era37";
import {
  buildLaunchWizardPostTerminusSteadyStateSlice,
  type LaunchWizardPostTerminusSteadyStateSlice,
} from "@/lib/launch-wizard/launch-wizard-post-terminus-steady-state-era38";
import {
  buildLaunchWizardCommercialPilotPathAbsoluteEndSlice,
  type LaunchWizardCommercialPilotPathAbsoluteEndSlice,
} from "@/lib/launch-wizard/launch-wizard-commercial-pilot-path-absolute-end-era39";
import {
  buildLaunchWizardLinearPathPermanentlyClosedSlice,
  type LaunchWizardLinearPathPermanentlyClosedSlice,
} from "@/lib/launch-wizard/launch-wizard-linear-path-permanently-closed-era40";
import type { LinearPathPermanentlyClosedUiSlice } from "@/lib/commercial/linear-path-permanently-closed-ui-era24";
import {
  buildLaunchWizardLinearChainTerminusGuardSlice,
  type LaunchWizardLinearChainTerminusGuardSlice,
} from "@/lib/launch-wizard/launch-wizard-linear-chain-terminus-guard-era41";
import {
  buildLaunchWizardEra25CharterExitSlice,
  type LaunchWizardEra25CharterExitSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-charter-exit-era42";
import type { Era25CharterExitUiSlice } from "@/lib/commercial/era25-charter-exit-ui-era24";
import type { Era25FirstCharterSliceReadinessUiSlice } from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";
import {
  buildLaunchWizardEra25FirstCharterSliceSlice,
  type LaunchWizardEra25FirstCharterSliceSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-first-charter-slice-era43";
import {
  buildLaunchWizardEra25EngineeringGatesSlice,
  type LaunchWizardEra25EngineeringGatesSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-engineering-gates-era44";
import {
  buildLaunchWizardEra25FirstProductSliceBlueprintSlice,
  type LaunchWizardEra25FirstProductSliceBlueprintSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-first-product-slice-blueprint-era45";
import type { Era25EngineeringGatesUiSlice } from "@/lib/commercial/era25-engineering-gates-ui-era24";
import type { Era25FirstProductSliceBlueprintUiSlice } from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";
import {
  buildLaunchWizardEra25OwnerDailyBriefingBreakthroughSlice,
  type LaunchWizardEra25OwnerDailyBriefingBreakthroughSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-owner-daily-briefing-breakthrough-era46";
import {
  buildLaunchWizardEra25PaidPilotGoConvergenceSlice,
  type LaunchWizardEra25PaidPilotGoConvergenceSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-paid-pilot-go-convergence-era47";
import {
  buildLaunchWizardEra25PilotWeek1ExecutionConvergenceSlice,
  type LaunchWizardEra25PilotWeek1ExecutionConvergenceSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-pilot-week1-execution-convergence-era48";
import {
  buildLaunchWizardEra25Month2MarketReadinessConvergenceSlice,
  type LaunchWizardEra25Month2MarketReadinessConvergenceSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-month2-market-readiness-convergence-era49";
import {
  buildLaunchWizardEra25ScaleReadinessConvergenceSlice,
  type LaunchWizardEra25ScaleReadinessConvergenceSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-scale-readiness-convergence-era50";
import {
  buildLaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice,
  type LaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-series-a-partner-expansion-convergence-era51";
import {
  buildLaunchWizardEra25MarketLeaderPositioningConvergenceSlice,
  type LaunchWizardEra25MarketLeaderPositioningConvergenceSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-market-leader-positioning-convergence-era52";
import {
  buildLaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice,
  type LaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-sustained-operational-excellence-convergence-era53";
import {
  buildLaunchWizardEra25PureOperationalModeTerminusSlice,
  type LaunchWizardEra25PureOperationalModeTerminusSlice,
} from "@/lib/launch-wizard/launch-wizard-era25-pure-operational-mode-terminus-era54";
import type { OwnerDailyBriefingBreakthroughEra25UiSlice } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import type { LinearChainTerminusGuardUiSlice } from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";
import {
  buildLaunchWizardTier2StatusSlice,
  type LaunchWizardTier2StatusSlice,
} from "@/lib/launch-wizard/launch-wizard-tier2-status-era21";
import {
  buildCommercialGoClosureUiSlice,
  type CommercialGoClosureUiSlice,
} from "@/lib/commercial/commercial-go-closure-ui-era21";
import {
  buildPilotWeek1ExecutionUiSlice,
  type PilotWeek1ExecutionUiSlice,
} from "@/lib/commercial/pilot-week1-execution-ui-era21";
import {
  buildMonth2MarketReadinessUiSlice,
  type Month2MarketReadinessUiSlice,
} from "@/lib/commercial/month2-market-readiness-ui-era21";
import {
  buildScaleReadinessUiSlice,
  type ScaleReadinessUiSlice,
} from "@/lib/commercial/scale-readiness-ui-era21";
import {
  buildSeriesAPartnerExpansionUiSlice,
  type SeriesAPartnerExpansionUiSlice,
} from "@/lib/commercial/series-a-partner-expansion-ui-era21";
import {
  buildMarketLeaderPositioningUiSlice,
  type MarketLeaderPositioningUiSlice,
} from "@/lib/commercial/market-leader-positioning-ui-era21";
import {
  buildSustainedOperationalExcellenceUiSlice,
  type SustainedOperationalExcellenceUiSlice,
} from "@/lib/commercial/sustained-operational-excellence-ui-era21";
import {
  buildContinuousImprovementLoopUiSlice,
  type ContinuousImprovementLoopUiSlice,
} from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import {
  buildSustainedProductEvolutionUiSlice,
  type SustainedProductEvolutionUiSlice,
} from "@/lib/commercial/sustained-product-evolution-ui-era23";
import {
  buildMaintenanceModeUiSlice,
  type MaintenanceModeUiSlice,
} from "@/lib/commercial/maintenance-mode-ui-era24";
import {
  buildEngineeringPathTerminusUiSlice,
  type EngineeringPathTerminusUiSlice,
} from "@/lib/commercial/engineering-path-terminus-ui-era24";
import {
  buildPostTerminusSteadyStateUiSlice,
  type PostTerminusSteadyStateUiSlice,
} from "@/lib/commercial/post-terminus-steady-state-ui-era24";
import {
  buildCommercialPilotPathAbsoluteEndUiSlice,
  type CommercialPilotPathAbsoluteEndUiSlice,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";
import {
  buildPaidPilotGoConvergenceEra25UiSlice,
  type PaidPilotGoConvergenceEra25UiSlice,
} from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import {
  buildPilotWeek1ExecutionConvergenceEra25UiSlice,
  type PilotWeek1ExecutionConvergenceEra25UiSlice,
} from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";
import {
  buildMonth2MarketReadinessConvergenceEra25UiSlice,
  type Month2MarketReadinessConvergenceEra25UiSlice,
} from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";
import {
  buildScaleReadinessConvergenceEra25UiSlice,
  type ScaleReadinessConvergenceEra25UiSlice,
} from "@/lib/commercial/scale-readiness-convergence-ui-era25";
import type { SeriesAPartnerExpansionConvergenceEra25UiSlice } from "@/lib/commercial/series-a-partner-expansion-convergence-ui-era25";
import type { MarketLeaderPositioningConvergenceEra25UiSlice } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";
import type { SustainedOperationalExcellenceConvergenceEra25UiSlice } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import { readMonth2MarketReadinessArtifacts } from "@/scripts/ops/validate-month2-market-readiness-env";
import { readScaleReadinessArtifacts } from "@/scripts/ops/validate-scale-readiness-env";
import { readSeriesAPartnerExpansionArtifacts } from "@/scripts/ops/validate-series-a-partner-expansion-env";
import { readMarketLeaderPositioningArtifacts } from "@/scripts/ops/validate-market-leader-positioning-env";
import { readSustainedOperationalExcellenceArtifacts } from "@/scripts/ops/validate-sustained-operational-excellence-env";
import { readContinuousImprovementLoopArtifacts } from "@/scripts/ops/validate-continuous-improvement-loop";

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
  tier2Status: LaunchWizardTier2StatusSlice;
  commercialInflection: LaunchWizardCommercialInflectionSlice | null;
  commercialGoClosure: CommercialGoClosureUiSlice | null;
  commercialGoClosureIntegrity: LaunchWizardCommercialGoClosureSlice | null;
  pilotWeek1: PilotWeek1ExecutionUiSlice | null;
  pilotWeek1Integrity: LaunchWizardPilotWeek1Slice | null;
  month2MarketReadiness: Month2MarketReadinessUiSlice | null;
  month2MarketReadinessIntegrity: LaunchWizardMonth2Slice | null;
  scaleReadiness: ScaleReadinessUiSlice | null;
  scaleReadinessIntegrity: LaunchWizardScaleSlice | null;
  seriesAPartnerExpansion: SeriesAPartnerExpansionUiSlice | null;
  seriesAPartnerExpansionIntegrity: LaunchWizardSeriesASlice | null;
  marketLeaderPositioning: MarketLeaderPositioningUiSlice | null;
  marketLeaderPositioningIntegrity: LaunchWizardMarketLeaderSlice | null;
  sustainedOperationalExcellence: SustainedOperationalExcellenceUiSlice | null;
  sustainedOperationalExcellenceIntegrity: LaunchWizardSustainedOpsSlice | null;
  continuousImprovementLoop: ContinuousImprovementLoopUiSlice | null;
  continuousImprovementLoopIntegrity: LaunchWizardImprovementLoopSlice | null;
  sustainedProductEvolution: SustainedProductEvolutionUiSlice | null;
  sustainedProductEvolutionIntegrity: LaunchWizardProductEvolutionSlice | null;
  maintenanceMode: MaintenanceModeUiSlice | null;
  maintenanceModeIntegrity: LaunchWizardMaintenanceModeSlice | null;
  engineeringPathTerminus: EngineeringPathTerminusUiSlice | null;
  engineeringPathTerminusIntegrity: LaunchWizardEngineeringTerminusSlice | null;
  postTerminusSteadyState: PostTerminusSteadyStateUiSlice | null;
  postTerminusSteadyStateIntegrity: LaunchWizardPostTerminusSteadyStateSlice | null;
  commercialPilotPathAbsoluteEnd: CommercialPilotPathAbsoluteEndUiSlice | null;
  commercialPilotPathAbsoluteEndIntegrity: LaunchWizardCommercialPilotPathAbsoluteEndSlice | null;
  linearPathPermanentlyClosed: LinearPathPermanentlyClosedUiSlice | null;
  linearPathPermanentlyClosedIntegrity: LaunchWizardLinearPathPermanentlyClosedSlice | null;
  linearChainTerminusGuard: import("@/lib/commercial/linear-chain-terminus-guard-ui-era24").LinearChainTerminusGuardUiSlice | null;
  linearChainTerminusGuardIntegrity: LaunchWizardLinearChainTerminusGuardSlice | null;
  era25CharterExit: Era25CharterExitUiSlice | null;
  era25CharterExitIntegrity: LaunchWizardEra25CharterExitSlice | null;
  era25FirstCharterSliceReadiness: Era25FirstCharterSliceReadinessUiSlice | null;
  era25FirstCharterSliceReadinessIntegrity: LaunchWizardEra25FirstCharterSliceSlice | null;
  era25EngineeringGates: Era25EngineeringGatesUiSlice | null;
  era25EngineeringGatesIntegrity: LaunchWizardEra25EngineeringGatesSlice | null;
  era25FirstProductSliceBlueprint: Era25FirstProductSliceBlueprintUiSlice | null;
  era25FirstProductSliceBlueprintIntegrity: LaunchWizardEra25FirstProductSliceBlueprintSlice | null;
  era25OwnerDailyBriefingBreakthrough: OwnerDailyBriefingBreakthroughEra25UiSlice | null;
  era25OwnerDailyBriefingBreakthroughIntegrity: LaunchWizardEra25OwnerDailyBriefingBreakthroughSlice | null;
  paidPilotGoConvergence: PaidPilotGoConvergenceEra25UiSlice | null;
  era25PaidPilotGoConvergenceIntegrity: LaunchWizardEra25PaidPilotGoConvergenceSlice | null;
  era25PilotWeek1ExecutionConvergence: PilotWeek1ExecutionConvergenceEra25UiSlice | null;
  era25PilotWeek1ExecutionConvergenceIntegrity: LaunchWizardEra25PilotWeek1ExecutionConvergenceSlice | null;
  era25Month2MarketReadinessConvergence: Month2MarketReadinessConvergenceEra25UiSlice | null;
  era25Month2MarketReadinessConvergenceIntegrity: LaunchWizardEra25Month2MarketReadinessConvergenceSlice | null;
  era25ScaleReadinessConvergence: ScaleReadinessConvergenceEra25UiSlice | null;
  era25ScaleReadinessConvergenceIntegrity: LaunchWizardEra25ScaleReadinessConvergenceSlice | null;
  era25SeriesAPartnerExpansionConvergence: SeriesAPartnerExpansionConvergenceEra25UiSlice | null;
  era25SeriesAPartnerExpansionConvergenceIntegrity: LaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice | null;
  era25MarketLeaderPositioningConvergence: MarketLeaderPositioningConvergenceEra25UiSlice | null;
  era25MarketLeaderPositioningConvergenceIntegrity: LaunchWizardEra25MarketLeaderPositioningConvergenceSlice | null;
  era25SustainedOperationalExcellenceConvergence: SustainedOperationalExcellenceConvergenceEra25UiSlice | null;
  era25SustainedOperationalExcellenceConvergenceIntegrity: LaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice | null;
  era25PureOperationalModeTerminusIntegrity: LaunchWizardEra25PureOperationalModeTerminusSlice | null;
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

  const tier2Status = buildLaunchWizardTier2StatusSlice({
    tier2Summary: commercialOps?.tier2Staging.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
  });

  const commercialGoClosure = buildCommercialGoClosureUiSlice({
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
  });
  const pilotWeek1 = buildPilotWeek1ExecutionUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    metricsBaseline: null,
    caseStudyDraft: null,
  });
  const month2Artifacts = readMonth2MarketReadinessArtifacts();
  const month2MarketReadiness = buildMonth2MarketReadinessUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    metricsBaseline: month2Artifacts.metricsBaseline,
    caseStudyDraft: month2Artifacts.caseStudyDraft,
    investorOnepager: month2Artifacts.investorOnepager,
  });
  const scaleArtifacts = readScaleReadinessArtifacts();
  const scaleReadiness = buildScaleReadinessUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging: scaleArtifacts.p0Staging ?? p0Summary,
    tier2Summary: scaleArtifacts.tier2Summary ?? commercialOps?.tier2Staging.summary ?? null,
    metricsBaseline: scaleArtifacts.metricsBaseline ?? month2Artifacts.metricsBaseline,
    caseStudyDraft: scaleArtifacts.caseStudyDraft ?? month2Artifacts.caseStudyDraft,
    investorOnepager: scaleArtifacts.investorOnepager ?? month2Artifacts.investorOnepager,
    rollbackDrill: scaleArtifacts.rollbackDrill,
  });
  const seriesAArtifacts = readSeriesAPartnerExpansionArtifacts();
  const seriesAPartnerExpansion = buildSeriesAPartnerExpansionUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging: seriesAArtifacts.p0Staging ?? scaleArtifacts.p0Staging ?? p0Summary,
    tier2Summary:
      seriesAArtifacts.tier2Summary ?? scaleArtifacts.tier2Summary ?? commercialOps?.tier2Staging.summary ?? null,
    metricsBaseline:
      seriesAArtifacts.metricsBaseline ?? scaleArtifacts.metricsBaseline ?? month2Artifacts.metricsBaseline,
    caseStudyDraft:
      seriesAArtifacts.caseStudyDraft ?? scaleArtifacts.caseStudyDraft ?? month2Artifacts.caseStudyDraft,
    investorOnepager:
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill: seriesAArtifacts.rollbackDrill ?? scaleArtifacts.rollbackDrill,
    competitorMatrix: seriesAArtifacts.competitorMatrix,
  });
  const marketLeaderArtifacts = readMarketLeaderPositioningArtifacts();
  const marketLeaderPositioning = buildMarketLeaderPositioningUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      marketLeaderArtifacts.p0Staging ?? seriesAArtifacts.p0Staging ?? scaleArtifacts.p0Staging ?? p0Summary,
    tier2Summary:
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      marketLeaderArtifacts.rollbackDrill ?? seriesAArtifacts.rollbackDrill ?? scaleArtifacts.rollbackDrill,
    competitorMatrix:
      marketLeaderArtifacts.competitorMatrix ?? seriesAArtifacts.competitorMatrix,
  });
  const sustainedOpsArtifacts = readSustainedOperationalExcellenceArtifacts();
  const sustainedOperationalExcellence = buildSustainedOperationalExcellenceUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0Staging:
      sustainedOpsArtifacts.p0Staging ??
      marketLeaderArtifacts.p0Staging ??
      seriesAArtifacts.p0Staging ??
      scaleArtifacts.p0Staging ??
      p0Summary,
    tier2Summary:
      sustainedOpsArtifacts.tier2Summary ??
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      sustainedOpsArtifacts.metricsBaseline ??
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      sustainedOpsArtifacts.caseStudyDraft ??
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      sustainedOpsArtifacts.investorOnepager ??
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      sustainedOpsArtifacts.rollbackDrill ??
      marketLeaderArtifacts.rollbackDrill ??
      seriesAArtifacts.rollbackDrill ??
      scaleArtifacts.rollbackDrill,
    competitorMatrix:
      sustainedOpsArtifacts.competitorMatrix ??
      marketLeaderArtifacts.competitorMatrix ??
      seriesAArtifacts.competitorMatrix,
  });
  const loopArtifacts = readContinuousImprovementLoopArtifacts();
  const continuousImprovementLoop = buildContinuousImprovementLoopUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      loopArtifacts.p0Staging ??
      sustainedOpsArtifacts.p0Staging ??
      marketLeaderArtifacts.p0Staging ??
      seriesAArtifacts.p0Staging ??
      scaleArtifacts.p0Staging ??
      p0Summary,
    tier2Summary:
      loopArtifacts.tier2Summary ??
      sustainedOpsArtifacts.tier2Summary ??
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      loopArtifacts.metricsBaseline ??
      sustainedOpsArtifacts.metricsBaseline ??
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      loopArtifacts.caseStudyDraft ??
      sustainedOpsArtifacts.caseStudyDraft ??
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      loopArtifacts.investorOnepager ??
      sustainedOpsArtifacts.investorOnepager ??
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      loopArtifacts.rollbackDrill ??
      sustainedOpsArtifacts.rollbackDrill ??
      marketLeaderArtifacts.rollbackDrill ??
      seriesAArtifacts.rollbackDrill ??
      scaleArtifacts.rollbackDrill,
    competitorMatrix:
      loopArtifacts.competitorMatrix ??
      sustainedOpsArtifacts.competitorMatrix ??
      marketLeaderArtifacts.competitorMatrix ??
      seriesAArtifacts.competitorMatrix,
  });
  const sustainedProductEvolution = buildSustainedProductEvolutionUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      loopArtifacts.p0Staging ??
      sustainedOpsArtifacts.p0Staging ??
      marketLeaderArtifacts.p0Staging ??
      seriesAArtifacts.p0Staging ??
      scaleArtifacts.p0Staging ??
      p0Summary,
    tier2Summary:
      loopArtifacts.tier2Summary ??
      sustainedOpsArtifacts.tier2Summary ??
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      loopArtifacts.metricsBaseline ??
      sustainedOpsArtifacts.metricsBaseline ??
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      loopArtifacts.caseStudyDraft ??
      sustainedOpsArtifacts.caseStudyDraft ??
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      loopArtifacts.investorOnepager ??
      sustainedOpsArtifacts.investorOnepager ??
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      loopArtifacts.rollbackDrill ??
      sustainedOpsArtifacts.rollbackDrill ??
      marketLeaderArtifacts.rollbackDrill ??
      seriesAArtifacts.rollbackDrill ??
      scaleArtifacts.rollbackDrill,
    competitorMatrix:
      loopArtifacts.competitorMatrix ??
      sustainedOpsArtifacts.competitorMatrix ??
      marketLeaderArtifacts.competitorMatrix ??
      seriesAArtifacts.competitorMatrix,
  });
  const maintenanceMode = buildMaintenanceModeUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      loopArtifacts.p0Staging ??
      sustainedOpsArtifacts.p0Staging ??
      marketLeaderArtifacts.p0Staging ??
      seriesAArtifacts.p0Staging ??
      scaleArtifacts.p0Staging ??
      p0Summary,
    tier2Summary:
      loopArtifacts.tier2Summary ??
      sustainedOpsArtifacts.tier2Summary ??
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      loopArtifacts.metricsBaseline ??
      sustainedOpsArtifacts.metricsBaseline ??
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      loopArtifacts.caseStudyDraft ??
      sustainedOpsArtifacts.caseStudyDraft ??
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      loopArtifacts.investorOnepager ??
      sustainedOpsArtifacts.investorOnepager ??
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      loopArtifacts.rollbackDrill ??
      sustainedOpsArtifacts.rollbackDrill ??
      marketLeaderArtifacts.rollbackDrill ??
      seriesAArtifacts.rollbackDrill ??
      scaleArtifacts.rollbackDrill,
    competitorMatrix:
      loopArtifacts.competitorMatrix ??
      sustainedOpsArtifacts.competitorMatrix ??
      marketLeaderArtifacts.competitorMatrix ??
      seriesAArtifacts.competitorMatrix,
  });

  const commercialInflection = buildLaunchWizardCommercialInflectionSlice();
  const commercialGoClosureIntegrity =
    buildLaunchWizardCommercialGoClosureSlice(commercialGoClosure);
  const pilotWeek1Integrity = buildLaunchWizardPilotWeek1Slice(pilotWeek1);
  const month2MarketReadinessIntegrity = buildLaunchWizardMonth2Slice(month2MarketReadiness);
  const scaleReadinessIntegrity = buildLaunchWizardScaleSlice(scaleReadiness);
  const seriesAPartnerExpansionIntegrity = buildLaunchWizardSeriesASlice(seriesAPartnerExpansion);
  const marketLeaderPositioningIntegrity = buildLaunchWizardMarketLeaderSlice(
    marketLeaderPositioning,
  );
  const sustainedOperationalExcellenceIntegrity = buildLaunchWizardSustainedOpsSlice(
    sustainedOperationalExcellence,
  );
  const continuousImprovementLoopIntegrity = buildLaunchWizardImprovementLoopSlice(
    continuousImprovementLoop,
  );
  const sustainedProductEvolutionIntegrity = buildLaunchWizardProductEvolutionSlice(
    sustainedProductEvolution,
  );
  const maintenanceModeIntegrity = buildLaunchWizardMaintenanceModeSlice(maintenanceMode);
  const engineeringPathTerminus = buildEngineeringPathTerminusUiSlice({
    goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
    p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
    tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    p0Staging:
      loopArtifacts.p0Staging ??
      sustainedOpsArtifacts.p0Staging ??
      marketLeaderArtifacts.p0Staging ??
      seriesAArtifacts.p0Staging ??
      scaleArtifacts.p0Staging ??
      p0Summary,
    tier2Summary:
      loopArtifacts.tier2Summary ??
      sustainedOpsArtifacts.tier2Summary ??
      marketLeaderArtifacts.tier2Summary ??
      seriesAArtifacts.tier2Summary ??
      scaleArtifacts.tier2Summary ??
      commercialOps?.tier2Staging.summary ??
      null,
    metricsBaseline:
      loopArtifacts.metricsBaseline ??
      sustainedOpsArtifacts.metricsBaseline ??
      marketLeaderArtifacts.metricsBaseline ??
      seriesAArtifacts.metricsBaseline ??
      scaleArtifacts.metricsBaseline ??
      month2Artifacts.metricsBaseline,
    caseStudyDraft:
      loopArtifacts.caseStudyDraft ??
      sustainedOpsArtifacts.caseStudyDraft ??
      marketLeaderArtifacts.caseStudyDraft ??
      seriesAArtifacts.caseStudyDraft ??
      scaleArtifacts.caseStudyDraft ??
      month2Artifacts.caseStudyDraft,
    investorOnepager:
      loopArtifacts.investorOnepager ??
      sustainedOpsArtifacts.investorOnepager ??
      marketLeaderArtifacts.investorOnepager ??
      seriesAArtifacts.investorOnepager ??
      scaleArtifacts.investorOnepager ??
      month2Artifacts.investorOnepager,
    rollbackDrill:
      loopArtifacts.rollbackDrill ??
      sustainedOpsArtifacts.rollbackDrill ??
      marketLeaderArtifacts.rollbackDrill ??
      seriesAArtifacts.rollbackDrill ??
      scaleArtifacts.rollbackDrill,
    competitorMatrix:
      loopArtifacts.competitorMatrix ??
      sustainedOpsArtifacts.competitorMatrix ??
      marketLeaderArtifacts.competitorMatrix ??
      seriesAArtifacts.competitorMatrix,
    maintenanceModeActive: maintenanceMode?.maintenanceModeActive ?? false,
  });
  const engineeringPathTerminusIntegrity = buildLaunchWizardEngineeringTerminusSlice(
    engineeringPathTerminus,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const postTerminusSteadyState =
    engineeringPathTerminus?.postTerminusSteadyState ??
    buildPostTerminusSteadyStateUiSlice({
      engineeringTerminusActive: maintenanceMode?.maintenanceModeActive ?? false,
      goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
      p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
      tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
      p0Staging:
        loopArtifacts.p0Staging ??
        sustainedOpsArtifacts.p0Staging ??
        marketLeaderArtifacts.p0Staging ??
        seriesAArtifacts.p0Staging ??
        scaleArtifacts.p0Staging ??
        p0Summary,
      tier2Summary:
        loopArtifacts.tier2Summary ??
        sustainedOpsArtifacts.tier2Summary ??
        marketLeaderArtifacts.tier2Summary ??
        seriesAArtifacts.tier2Summary ??
        scaleArtifacts.tier2Summary ??
        commercialOps?.tier2Staging.summary ??
        null,
      metricsBaseline:
        loopArtifacts.metricsBaseline ??
        sustainedOpsArtifacts.metricsBaseline ??
        marketLeaderArtifacts.metricsBaseline ??
        seriesAArtifacts.metricsBaseline ??
        scaleArtifacts.metricsBaseline ??
        month2Artifacts.metricsBaseline,
      caseStudyDraft:
        loopArtifacts.caseStudyDraft ??
        sustainedOpsArtifacts.caseStudyDraft ??
        marketLeaderArtifacts.caseStudyDraft ??
        seriesAArtifacts.caseStudyDraft ??
        scaleArtifacts.caseStudyDraft ??
        month2Artifacts.caseStudyDraft,
      investorOnepager:
        loopArtifacts.investorOnepager ??
        sustainedOpsArtifacts.investorOnepager ??
        marketLeaderArtifacts.investorOnepager ??
        seriesAArtifacts.investorOnepager ??
        scaleArtifacts.investorOnepager ??
        month2Artifacts.investorOnepager,
      rollbackDrill:
        loopArtifacts.rollbackDrill ??
        sustainedOpsArtifacts.rollbackDrill ??
        marketLeaderArtifacts.rollbackDrill ??
        seriesAArtifacts.rollbackDrill ??
        scaleArtifacts.rollbackDrill,
      competitorMatrix:
        loopArtifacts.competitorMatrix ??
        sustainedOpsArtifacts.competitorMatrix ??
        marketLeaderArtifacts.competitorMatrix ??
        seriesAArtifacts.competitorMatrix,
    });
  const postTerminusSteadyStateIntegrity = buildLaunchWizardPostTerminusSteadyStateSlice(
    postTerminusSteadyState,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const commercialPilotPathAbsoluteEnd =
    postTerminusSteadyState?.absolutePathEnd ??
    buildCommercialPilotPathAbsoluteEndUiSlice({
      steadyStateActive: postTerminusSteadyState?.steadyStateActive ?? false,
      goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
      p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
      tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
      p0Staging:
        loopArtifacts.p0Staging ??
        sustainedOpsArtifacts.p0Staging ??
        marketLeaderArtifacts.p0Staging ??
        seriesAArtifacts.p0Staging ??
        scaleArtifacts.p0Staging ??
        p0Summary,
      tier2Summary:
        loopArtifacts.tier2Summary ??
        sustainedOpsArtifacts.tier2Summary ??
        marketLeaderArtifacts.tier2Summary ??
        seriesAArtifacts.tier2Summary ??
        scaleArtifacts.tier2Summary ??
        commercialOps?.tier2Staging.summary ??
        null,
      metricsBaseline:
        loopArtifacts.metricsBaseline ??
        sustainedOpsArtifacts.metricsBaseline ??
        marketLeaderArtifacts.metricsBaseline ??
        seriesAArtifacts.metricsBaseline ??
        scaleArtifacts.metricsBaseline ??
        month2Artifacts.metricsBaseline,
      caseStudyDraft:
        loopArtifacts.caseStudyDraft ??
        sustainedOpsArtifacts.caseStudyDraft ??
        marketLeaderArtifacts.caseStudyDraft ??
        seriesAArtifacts.caseStudyDraft ??
        scaleArtifacts.caseStudyDraft ??
        month2Artifacts.caseStudyDraft,
      investorOnepager:
        loopArtifacts.investorOnepager ??
        sustainedOpsArtifacts.investorOnepager ??
        marketLeaderArtifacts.investorOnepager ??
        seriesAArtifacts.investorOnepager ??
        scaleArtifacts.investorOnepager ??
        month2Artifacts.investorOnepager,
      rollbackDrill:
        loopArtifacts.rollbackDrill ??
        sustainedOpsArtifacts.rollbackDrill ??
        marketLeaderArtifacts.rollbackDrill ??
        seriesAArtifacts.rollbackDrill ??
        scaleArtifacts.rollbackDrill,
      competitorMatrix:
        loopArtifacts.competitorMatrix ??
        sustainedOpsArtifacts.competitorMatrix ??
        marketLeaderArtifacts.competitorMatrix ??
        seriesAArtifacts.competitorMatrix,
    });
  const commercialPilotPathAbsoluteEndIntegrity = buildLaunchWizardCommercialPilotPathAbsoluteEndSlice(
    commercialPilotPathAbsoluteEnd,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const linearPathPermanentlyClosed =
    commercialPilotPathAbsoluteEnd?.linearPathPermanentlyClosed ?? null;
  const linearPathPermanentlyClosedIntegrity = buildLaunchWizardLinearPathPermanentlyClosedSlice(
    linearPathPermanentlyClosed,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const linearChainTerminusGuard =
    commercialPilotPathAbsoluteEnd?.linearPathPermanentlyClosed?.step17Forbidden ?? null;
  const linearChainTerminusGuardIntegrity = buildLaunchWizardLinearChainTerminusGuardSlice(
    linearChainTerminusGuard,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const era25CharterExit = linearChainTerminusGuard?.era25CharterExit ?? null;
  const era25CharterExitIntegrity = buildLaunchWizardEra25CharterExitSlice(
    era25CharterExit,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const era25FirstCharterSliceReadiness = era25CharterExit?.firstCharterSliceReadiness ?? null;
  const era25FirstCharterSliceReadinessIntegrity = buildLaunchWizardEra25FirstCharterSliceSlice(
    era25FirstCharterSliceReadiness,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const era25EngineeringGates =
    era25FirstCharterSliceReadiness?.engineeringGates ?? null;
  const era25EngineeringGatesIntegrity = buildLaunchWizardEra25EngineeringGatesSlice(
    era25EngineeringGates,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const era25FirstProductSliceBlueprint =
    era25EngineeringGates?.firstProductSliceBlueprint ?? null;
  const era25FirstProductSliceBlueprintIntegrity =
    buildLaunchWizardEra25FirstProductSliceBlueprintSlice(
      era25FirstProductSliceBlueprint,
      commercialOps?.goNoGo.summary?.customerName ?? null,
    );
  const era25OwnerDailyBriefingBreakthrough =
    era25FirstProductSliceBlueprint?.ownerDailyBriefingBreakthrough ?? null;
  const era25OwnerDailyBriefingBreakthroughIntegrity =
    buildLaunchWizardEra25OwnerDailyBriefingBreakthroughSlice(
      era25OwnerDailyBriefingBreakthrough,
      commercialOps?.goNoGo.summary?.customerName ?? null,
    );
  const paidPilotGoConvergence =
    era25OwnerDailyBriefingBreakthrough?.paidPilotGoConvergence ??
    buildPaidPilotGoConvergenceEra25UiSlice({
      breakthroughVisible: false,
      goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
      p0Staging:
        loopArtifacts.p0Staging ??
        sustainedOpsArtifacts.p0Staging ??
        marketLeaderArtifacts.p0Staging ??
        seriesAArtifacts.p0Staging ??
        scaleArtifacts.p0Staging ??
        p0Summary,
      tier2Summary:
        loopArtifacts.tier2Summary ??
        sustainedOpsArtifacts.tier2Summary ??
        marketLeaderArtifacts.tier2Summary ??
        seriesAArtifacts.tier2Summary ??
        commercialOps?.tier2Staging.summary ??
        null,
      metricsBaseline:
        loopArtifacts.metricsBaseline ??
        sustainedOpsArtifacts.metricsBaseline ??
        marketLeaderArtifacts.metricsBaseline ??
        seriesAArtifacts.metricsBaseline ??
        scaleArtifacts.metricsBaseline ??
        month2Artifacts.metricsBaseline,
      caseStudyDraft:
        loopArtifacts.caseStudyDraft ??
        sustainedOpsArtifacts.caseStudyDraft ??
        marketLeaderArtifacts.caseStudyDraft ??
        seriesAArtifacts.caseStudyDraft ??
        scaleArtifacts.caseStudyDraft ??
        month2Artifacts.caseStudyDraft,
      investorOnepager:
        loopArtifacts.investorOnepager ??
        sustainedOpsArtifacts.investorOnepager ??
        marketLeaderArtifacts.investorOnepager ??
        seriesAArtifacts.investorOnepager ??
        scaleArtifacts.investorOnepager ??
        month2Artifacts.investorOnepager,
      rollbackDrill:
        loopArtifacts.rollbackDrill ??
        sustainedOpsArtifacts.rollbackDrill ??
        marketLeaderArtifacts.rollbackDrill ??
        seriesAArtifacts.rollbackDrill ??
        scaleArtifacts.rollbackDrill,
      competitorMatrix:
        loopArtifacts.competitorMatrix ??
        sustainedOpsArtifacts.competitorMatrix ??
        marketLeaderArtifacts.competitorMatrix ??
        seriesAArtifacts.competitorMatrix,
      p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
      tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    });
  const era25PaidPilotGoConvergenceIntegrity = buildLaunchWizardEra25PaidPilotGoConvergenceSlice(
    paidPilotGoConvergence,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const era25PilotWeek1ExecutionConvergence =
    paidPilotGoConvergence?.pilotWeek1ExecutionConvergence ??
    buildPilotWeek1ExecutionConvergenceEra25UiSlice({
      goConvergenceVisible: false,
      goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
      p0Staging:
        loopArtifacts.p0Staging ??
        sustainedOpsArtifacts.p0Staging ??
        marketLeaderArtifacts.p0Staging ??
        seriesAArtifacts.p0Staging ??
        scaleArtifacts.p0Staging ??
        p0Summary,
      tier2Summary:
        loopArtifacts.tier2Summary ??
        sustainedOpsArtifacts.tier2Summary ??
        marketLeaderArtifacts.tier2Summary ??
        seriesAArtifacts.tier2Summary ??
        commercialOps?.tier2Staging.summary ??
        null,
      metricsBaseline:
        loopArtifacts.metricsBaseline ??
        sustainedOpsArtifacts.metricsBaseline ??
        marketLeaderArtifacts.metricsBaseline ??
        seriesAArtifacts.metricsBaseline ??
        scaleArtifacts.metricsBaseline ??
        month2Artifacts.metricsBaseline,
      caseStudyDraft:
        loopArtifacts.caseStudyDraft ??
        sustainedOpsArtifacts.caseStudyDraft ??
        marketLeaderArtifacts.caseStudyDraft ??
        seriesAArtifacts.caseStudyDraft ??
        scaleArtifacts.caseStudyDraft ??
        month2Artifacts.caseStudyDraft,
      investorOnepager:
        loopArtifacts.investorOnepager ??
        sustainedOpsArtifacts.investorOnepager ??
        marketLeaderArtifacts.investorOnepager ??
        seriesAArtifacts.investorOnepager ??
        scaleArtifacts.investorOnepager ??
        month2Artifacts.investorOnepager,
      rollbackDrill:
        loopArtifacts.rollbackDrill ??
        sustainedOpsArtifacts.rollbackDrill ??
        marketLeaderArtifacts.rollbackDrill ??
        seriesAArtifacts.rollbackDrill ??
        scaleArtifacts.rollbackDrill,
      competitorMatrix:
        loopArtifacts.competitorMatrix ??
        sustainedOpsArtifacts.competitorMatrix ??
        marketLeaderArtifacts.competitorMatrix ??
        seriesAArtifacts.competitorMatrix,
      p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
      tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    });
  const era25PilotWeek1ExecutionConvergenceIntegrity =
    buildLaunchWizardEra25PilotWeek1ExecutionConvergenceSlice(
      era25PilotWeek1ExecutionConvergence,
      commercialOps?.goNoGo.summary?.customerName ?? null,
    );
  const era25Month2MarketReadinessConvergence =
    era25PilotWeek1ExecutionConvergence?.month2MarketReadinessConvergence ??
    buildMonth2MarketReadinessConvergenceEra25UiSlice({
      week1ConvergenceVisible: false,
      goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
      p0Staging:
        loopArtifacts.p0Staging ??
        sustainedOpsArtifacts.p0Staging ??
        marketLeaderArtifacts.p0Staging ??
        seriesAArtifacts.p0Staging ??
        scaleArtifacts.p0Staging ??
        p0Summary,
      tier2Summary:
        loopArtifacts.tier2Summary ??
        sustainedOpsArtifacts.tier2Summary ??
        marketLeaderArtifacts.tier2Summary ??
        seriesAArtifacts.tier2Summary ??
        commercialOps?.tier2Staging.summary ??
        null,
      metricsBaseline:
        loopArtifacts.metricsBaseline ??
        sustainedOpsArtifacts.metricsBaseline ??
        marketLeaderArtifacts.metricsBaseline ??
        seriesAArtifacts.metricsBaseline ??
        scaleArtifacts.metricsBaseline ??
        month2Artifacts.metricsBaseline,
      caseStudyDraft:
        loopArtifacts.caseStudyDraft ??
        sustainedOpsArtifacts.caseStudyDraft ??
        marketLeaderArtifacts.caseStudyDraft ??
        seriesAArtifacts.caseStudyDraft ??
        scaleArtifacts.caseStudyDraft ??
        month2Artifacts.caseStudyDraft,
      investorOnepager:
        loopArtifacts.investorOnepager ??
        sustainedOpsArtifacts.investorOnepager ??
        marketLeaderArtifacts.investorOnepager ??
        seriesAArtifacts.investorOnepager ??
        scaleArtifacts.investorOnepager ??
        month2Artifacts.investorOnepager,
      rollbackDrill:
        loopArtifacts.rollbackDrill ??
        sustainedOpsArtifacts.rollbackDrill ??
        marketLeaderArtifacts.rollbackDrill ??
        seriesAArtifacts.rollbackDrill ??
        scaleArtifacts.rollbackDrill,
      competitorMatrix:
        loopArtifacts.competitorMatrix ??
        sustainedOpsArtifacts.competitorMatrix ??
        marketLeaderArtifacts.competitorMatrix ??
        seriesAArtifacts.competitorMatrix,
      p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
      tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    });
  const era25Month2MarketReadinessConvergenceIntegrity =
    buildLaunchWizardEra25Month2MarketReadinessConvergenceSlice(
      era25Month2MarketReadinessConvergence,
      commercialOps?.goNoGo.summary?.customerName ?? null,
    );
  const era25ScaleReadinessConvergence =
    era25Month2MarketReadinessConvergence?.scaleReadinessConvergence ??
    buildScaleReadinessConvergenceEra25UiSlice({
      month2ConvergenceVisible: false,
      goNoGoSummary: commercialOps?.goNoGo.summary ?? null,
      p0Staging:
        loopArtifacts.p0Staging ??
        sustainedOpsArtifacts.p0Staging ??
        marketLeaderArtifacts.p0Staging ??
        seriesAArtifacts.p0Staging ??
        scaleArtifacts.p0Staging ??
        p0Summary,
      tier2Summary:
        loopArtifacts.tier2Summary ??
        sustainedOpsArtifacts.tier2Summary ??
        marketLeaderArtifacts.tier2Summary ??
        seriesAArtifacts.tier2Summary ??
        commercialOps?.tier2Staging.summary ??
        null,
      metricsBaseline:
        loopArtifacts.metricsBaseline ??
        sustainedOpsArtifacts.metricsBaseline ??
        marketLeaderArtifacts.metricsBaseline ??
        seriesAArtifacts.metricsBaseline ??
        scaleArtifacts.metricsBaseline ??
        month2Artifacts.metricsBaseline,
      caseStudyDraft:
        loopArtifacts.caseStudyDraft ??
        sustainedOpsArtifacts.caseStudyDraft ??
        marketLeaderArtifacts.caseStudyDraft ??
        seriesAArtifacts.caseStudyDraft ??
        scaleArtifacts.caseStudyDraft ??
        month2Artifacts.caseStudyDraft,
      investorOnepager:
        loopArtifacts.investorOnepager ??
        sustainedOpsArtifacts.investorOnepager ??
        marketLeaderArtifacts.investorOnepager ??
        seriesAArtifacts.investorOnepager ??
        scaleArtifacts.investorOnepager ??
        month2Artifacts.investorOnepager,
      rollbackDrill:
        loopArtifacts.rollbackDrill ??
        sustainedOpsArtifacts.rollbackDrill ??
        marketLeaderArtifacts.rollbackDrill ??
        seriesAArtifacts.rollbackDrill ??
        scaleArtifacts.rollbackDrill,
      competitorMatrix:
        loopArtifacts.competitorMatrix ??
        sustainedOpsArtifacts.competitorMatrix ??
        marketLeaderArtifacts.competitorMatrix ??
        seriesAArtifacts.competitorMatrix,
      p0ProofStatus: p0Summary?.p0ProofStatus ?? null,
      tier2ProofStatus: commercialOps?.tier2Staging.summary?.tier2ProofStatus ?? null,
    });
  const era25ScaleReadinessConvergenceIntegrity = buildLaunchWizardEra25ScaleReadinessConvergenceSlice(
    era25ScaleReadinessConvergence,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );
  const era25SeriesAPartnerExpansionConvergence =
    era25ScaleReadinessConvergence?.seriesAPartnerExpansionConvergence ?? null;
  const era25SeriesAPartnerExpansionConvergenceIntegrity =
    buildLaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice(
      era25SeriesAPartnerExpansionConvergence,
      commercialOps?.goNoGo.summary?.customerName ?? null,
    );
  const era25MarketLeaderPositioningConvergence =
    era25SeriesAPartnerExpansionConvergence?.marketLeaderPositioningConvergence ?? null;
  const era25MarketLeaderPositioningConvergenceIntegrity =
    buildLaunchWizardEra25MarketLeaderPositioningConvergenceSlice(
      era25MarketLeaderPositioningConvergence,
      commercialOps?.goNoGo.summary?.customerName ?? null,
    );
  const era25SustainedOperationalExcellenceConvergence =
    era25MarketLeaderPositioningConvergence?.sustainedOperationalExcellenceConvergence ?? null;
  const era25SustainedOperationalExcellenceConvergenceIntegrity =
    buildLaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice(
      era25SustainedOperationalExcellenceConvergence,
      commercialOps?.goNoGo.summary?.customerName ?? null,
    );
  const era25PureOperationalModeTerminusIntegrity = buildLaunchWizardEra25PureOperationalModeTerminusSlice(
    era25SustainedOperationalExcellenceConvergence?.pureOperationalModeTerminus ?? null,
    commercialOps?.goNoGo.summary?.customerName ?? null,
  );

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
    tier2Status,
    commercialInflection,
    commercialGoClosure,
    commercialGoClosureIntegrity,
    pilotWeek1,
    pilotWeek1Integrity,
    month2MarketReadiness,
    month2MarketReadinessIntegrity,
    scaleReadiness,
    scaleReadinessIntegrity,
    seriesAPartnerExpansion,
    seriesAPartnerExpansionIntegrity,
    marketLeaderPositioning,
    marketLeaderPositioningIntegrity,
    sustainedOperationalExcellence,
    sustainedOperationalExcellenceIntegrity,
    continuousImprovementLoop,
    continuousImprovementLoopIntegrity,
    sustainedProductEvolution,
    sustainedProductEvolutionIntegrity,
    maintenanceMode,
    maintenanceModeIntegrity,
    engineeringPathTerminus,
    engineeringPathTerminusIntegrity,
    postTerminusSteadyState,
    postTerminusSteadyStateIntegrity,
    commercialPilotPathAbsoluteEnd,
    commercialPilotPathAbsoluteEndIntegrity,
    linearPathPermanentlyClosed,
    linearPathPermanentlyClosedIntegrity,
    linearChainTerminusGuard,
    linearChainTerminusGuardIntegrity,
    era25CharterExit,
    era25CharterExitIntegrity,
    era25FirstCharterSliceReadiness,
    era25FirstCharterSliceReadinessIntegrity,
    era25EngineeringGates,
    era25EngineeringGatesIntegrity,
    era25FirstProductSliceBlueprint,
    era25FirstProductSliceBlueprintIntegrity,
    era25OwnerDailyBriefingBreakthrough,
    era25OwnerDailyBriefingBreakthroughIntegrity,
    paidPilotGoConvergence,
    era25PaidPilotGoConvergenceIntegrity,
    era25PilotWeek1ExecutionConvergence,
    era25PilotWeek1ExecutionConvergenceIntegrity,
    era25Month2MarketReadinessConvergence,
    era25Month2MarketReadinessConvergenceIntegrity,
    era25ScaleReadinessConvergence,
    era25ScaleReadinessConvergenceIntegrity,
    era25SeriesAPartnerExpansionConvergence,
    era25SeriesAPartnerExpansionConvergenceIntegrity,
    era25MarketLeaderPositioningConvergence,
    era25MarketLeaderPositioningConvergenceIntegrity,
    era25SustainedOperationalExcellenceConvergence,
    era25SustainedOperationalExcellenceConvergenceIntegrity,
    era25PureOperationalModeTerminusIntegrity,
  };
}
