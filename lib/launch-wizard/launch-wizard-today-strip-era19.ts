import type { CommercialPilotOpsDecision } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import { launchWizardTodayStripHref } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import type { LaunchWizardCommercialBlockersSlice } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import type { LaunchWizardCommercialSetupSlice } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";
import { LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-today-strip-era19-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import type { LaunchWizardCommercialInflectionSlice } from "@/lib/launch-wizard/launch-wizard-commercial-inflection-era28";
import type { LaunchWizardPilotWeek1Slice } from "@/lib/launch-wizard/launch-wizard-pilot-week1-era28";
import type { LaunchWizardMonth2Slice } from "@/lib/launch-wizard/launch-wizard-month2-era29";
import type { LaunchWizardScaleSlice } from "@/lib/launch-wizard/launch-wizard-scale-era30";
import type { LaunchWizardSeriesASlice } from "@/lib/launch-wizard/launch-wizard-series-a-era31";
import type { LaunchWizardMarketLeaderSlice } from "@/lib/launch-wizard/launch-wizard-market-leader-era32";
import type { LaunchWizardSustainedOpsSlice } from "@/lib/launch-wizard/launch-wizard-sustained-ops-era33";
import type { LaunchWizardImprovementLoopSlice } from "@/lib/launch-wizard/launch-wizard-improvement-loop-era34";
import type { LaunchWizardProductEvolutionSlice } from "@/lib/launch-wizard/launch-wizard-product-evolution-era35";
import type { LaunchWizardMaintenanceModeSlice } from "@/lib/launch-wizard/launch-wizard-maintenance-mode-era36";
import type { LaunchWizardEngineeringTerminusSlice } from "@/lib/launch-wizard/launch-wizard-engineering-terminus-era37";
import type { LaunchWizardPostTerminusSteadyStateSlice } from "@/lib/launch-wizard/launch-wizard-post-terminus-steady-state-era38";
import type { LaunchWizardCommercialPilotPathAbsoluteEndSlice } from "@/lib/launch-wizard/launch-wizard-commercial-pilot-path-absolute-end-era39";
import type { LaunchWizardLinearPathPermanentlyClosedSlice } from "@/lib/launch-wizard/launch-wizard-linear-path-permanently-closed-era40";
import type { LaunchWizardLinearChainTerminusGuardSlice } from "@/lib/launch-wizard/launch-wizard-linear-chain-terminus-guard-era41";
import type { LaunchWizardEra25CharterExitSlice } from "@/lib/launch-wizard/launch-wizard-era25-charter-exit-era42";
import type { LaunchWizardEra25FirstCharterSliceSlice } from "@/lib/launch-wizard/launch-wizard-era25-first-charter-slice-era43";
import type { LaunchWizardEra25EngineeringGatesSlice } from "@/lib/launch-wizard/launch-wizard-era25-engineering-gates-era44";
import type { LaunchWizardEra25FirstProductSliceBlueprintSlice } from "@/lib/launch-wizard/launch-wizard-era25-first-product-slice-blueprint-era45";
import type { LaunchWizardEra25OwnerDailyBriefingBreakthroughSlice } from "@/lib/launch-wizard/launch-wizard-era25-owner-daily-briefing-breakthrough-era46";
import type { LaunchWizardEra25PaidPilotGoConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-paid-pilot-go-convergence-era47";
import type { LaunchWizardEra25PilotWeek1ExecutionConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-pilot-week1-execution-convergence-era48";
import type { LaunchWizardEra25Month2MarketReadinessConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-month2-market-readiness-convergence-era49";
import type { LaunchWizardEra25ScaleReadinessConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-scale-readiness-convergence-era50";
import type { LaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-series-a-partner-expansion-convergence-era51";
import type { LaunchWizardStep } from "@/lib/launch-wizard/launch-wizard-era19";

export const LAUNCH_WIZARD_TODAY_STRIP_AGGREGATOR_ERA19_POLICY_ID =
  "era19-launch-wizard-today-strip-aggregator-v1" as const;

export type LaunchWizardTodayStripMode = "commercial_unblock" | "setup_next" | "setup_complete";

export type LaunchWizardTodayStripDisplayMode = "full" | "setup_only";

export type LaunchWizardTodayStripDecisionTone = "urgent" | "success" | "neutral";

export type LaunchWizardTodayStripViewModel = {
  policyId: typeof LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID;
  mode: LaunchWizardTodayStripMode;
  displayMode: LaunchWizardTodayStripDisplayMode;
  headline: string;
  subline: string;
  href: string;
  ctaLabel: string;
  decisionLabel: string;
  decisionTone: LaunchWizardTodayStripDecisionTone;
  blockerCount: number;
  progressPercent: number;
  progressLabel: string;
  commercialInflection: LaunchWizardCommercialInflectionSlice | null;
  pilotWeek1: LaunchWizardPilotWeek1Slice | null;
  month2: LaunchWizardMonth2Slice | null;
  scale: LaunchWizardScaleSlice | null;
  seriesA: LaunchWizardSeriesASlice | null;
  marketLeader: LaunchWizardMarketLeaderSlice | null;
  sustainedOps: LaunchWizardSustainedOpsSlice | null;
  improvementLoop: LaunchWizardImprovementLoopSlice | null;
  productEvolution: LaunchWizardProductEvolutionSlice | null;
  maintenanceMode: LaunchWizardMaintenanceModeSlice | null;
  engineeringTerminus: LaunchWizardEngineeringTerminusSlice | null;
  postTerminusSteadyState: LaunchWizardPostTerminusSteadyStateSlice | null;
  commercialPilotPathAbsoluteEnd: LaunchWizardCommercialPilotPathAbsoluteEndSlice | null;
  linearPathPermanentlyClosed: LaunchWizardLinearPathPermanentlyClosedSlice | null;
  linearChainTerminusGuard: LaunchWizardLinearChainTerminusGuardSlice | null;
  era25CharterExit: LaunchWizardEra25CharterExitSlice | null;
  era25FirstCharterSliceReadiness: LaunchWizardEra25FirstCharterSliceSlice | null;
  era25EngineeringGates: LaunchWizardEra25EngineeringGatesSlice | null;
  era25FirstProductSliceBlueprint: LaunchWizardEra25FirstProductSliceBlueprintSlice | null;
  era25OwnerDailyBriefingBreakthrough: LaunchWizardEra25OwnerDailyBriefingBreakthroughSlice | null;
  era25PaidPilotGoConvergence: LaunchWizardEra25PaidPilotGoConvergenceSlice | null;
  era25PilotWeek1ExecutionConvergence: LaunchWizardEra25PilotWeek1ExecutionConvergenceSlice | null;
  era25Month2MarketReadinessConvergence: LaunchWizardEra25Month2MarketReadinessConvergenceSlice | null;
  era25ScaleReadinessConvergence: LaunchWizardEra25ScaleReadinessConvergenceSlice | null;
  era25SeriesAPartnerExpansionConvergence: LaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice | null;
};

export function resolveLaunchWizardTodayStripDecisionTone(
  decision: CommercialPilotOpsDecision,
  blockerCount: number,
): LaunchWizardTodayStripDecisionTone {
  if (decision === "GO" && blockerCount === 0) return "success";
  if (decision === "NO-GO" || blockerCount > 0) return "urgent";
  return "neutral";
}

export function resolveLaunchWizardTodayStripDisplayMode(input: {
  briefingActive: boolean;
  rolePack: "owner" | "manager" | "kitchen" | "cashier" | "support_admin" | null;
  commercialBlockerCount: number;
}): LaunchWizardTodayStripDisplayMode {
  if (input.briefingActive && input.rolePack === "owner" && input.commercialBlockerCount > 0) {
    return "setup_only";
  }
  return "full";
}

export function resolveLaunchWizardTodayStripHref(input: {
  nextUnblockHref?: string | null;
  nextStepId?: string | null;
  mode: LaunchWizardTodayStripMode;
}): string {
  if (input.mode === "commercial_unblock" && input.nextUnblockHref) {
    return input.nextUnblockHref;
  }
  if (input.mode === "setup_complete") {
    return `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`;
  }
  return launchWizardTodayStripHref(input.nextStepId ?? null);
}

export function buildLaunchWizardTodayStripViewModel(input: {
  commercialBlockers: LaunchWizardCommercialBlockersSlice;
  commercialSetup: LaunchWizardCommercialSetupSlice;
  commercialInflection?: LaunchWizardCommercialInflectionSlice | null;
  pilotWeek1?: LaunchWizardPilotWeek1Slice | null;
  month2?: LaunchWizardMonth2Slice | null;
  scale?: LaunchWizardScaleSlice | null;
  seriesA?: LaunchWizardSeriesASlice | null;
  marketLeader?: LaunchWizardMarketLeaderSlice | null;
  sustainedOps?: LaunchWizardSustainedOpsSlice | null;
  improvementLoop?: LaunchWizardImprovementLoopSlice | null;
  productEvolution?: LaunchWizardProductEvolutionSlice | null;
  maintenanceMode?: LaunchWizardMaintenanceModeSlice | null;
  engineeringTerminus?: LaunchWizardEngineeringTerminusSlice | null;
  postTerminusSteadyState?: LaunchWizardPostTerminusSteadyStateSlice | null;
  commercialPilotPathAbsoluteEnd?: LaunchWizardCommercialPilotPathAbsoluteEndSlice | null;
  linearPathPermanentlyClosed?: LaunchWizardLinearPathPermanentlyClosedSlice | null;
  linearChainTerminusGuard?: LaunchWizardLinearChainTerminusGuardSlice | null;
  era25CharterExit?: LaunchWizardEra25CharterExitSlice | null;
  era25FirstCharterSliceReadiness?: LaunchWizardEra25FirstCharterSliceSlice | null;
  era25EngineeringGates?: LaunchWizardEra25EngineeringGatesSlice | null;
  era25FirstProductSliceBlueprint?: LaunchWizardEra25FirstProductSliceBlueprintSlice | null;
  era25OwnerDailyBriefingBreakthrough?: LaunchWizardEra25OwnerDailyBriefingBreakthroughSlice | null;
  era25PaidPilotGoConvergence?: LaunchWizardEra25PaidPilotGoConvergenceSlice | null;
  era25PilotWeek1ExecutionConvergence?: LaunchWizardEra25PilotWeek1ExecutionConvergenceSlice | null;
  era25Month2MarketReadinessConvergence?: LaunchWizardEra25Month2MarketReadinessConvergenceSlice | null;
  era25ScaleReadinessConvergence?: LaunchWizardEra25ScaleReadinessConvergenceSlice | null;
  era25SeriesAPartnerExpansionConvergence?: LaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice | null;
  nextStep: LaunchWizardStep | null;
  progress: { completedCount: number; totalCount: number; percent: number };
  displayMode?: LaunchWizardTodayStripDisplayMode;
}): LaunchWizardTodayStripViewModel {
  const commercialInflection = input.commercialInflection ?? null;
  const pilotWeek1 = input.pilotWeek1 ?? null;
  const month2 = input.month2 ?? null;
  const inflectionSubline = commercialInflection
    ? `${commercialInflection.scorecardLabel} · registry LIVE ${commercialInflection.integrationRegistryLiveCount}`
    : null;
  const week1Subline = pilotWeek1
    ? `Week 1 ${pilotWeek1.progressLabel}${pilotWeek1.week1IntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const month2Subline = month2
    ? `Month 2 ${month2.progressLabel}${month2.month2IntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const scale = input.scale ?? null;
  const scaleSubline = scale
    ? `Scale ${scale.progressLabel}${scale.scaleIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const seriesA = input.seriesA ?? null;
  const seriesASubline = seriesA
    ? `Series A ${seriesA.progressLabel}${seriesA.seriesAIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const marketLeader = input.marketLeader ?? null;
  const marketLeaderSubline = marketLeader
    ? `Market leader ${marketLeader.progressLabel}${marketLeader.marketLeaderIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const sustainedOps = input.sustainedOps ?? null;
  const sustainedOpsSubline = sustainedOps
    ? `Sustained ops ${sustainedOps.progressLabel}${sustainedOps.sustainedOpsIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const improvementLoop = input.improvementLoop ?? null;
  const improvementLoopSubline = improvementLoop
    ? `Improvement loop ${improvementLoop.progressLabel}${improvementLoop.improvementLoopIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const productEvolution = input.productEvolution ?? null;
  const productEvolutionSubline = productEvolution
    ? `Product evolution ${productEvolution.progressLabel}${productEvolution.productEvolutionIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const maintenanceMode = input.maintenanceMode ?? null;
  const maintenanceModeSubline = maintenanceMode
    ? `Maintenance mode ${maintenanceMode.progressLabel}${maintenanceMode.maintenanceModeIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const engineeringTerminus = input.engineeringTerminus ?? null;
  const engineeringTerminusSubline = engineeringTerminus
    ? `Engineering path ${engineeringTerminus.progressLabel}${engineeringTerminus.engineeringTerminusIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const postTerminusSteadyState = input.postTerminusSteadyState ?? null;
  const postTerminusSteadyStateSubline = postTerminusSteadyState
    ? `Steady state ${postTerminusSteadyState.progressLabel}${postTerminusSteadyState.postTerminusSteadyStateIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const commercialPilotPathAbsoluteEnd = input.commercialPilotPathAbsoluteEnd ?? null;
  const commercialPilotPathAbsoluteEndSubline = commercialPilotPathAbsoluteEnd
    ? `Absolute end ${commercialPilotPathAbsoluteEnd.progressLabel}${commercialPilotPathAbsoluteEnd.commercialPilotPathAbsoluteEndIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const linearPathPermanentlyClosed = input.linearPathPermanentlyClosed ?? null;
  const linearPathPermanentlyClosedSubline = linearPathPermanentlyClosed
    ? `Linear path ${linearPathPermanentlyClosed.progressLabel}${linearPathPermanentlyClosed.linearPathPermanentlyClosedIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const linearChainTerminusGuard = input.linearChainTerminusGuard ?? null;
  const linearChainTerminusGuardSubline = linearChainTerminusGuard
    ? `Step 17 ${linearChainTerminusGuard.progressLabel}${linearChainTerminusGuard.linearChainTerminusGuardIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25CharterExit = input.era25CharterExit ?? null;
  const era25CharterExitSubline = era25CharterExit
    ? `Era25 exit ${era25CharterExit.progressLabel}${era25CharterExit.era25CharterExitIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25FirstCharterSliceReadiness = input.era25FirstCharterSliceReadiness ?? null;
  const era25FirstCharterSliceSubline = era25FirstCharterSliceReadiness
    ? `First slice ${era25FirstCharterSliceReadiness.progressLabel}${era25FirstCharterSliceReadiness.era25FirstCharterSliceIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25EngineeringGates = input.era25EngineeringGates ?? null;
  const era25EngineeringGatesSubline = era25EngineeringGates
    ? `Gates ${era25EngineeringGates.progressLabel}${era25EngineeringGates.era25EngineeringGatesIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25FirstProductSliceBlueprint = input.era25FirstProductSliceBlueprint ?? null;
  const era25FirstProductSliceBlueprintSubline = era25FirstProductSliceBlueprint
    ? `Blueprint ${era25FirstProductSliceBlueprint.progressLabel}${era25FirstProductSliceBlueprint.era25FirstProductSliceBlueprintIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25OwnerDailyBriefingBreakthrough = input.era25OwnerDailyBriefingBreakthrough ?? null;
  const era25OwnerDailyBriefingBreakthroughSubline = era25OwnerDailyBriefingBreakthrough
    ? `Breakthrough ${era25OwnerDailyBriefingBreakthrough.progressLabel}${era25OwnerDailyBriefingBreakthrough.ownerDailyBriefingBreakthroughIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25PaidPilotGoConvergence = input.era25PaidPilotGoConvergence ?? null;
  const era25PaidPilotGoConvergenceSubline = era25PaidPilotGoConvergence
    ? `GO convergence ${era25PaidPilotGoConvergence.progressLabel}${era25PaidPilotGoConvergence.paidPilotGoConvergenceIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25PilotWeek1ExecutionConvergence = input.era25PilotWeek1ExecutionConvergence ?? null;
  const era25PilotWeek1ExecutionConvergenceSubline = era25PilotWeek1ExecutionConvergence
    ? `Week 1 ${era25PilotWeek1ExecutionConvergence.progressLabel}${era25PilotWeek1ExecutionConvergence.pilotWeek1ExecutionConvergenceIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25Month2MarketReadinessConvergence = input.era25Month2MarketReadinessConvergence ?? null;
  const era25Month2MarketReadinessConvergenceSubline = era25Month2MarketReadinessConvergence
    ? `Month 2 ${era25Month2MarketReadinessConvergence.progressLabel}${era25Month2MarketReadinessConvergence.month2MarketReadinessConvergenceIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25ScaleReadinessConvergence = input.era25ScaleReadinessConvergence ?? null;
  const era25ScaleReadinessConvergenceSubline = era25ScaleReadinessConvergence
    ? `Scale ${era25ScaleReadinessConvergence.progressLabel}${era25ScaleReadinessConvergence.scaleReadinessConvergenceIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25SeriesAPartnerExpansionConvergence = input.era25SeriesAPartnerExpansionConvergence ?? null;
  const era25SeriesAPartnerExpansionConvergenceSubline = era25SeriesAPartnerExpansionConvergence
    ? `Series A ${era25SeriesAPartnerExpansionConvergence.progressLabel}${era25SeriesAPartnerExpansionConvergence.seriesAPartnerExpansionConvergenceIntegrityFailed ? " · integrity FAIL" : ""}`
    : null;
  const era25ScaleWithSeriesAConvergenceSubline = era25ScaleReadinessConvergenceSubline
    ? era25SeriesAPartnerExpansionConvergenceSubline
      ? `${era25SeriesAPartnerExpansionConvergenceSubline} · ${era25ScaleReadinessConvergenceSubline}`
      : era25ScaleReadinessConvergenceSubline
    : era25SeriesAPartnerExpansionConvergenceSubline;
  const displayMode = input.displayMode ?? "full";
  const nextUnblock = input.commercialSetup.nextUnblock;
  const blockerCount = input.commercialBlockers.blockers.length;
  const decisionTone = resolveLaunchWizardTodayStripDecisionTone(
    input.commercialBlockers.decision,
    blockerCount,
  );
  const progressLabel = `${input.progress.completedCount}/${input.progress.totalCount} setup steps`;

  if (displayMode === "full" && nextUnblock) {
    return {
      policyId: LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID,
      mode: "commercial_unblock",
      displayMode,
      headline: nextUnblock.label,
      subline: nextUnblock.detail,
      href: resolveLaunchWizardTodayStripHref({
        nextUnblockHref: nextUnblock.href,
        mode: "commercial_unblock",
      }),
      ctaLabel: "Unblock pilot",
      decisionLabel: input.commercialBlockers.decisionLabel,
      decisionTone,
      blockerCount,
      progressPercent: input.progress.percent,
      progressLabel,
      commercialInflection,
      pilotWeek1,
      month2,
      scale,
      seriesA,
      marketLeader,
      sustainedOps,
      improvementLoop,
      productEvolution,
      maintenanceMode,
      engineeringTerminus,
      postTerminusSteadyState,
      commercialPilotPathAbsoluteEnd,
      linearPathPermanentlyClosed,
      linearChainTerminusGuard,
      era25CharterExit,
      era25FirstCharterSliceReadiness,
      era25EngineeringGates,
      era25FirstProductSliceBlueprint,
      era25OwnerDailyBriefingBreakthrough,
      era25PaidPilotGoConvergence,
      era25PilotWeek1ExecutionConvergence,
      era25Month2MarketReadinessConvergence,
      era25ScaleReadinessConvergence,
      era25SeriesAPartnerExpansionConvergence,
    };
  }

  if (input.nextStep) {
    return {
      policyId: LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID,
      mode: "setup_next",
      displayMode,
      headline: input.nextStep.title,
      subline:
        displayMode === "setup_only" && blockerCount > 0
          ? `${progressLabel} — commercial blockers are in your briefing above.`
          : `Next setup step · ${progressLabel}`,
      href: resolveLaunchWizardTodayStripHref({
        nextStepId: input.nextStep.id,
        mode: "setup_next",
      }),
      ctaLabel: input.nextStep.ctaLabel,
      decisionLabel: input.commercialBlockers.decisionLabel,
      decisionTone,
      blockerCount: displayMode === "setup_only" ? 0 : blockerCount,
      progressPercent: input.progress.percent,
      progressLabel,
      commercialInflection,
      pilotWeek1,
      month2,
      scale,
      seriesA,
      marketLeader,
      sustainedOps,
      improvementLoop,
      productEvolution,
      maintenanceMode,
      engineeringTerminus,
      postTerminusSteadyState,
      commercialPilotPathAbsoluteEnd,
      linearPathPermanentlyClosed,
      linearChainTerminusGuard,
      era25CharterExit,
    };
  }

  return {
    policyId: LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID,
    mode: "setup_complete",
    displayMode,
    headline: "Setup steps complete",
    subline:
      blockerCount > 0
        ? inflectionSubline
          ? `${input.commercialBlockers.headline} · ${inflectionSubline}`
          : input.commercialBlockers.headline
        : era25ScaleWithSeriesAConvergenceSubline
          ? era25Month2MarketReadinessConvergenceSubline
            ? era25PilotWeek1ExecutionConvergenceSubline
              ? era25PaidPilotGoConvergenceSubline
                ? era25OwnerDailyBriefingBreakthroughSubline
                  ? `${era25OwnerDailyBriefingBreakthroughSubline} · ${era25PaidPilotGoConvergenceSubline} · ${era25PilotWeek1ExecutionConvergenceSubline} · ${era25Month2MarketReadinessConvergenceSubline} · ${era25ScaleWithSeriesAConvergenceSubline}`
                  : `${era25PaidPilotGoConvergenceSubline} · ${era25PilotWeek1ExecutionConvergenceSubline} · ${era25Month2MarketReadinessConvergenceSubline} · ${era25ScaleWithSeriesAConvergenceSubline}`
                : `${era25PilotWeek1ExecutionConvergenceSubline} · ${era25Month2MarketReadinessConvergenceSubline} · ${era25ScaleWithSeriesAConvergenceSubline}`
              : `${era25Month2MarketReadinessConvergenceSubline} · ${era25ScaleWithSeriesAConvergenceSubline}`
            : era25ScaleWithSeriesAConvergenceSubline
          : era25Month2MarketReadinessConvergenceSubline
          ? era25PilotWeek1ExecutionConvergenceSubline
          ? era25PaidPilotGoConvergenceSubline
            ? era25OwnerDailyBriefingBreakthroughSubline
              ? `${era25OwnerDailyBriefingBreakthroughSubline} · ${era25PaidPilotGoConvergenceSubline} · ${era25PilotWeek1ExecutionConvergenceSubline}`
              : `${era25PaidPilotGoConvergenceSubline} · ${era25PilotWeek1ExecutionConvergenceSubline}`
            : era25PilotWeek1ExecutionConvergenceSubline
          : era25PaidPilotGoConvergenceSubline
          ? era25OwnerDailyBriefingBreakthroughSubline
            ? era25FirstProductSliceBlueprintSubline
              ? `${era25FirstProductSliceBlueprintSubline} · ${era25OwnerDailyBriefingBreakthroughSubline} · ${era25PaidPilotGoConvergenceSubline}`
              : `${era25OwnerDailyBriefingBreakthroughSubline} · ${era25PaidPilotGoConvergenceSubline}`
            : era25PaidPilotGoConvergenceSubline
          : era25OwnerDailyBriefingBreakthroughSubline
          ? era25FirstProductSliceBlueprintSubline
            ? `${era25FirstProductSliceBlueprintSubline} · ${era25OwnerDailyBriefingBreakthroughSubline}`
            : era25OwnerDailyBriefingBreakthroughSubline
          : era25FirstProductSliceBlueprintSubline
          ? era25EngineeringGatesSubline
            ? `${era25EngineeringGatesSubline} · ${era25FirstProductSliceBlueprintSubline}`
            : era25FirstProductSliceBlueprintSubline
          : era25EngineeringGatesSubline
          ? era25FirstCharterSliceSubline
            ? `${era25FirstCharterSliceSubline} · ${era25EngineeringGatesSubline}`
            : era25EngineeringGatesSubline
          : era25FirstCharterSliceSubline
          ? era25CharterExitSubline
            ? linearChainTerminusGuardSubline
              ? linearPathPermanentlyClosedSubline
                ? `${linearPathPermanentlyClosedSubline} · ${linearChainTerminusGuardSubline} · ${era25CharterExitSubline} · ${era25FirstCharterSliceSubline}`
                : `${linearChainTerminusGuardSubline} · ${era25CharterExitSubline} · ${era25FirstCharterSliceSubline}`
              : `${era25CharterExitSubline} · ${era25FirstCharterSliceSubline}`
            : era25FirstCharterSliceSubline
          : era25CharterExitSubline
          ? linearChainTerminusGuardSubline
            ? linearPathPermanentlyClosedSubline
              ? `${linearPathPermanentlyClosedSubline} · ${linearChainTerminusGuardSubline} · ${era25CharterExitSubline}`
              : `${linearChainTerminusGuardSubline} · ${era25CharterExitSubline}`
            : era25CharterExitSubline
          : linearChainTerminusGuardSubline
          ? linearPathPermanentlyClosedSubline
            ? `${linearPathPermanentlyClosedSubline} · ${linearChainTerminusGuardSubline}`
            : linearChainTerminusGuardSubline
          : linearPathPermanentlyClosedSubline
          ? commercialPilotPathAbsoluteEndSubline
            ? `${commercialPilotPathAbsoluteEndSubline} · ${linearPathPermanentlyClosedSubline}`
            : linearPathPermanentlyClosedSubline
          : commercialPilotPathAbsoluteEndSubline
          ? postTerminusSteadyStateSubline
            ? `${postTerminusSteadyStateSubline} · ${commercialPilotPathAbsoluteEndSubline}`
            : commercialPilotPathAbsoluteEndSubline
          : postTerminusSteadyStateSubline
          ? engineeringTerminusSubline
            ? `${engineeringTerminusSubline} · ${postTerminusSteadyStateSubline}`
            : postTerminusSteadyStateSubline
          : engineeringTerminusSubline
          ? maintenanceModeSubline
            ? `${maintenanceModeSubline} · ${engineeringTerminusSubline}`
            : engineeringTerminusSubline
          : maintenanceModeSubline
          ? productEvolutionSubline
            ? `${productEvolutionSubline} · ${maintenanceModeSubline}`
            : maintenanceModeSubline
          : productEvolutionSubline
          ? improvementLoopSubline
            ? `${improvementLoopSubline} · ${productEvolutionSubline}`
            : productEvolutionSubline
          : improvementLoopSubline
          ? sustainedOpsSubline
            ? `${sustainedOpsSubline} · ${improvementLoopSubline}`
            : improvementLoopSubline
          : sustainedOpsSubline
            ? marketLeaderSubline
            ? seriesASubline
              ? `${seriesASubline} · ${marketLeaderSubline} · ${sustainedOpsSubline}`
              : marketLeaderSubline
                ? `${marketLeaderSubline} · ${sustainedOpsSubline}`
                : sustainedOpsSubline
            : sustainedOpsSubline
          : seriesASubline
            ? marketLeaderSubline
              ? scaleSubline
                ? month2Subline
                  ? week1Subline
                    ? `${week1Subline} · ${month2Subline} · ${scaleSubline} · ${seriesASubline} · ${marketLeaderSubline}`
                    : `${month2Subline} · ${scaleSubline} · ${seriesASubline} · ${marketLeaderSubline}`
                  : scaleSubline
                    ? `${scaleSubline} · ${seriesASubline} · ${marketLeaderSubline}`
                    : `${seriesASubline} · ${marketLeaderSubline}`
                : `${seriesASubline} · ${marketLeaderSubline}`
              : marketLeaderSubline
            : seriesASubline
          : scaleSubline
            ? month2Subline
              ? week1Subline
                ? `${week1Subline} · ${month2Subline} · ${scaleSubline}`
                : `${month2Subline} · ${scaleSubline}`
              : scaleSubline
            : month2Subline
            ? week1Subline
              ? `${week1Subline} · ${month2Subline}`
              : month2Subline
            : week1Subline
            ? inflectionSubline
              ? `${inflectionSubline} · ${week1Subline}`
              : week1Subline
            : inflectionSubline ?? "Confirm commercial GO/NO-GO before pilot cutover.",
    href: resolveLaunchWizardTodayStripHref({ mode: "setup_complete" }),
    ctaLabel: "Review commercial proof",
    decisionLabel: input.commercialBlockers.decisionLabel,
    decisionTone,
    blockerCount: displayMode === "setup_only" ? 0 : blockerCount,
    progressPercent: input.progress.percent,
    progressLabel,
    commercialInflection,
    pilotWeek1,
    month2,
    scale,
    seriesA,
    marketLeader,
    sustainedOps,
    improvementLoop,
    productEvolution,
    maintenanceMode,
    engineeringTerminus,
    postTerminusSteadyState,
    commercialPilotPathAbsoluteEnd,
    linearPathPermanentlyClosed,
    linearChainTerminusGuard,
    era25CharterExit,
    era25FirstCharterSliceReadiness,
    era25EngineeringGates,
    era25FirstProductSliceBlueprint,
    era25OwnerDailyBriefingBreakthrough,
    era25PaidPilotGoConvergence,
    era25PilotWeek1ExecutionConvergence,
    era25Month2MarketReadinessConvergence,
    era25ScaleReadinessConvergence,
    era25SeriesAPartnerExpansionConvergence,
  };
}
