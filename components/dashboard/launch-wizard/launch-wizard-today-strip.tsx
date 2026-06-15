import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  buildLaunchWizardTodayStripViewModel,
  resolveLaunchWizardTodayStripDisplayMode,
  type LaunchWizardTodayStripDisplayMode,
} from "@/lib/launch-wizard/launch-wizard-today-strip-era19";
import { showInternalOpsDashboardUi } from "@/lib/ui/customer-facing-dashboard";
import type { LaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";

function decisionBadgeVariant(
  tone: "urgent" | "success" | "neutral",
): "destructive" | "default" | "outline" {
  if (tone === "urgent") return "destructive";
  if (tone === "success") return "default";
  return "outline";
}

export function LaunchWizardTodayStrip(props: {
  model: LaunchWizardModel;
  briefingActive?: boolean;
  rolePack?: "owner" | "manager" | "kitchen" | "cashier" | "support_admin" | null;
}) {
  try {
    return <LaunchWizardTodayStripInner {...props} />;
  } catch (error) {
    console.error("[LaunchWizardTodayStrip] render failed", error);
    return null;
  }
}

function LaunchWizardTodayStripInner(props: {
  model: LaunchWizardModel;
  briefingActive?: boolean;
  rolePack?: "owner" | "manager" | "kitchen" | "cashier" | "support_admin" | null;
}) {
  const displayMode: LaunchWizardTodayStripDisplayMode = resolveLaunchWizardTodayStripDisplayMode({
    briefingActive: props.briefingActive ?? false,
    rolePack: props.rolePack ?? null,
    commercialBlockerCount: props.model.commercialBlockers?.blockers?.length ?? 0,
  });
  const internalOps = showInternalOpsDashboardUi();

  const view = buildLaunchWizardTodayStripViewModel({
    commercialBlockers: props.model.commercialBlockers,
    commercialSetup: props.model.commercialSetup,
    commercialInflection: props.model.commercialInflection,
    pilotWeek1: props.model.pilotWeek1Integrity,
    month2: props.model.month2MarketReadinessIntegrity,
    scale: props.model.scaleReadinessIntegrity,
    seriesA: props.model.seriesAPartnerExpansionIntegrity,
    marketLeader: props.model.marketLeaderPositioningIntegrity,
    sustainedOps: props.model.sustainedOperationalExcellenceIntegrity,
    improvementLoop: props.model.continuousImprovementLoopIntegrity,
    productEvolution: props.model.sustainedProductEvolutionIntegrity,
    maintenanceMode: props.model.maintenanceModeIntegrity,
    engineeringTerminus: props.model.engineeringPathTerminusIntegrity,
    postTerminusSteadyState: props.model.postTerminusSteadyStateIntegrity,
    commercialPilotPathAbsoluteEnd: props.model.commercialPilotPathAbsoluteEndIntegrity,
    linearPathPermanentlyClosed: props.model.linearPathPermanentlyClosedIntegrity,
    linearChainTerminusGuard: props.model.linearChainTerminusGuardIntegrity,
    era25CharterExit: props.model.era25CharterExitIntegrity,
    era25FirstCharterSliceReadiness: props.model.era25FirstCharterSliceReadinessIntegrity,
    era25EngineeringGates: props.model.era25EngineeringGatesIntegrity,
    era25FirstProductSliceBlueprint: props.model.era25FirstProductSliceBlueprintIntegrity,
    era25OwnerDailyBriefingBreakthrough: props.model.era25OwnerDailyBriefingBreakthroughIntegrity,
    era25PaidPilotGoConvergence: props.model.era25PaidPilotGoConvergenceIntegrity,
    era25PilotWeek1ExecutionConvergence: props.model.era25PilotWeek1ExecutionConvergenceIntegrity,
    era25Month2MarketReadinessConvergence:
      props.model.era25Month2MarketReadinessConvergenceIntegrity,
    era25ScaleReadinessConvergence: props.model.era25ScaleReadinessConvergenceIntegrity,
    era25SeriesAPartnerExpansionConvergence:
      props.model.era25SeriesAPartnerExpansionConvergenceIntegrity,
    era25MarketLeaderPositioningConvergence:
      props.model.era25MarketLeaderPositioningConvergenceIntegrity,
    era25SustainedOperationalExcellenceConvergence:
      props.model.era25SustainedOperationalExcellenceConvergenceIntegrity,
    era25PureOperationalModeTerminus: props.model.era25PureOperationalModeTerminusIntegrity,
    era25CommercialPilotConvergenceTrainClosure:
      props.model.era25CommercialPilotConvergenceTrainClosureIntegrity,
    era25SustainedProductEvolutionReentrant:
      props.model.era25SustainedProductEvolutionReentrantIntegrity,
    era25PostReentrantCharterLock: props.model.era25PostReentrantCharterLockIntegrity,
    era25SteadyStateOperatorLoopLock: props.model.era25SteadyStateOperatorLoopLockIntegrity,
    era25CommercialPilotConvergenceTrainCapstone:
      props.model.era25CommercialPilotConvergenceTrainCapstoneIntegrity,
    era25ConvergenceGovernanceTerminusFreeze:
      props.model.era25ConvergenceGovernanceTerminusFreezeIntegrity,
    era25BandAMarketProofExecutionSolePath:
      props.model.era25BandAMarketProofExecutionSolePathIntegrity,
    era25P0MarketProofHonestClosureCapstone:
      props.model.era25P0MarketProofHonestClosureCapstoneIntegrity,
    era25PostMarketProofSteadyOperationalWitness:
      props.model.era25PostMarketProofSteadyOperationalWitnessIntegrity,
    era25GovernanceTrainTerminalSeal: props.model.era25GovernanceTrainTerminalSealIntegrity,
    era25PostTerminalSealCommercialOpsPermanence:
      props.model.era25PostTerminalSealCommercialOpsPermanenceIntegrity,
    era25BandAGovernanceChainCapstoneWitness:
      props.model.era25BandAGovernanceChainCapstoneWitnessIntegrity,
    era25PostBandAGovernanceSteadyProductModeWitness:
      props.model.era25PostBandAGovernanceSteadyProductModeWitnessIntegrity,
    era25PostSteadyProductModeCommercialOpsRhythmPermanence:
      props.model.era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrity,
    era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness:
      props.model.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrity,
    nextStep: props.model.nextStep,
    progress: props.model.progress,
    displayMode: internalOps ? displayMode : "setup_only",
  });

  const strip = internalOps
    ? view
    : {
        ...view,
        headline: view.progressPercent >= 100 ? "Setup complete" : "Setup progress",
        subline:
          view.progressPercent >= 100
            ? "Your workspace is ready for daily operations."
            : `${view.progressLabel} — complete the remaining steps to start taking orders.`,
        ctaLabel: view.progressPercent >= 100 ? "Review setup" : "Continue setup",
        href: "/dashboard/launch-wizard?mode=compact",
        commercialInflection: null,
        pilotWeek1: null,
        month2: null,
        scale: null,
        seriesA: null,
        marketLeader: null,
        sustainedOps: null,
        improvementLoop: null,
        productEvolution: null,
        maintenanceMode: null,
        engineeringTerminus: null,
        postTerminusSteadyState: null,
        commercialPilotPathAbsoluteEnd: null,
        linearPathPermanentlyClosed: null,
        linearChainTerminusGuard: null,
        era25CharterExit: null,
        era25FirstCharterSliceReadiness: null,
        era25EngineeringGates: null,
        era25FirstProductSliceBlueprint: null,
        era25OwnerDailyBriefingBreakthrough: null,
        era25PaidPilotGoConvergence: null,
        era25PilotWeek1ExecutionConvergence: null,
        era25Month2MarketReadinessConvergence: null,
        era25ScaleReadinessConvergence: null,
        era25SeriesAPartnerExpansionConvergence: null,
        era25MarketLeaderPositioningConvergence: null,
        era25SustainedOperationalExcellenceConvergence: null,
        era25PureOperationalModeTerminus: null,
        era25CommercialPilotConvergenceTrainClosure: null,
        era25SustainedProductEvolutionReentrant: null,
        era25PostReentrantCharterLock: null,
        era25SteadyStateOperatorLoopLock: null,
        era25CommercialPilotConvergenceTrainCapstone: null,
        era25ConvergenceGovernanceTerminusFreeze: null,
        era25BandAMarketProofExecutionSolePath: null,
        era25P0MarketProofHonestClosureCapstone: null,
        era25PostMarketProofSteadyOperationalWitness: null,
        era25GovernanceTrainTerminalSeal: null,
        era25PostTerminalSealCommercialOpsPermanence: null,
        era25BandAGovernanceChainCapstoneWitness: null,
        era25PostBandAGovernanceSteadyProductModeWitness: null,
        era25PostSteadyProductModeCommercialOpsRhythmPermanence: null,
        era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness: null,
        blockerCount: 0,
        mode: "setup_next" as const,
        displayMode: "setup_only" as const,
      };

  return (
    <Card
      className="border-primary/20 bg-primary/[0.03] shadow-sm"
      data-testid="launch-wizard-today-strip"
      data-strip-mode={strip.mode}
      data-strip-display={strip.displayMode}
    >
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Rocket className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="font-medium">
              {internalOps && strip.mode === "commercial_unblock"
                ? "Commercial unblock"
                : "Workspace setup"}
            </p>
            <Badge variant="outline" className="rounded-full tabular-nums">
              {strip.progressLabel}
            </Badge>
            {internalOps && strip.displayMode === "full" ? (
              <Badge
                variant={decisionBadgeVariant(strip.decisionTone)}
                className="rounded-full"
                data-testid="launch-wizard-today-strip-decision"
              >
                {strip.decisionLabel}
              </Badge>
            ) : null}
            {internalOps && strip.blockerCount > 0 ? (
              <Badge variant="destructive" className="rounded-full tabular-nums">
                {strip.blockerCount} commercial blocker{strip.blockerCount === 1 ? "" : "s"}
              </Badge>
            ) : null}
            {internalOps && strip.commercialInflection ? (
              <Badge
                variant="outline"
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-inflection"
              >
                {strip.commercialInflection.milestoneLabel}
              </Badge>
            ) : null}
            {strip.pilotWeek1 ? (
              <Badge
                variant={strip.pilotWeek1.week1IntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-week1"
              >
                Week 1 {strip.pilotWeek1.progressLabel}
              </Badge>
            ) : null}
            {strip.month2 ? (
              <Badge
                variant={strip.month2.month2IntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-month2"
              >
                Month 2 {strip.month2.progressLabel}
              </Badge>
            ) : null}
            {strip.scale ? (
              <Badge
                variant={strip.scale.scaleIntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-scale"
              >
                Scale {strip.scale.progressLabel}
              </Badge>
            ) : null}
            {strip.seriesA ? (
              <Badge
                variant={strip.seriesA.seriesAIntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-series-a"
              >
                Series A {strip.seriesA.progressLabel}
              </Badge>
            ) : null}
            {strip.marketLeader ? (
              <Badge
                variant={strip.marketLeader.marketLeaderIntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-market-leader"
              >
                Market leader {strip.marketLeader.progressLabel}
              </Badge>
            ) : null}
            {strip.sustainedOps ? (
              <Badge
                variant={strip.sustainedOps.sustainedOpsIntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-sustained-ops"
              >
                Sustained ops {strip.sustainedOps.progressLabel}
              </Badge>
            ) : null}
            {strip.improvementLoop ? (
              <Badge
                variant={
                  strip.improvementLoop.improvementLoopIntegrityFailed ? "destructive" : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-improvement-loop"
              >
                Improvement loop {strip.improvementLoop.progressLabel}
              </Badge>
            ) : null}
            {strip.productEvolution ? (
              <Badge
                variant={
                  strip.productEvolution.productEvolutionIntegrityFailed ? "destructive" : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-product-evolution"
              >
                Product evolution {strip.productEvolution.progressLabel}
              </Badge>
            ) : null}
            {strip.maintenanceMode ? (
              <Badge
                variant={
                  strip.maintenanceMode.maintenanceModeIntegrityFailed ? "destructive" : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-maintenance-mode"
              >
                Maintenance mode {strip.maintenanceMode.progressLabel}
              </Badge>
            ) : null}
            {strip.engineeringTerminus ? (
              <Badge
                variant={
                  strip.engineeringTerminus.engineeringTerminusIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-engineering-terminus"
              >
                Engineering path {strip.engineeringTerminus.progressLabel}
              </Badge>
            ) : null}
            {strip.postTerminusSteadyState ? (
              <Badge
                variant={
                  strip.postTerminusSteadyState.postTerminusSteadyStateIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-post-terminus-steady-state"
              >
                Steady state {strip.postTerminusSteadyState.progressLabel}
              </Badge>
            ) : null}
            {strip.commercialPilotPathAbsoluteEnd ? (
              <Badge
                variant={
                  strip.commercialPilotPathAbsoluteEnd.commercialPilotPathAbsoluteEndIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-commercial-pilot-path-absolute-end"
              >
                Absolute end {strip.commercialPilotPathAbsoluteEnd.progressLabel}
              </Badge>
            ) : null}
            {strip.linearPathPermanentlyClosed ? (
              <Badge
                variant={
                  strip.linearPathPermanentlyClosed.linearPathPermanentlyClosedIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-linear-path-permanently-closed"
              >
                Linear path {strip.linearPathPermanentlyClosed.progressLabel}
              </Badge>
            ) : null}
            {strip.linearChainTerminusGuard ? (
              <Badge
                variant={
                  strip.linearChainTerminusGuard.linearChainTerminusGuardIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-linear-chain-terminus-guard"
              >
                Step 17 {strip.linearChainTerminusGuard.progressLabel}
              </Badge>
            ) : null}
            {strip.era25CharterExit ? (
              <Badge
                variant={
                  strip.era25CharterExit.era25CharterExitIntegrityFailed ? "destructive" : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-charter-exit"
              >
                Era25 {strip.era25CharterExit.progressLabel}
              </Badge>
            ) : null}
            {strip.era25FirstCharterSliceReadiness ? (
              <Badge
                variant={
                  strip.era25FirstCharterSliceReadiness.era25FirstCharterSliceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-first-charter-slice"
              >
                First slice {strip.era25FirstCharterSliceReadiness.progressLabel}
              </Badge>
            ) : null}
            {strip.era25EngineeringGates ? (
              <Badge
                variant={
                  strip.era25EngineeringGates.era25EngineeringGatesIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-engineering-gates"
              >
                Gates {strip.era25EngineeringGates.progressLabel}
              </Badge>
            ) : null}
            {strip.era25FirstProductSliceBlueprint ? (
              <Badge
                variant={
                  strip.era25FirstProductSliceBlueprint.era25FirstProductSliceBlueprintIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-first-product-slice-blueprint"
              >
                Blueprint {strip.era25FirstProductSliceBlueprint.progressLabel}
              </Badge>
            ) : null}
            {strip.era25OwnerDailyBriefingBreakthrough ? (
              <Badge
                variant={
                  strip.era25OwnerDailyBriefingBreakthrough.ownerDailyBriefingBreakthroughIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-owner-daily-briefing-breakthrough"
              >
                Breakthrough {strip.era25OwnerDailyBriefingBreakthrough.progressLabel}
              </Badge>
            ) : null}
            {strip.era25PaidPilotGoConvergence ? (
              <Badge
                variant={
                  strip.era25PaidPilotGoConvergence.paidPilotGoConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-paid-pilot-go-convergence"
              >
                GO convergence {strip.era25PaidPilotGoConvergence.progressLabel}
              </Badge>
            ) : null}
            {strip.era25PilotWeek1ExecutionConvergence ? (
              <Badge
                variant={
                  strip.era25PilotWeek1ExecutionConvergence.pilotWeek1ExecutionConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-pilot-week1-execution-convergence"
              >
                Week 1 {strip.era25PilotWeek1ExecutionConvergence.progressLabel}
              </Badge>
            ) : null}
            {strip.era25Month2MarketReadinessConvergence ? (
              <Badge
                variant={
                  strip.era25Month2MarketReadinessConvergence.month2MarketReadinessConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-month2-market-readiness-convergence"
              >
                Month 2 {strip.era25Month2MarketReadinessConvergence.progressLabel}
              </Badge>
            ) : null}
            {strip.era25ScaleReadinessConvergence ? (
              <Badge
                variant={
                  strip.era25ScaleReadinessConvergence.scaleReadinessConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-scale-readiness-convergence"
              >
                Scale {strip.era25ScaleReadinessConvergence.progressLabel}
              </Badge>
            ) : null}
            {strip.era25SeriesAPartnerExpansionConvergence ? (
              <Badge
                variant={
                  strip.era25SeriesAPartnerExpansionConvergence
                    .seriesAPartnerExpansionConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-series-a-partner-expansion-convergence"
              >
                Series A {strip.era25SeriesAPartnerExpansionConvergence.progressLabel}
              </Badge>
            ) : null}
            {strip.era25MarketLeaderPositioningConvergence ? (
              <Badge
                variant={
                  strip.era25MarketLeaderPositioningConvergence
                    .marketLeaderPositioningConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-market-leader-positioning-convergence"
              >
                Market leader {strip.era25MarketLeaderPositioningConvergence.progressLabel}
              </Badge>
            ) : null}
            {strip.era25SustainedOperationalExcellenceConvergence ? (
              <Badge
                variant={
                  strip.era25SustainedOperationalExcellenceConvergence
                    .sustainedOperationalExcellenceConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-sustained-operational-excellence-convergence"
              >
                Sustained ops {strip.era25SustainedOperationalExcellenceConvergence.progressLabel}
              </Badge>
            ) : null}
            {strip.era25PureOperationalModeTerminus ? (
              <Badge
                variant={
                  strip.era25PureOperationalModeTerminus.pureOperationalModeTerminusConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-pure-operational-mode-terminus"
              >
                Pure ops {strip.era25PureOperationalModeTerminus.progressLabel}
              </Badge>
            ) : null}
            {strip.era25CommercialPilotConvergenceTrainClosure ? (
              <Badge
                variant={
                  strip.era25CommercialPilotConvergenceTrainClosure
                    .era25CommercialPilotConvergenceTrainClosureIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-commercial-pilot-convergence-train-closure"
              >
                Train closure {strip.era25CommercialPilotConvergenceTrainClosure.progressLabel}
              </Badge>
            ) : null}
            {strip.era25SustainedProductEvolutionReentrant ? (
              <Badge
                variant={
                  strip.era25SustainedProductEvolutionReentrant
                    .sustainedProductEvolutionReentrantIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-sustained-product-evolution-re-entrant"
              >
                Re-entrant {strip.era25SustainedProductEvolutionReentrant.progressLabel}
              </Badge>
            ) : null}
            {strip.era25PostReentrantCharterLock ? (
              <Badge
                variant={
                  strip.era25PostReentrantCharterLock.era25PostReentrantCharterLockIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-post-re-entrant-charter-lock"
              >
                Charter lock {strip.era25PostReentrantCharterLock.progressLabel}
              </Badge>
            ) : null}
            {strip.era25SteadyStateOperatorLoopLock ? (
              <Badge
                variant={
                  strip.era25SteadyStateOperatorLoopLock.era25SteadyStateOperatorLoopLockIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-steady-state-operator-loop-lock"
              >
                Steady-state {strip.era25SteadyStateOperatorLoopLock.progressLabel}
              </Badge>
            ) : null}
            {strip.era25CommercialPilotConvergenceTrainCapstone ? (
              <Badge
                variant={
                  strip.era25CommercialPilotConvergenceTrainCapstone
                    .era25CommercialPilotConvergenceTrainCapstoneIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-commercial-pilot-convergence-train-capstone"
              >
                Capstone {strip.era25CommercialPilotConvergenceTrainCapstone.progressLabel}
              </Badge>
            ) : null}
            {strip.era25ConvergenceGovernanceTerminusFreeze ? (
              <Badge
                variant={
                  strip.era25ConvergenceGovernanceTerminusFreeze
                    .era25ConvergenceGovernanceTerminusFreezeIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-convergence-governance-terminus-freeze"
              >
                Terminus {strip.era25ConvergenceGovernanceTerminusFreeze.progressLabel}
              </Badge>
            ) : null}
            {strip.era25BandAMarketProofExecutionSolePath ? (
              <Badge
                variant={
                  strip.era25BandAMarketProofExecutionSolePath
                    .era25BandAMarketProofExecutionSolePathIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-band-a-market-proof-execution-sole-path"
              >
                Band A {strip.era25BandAMarketProofExecutionSolePath.progressLabel}
              </Badge>
            ) : null}
            {strip.era25P0MarketProofHonestClosureCapstone ? (
              <Badge
                variant={
                  strip.era25P0MarketProofHonestClosureCapstone
                    .era25P0MarketProofHonestClosureCapstoneIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-p0-market-proof-honest-closure-capstone"
              >
                P0 closure {strip.era25P0MarketProofHonestClosureCapstone.progressLabel}
              </Badge>
            ) : null}
            {strip.era25PostMarketProofSteadyOperationalWitness ? (
              <Badge
                variant={
                  strip.era25PostMarketProofSteadyOperationalWitness
                    .era25PostMarketProofSteadyOperationalWitnessIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-post-market-proof-steady-operational-witness"
              >
                Steady witness {strip.era25PostMarketProofSteadyOperationalWitness.progressLabel}
              </Badge>
            ) : null}
            {strip.era25GovernanceTrainTerminalSeal ? (
              <Badge
                variant={
                  strip.era25GovernanceTrainTerminalSeal.era25GovernanceTrainTerminalSealIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-governance-train-terminal-seal"
              >
                Train seal {strip.era25GovernanceTrainTerminalSeal.progressLabel}
              </Badge>
            ) : null}
            {strip.era25PostTerminalSealCommercialOpsPermanence ? (
              <Badge
                variant={
                  strip.era25PostTerminalSealCommercialOpsPermanence
                    .era25PostTerminalSealCommercialOpsPermanenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-post-terminal-seal-commercial-ops-permanence"
              >
                Ops permanence {strip.era25PostTerminalSealCommercialOpsPermanence.progressLabel}
              </Badge>
            ) : null}
            {strip.era25BandAGovernanceChainCapstoneWitness ? (
              <Badge
                variant={
                  strip.era25BandAGovernanceChainCapstoneWitness
                    .era25BandAGovernanceChainCapstoneWitnessIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-band-a-governance-chain-capstone-witness"
              >
                Band A capstone {strip.era25BandAGovernanceChainCapstoneWitness.progressLabel}
              </Badge>
            ) : null}
            {strip.era25PostBandAGovernanceSteadyProductModeWitness ? (
              <Badge
                variant={
                  strip.era25PostBandAGovernanceSteadyProductModeWitness
                    .era25PostBandAGovernanceSteadyProductModeWitnessIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-post-band-a-governance-steady-product-mode-witness"
              >
                Steady product mode{" "}
                {strip.era25PostBandAGovernanceSteadyProductModeWitness.progressLabel}
              </Badge>
            ) : null}
            {strip.era25PostSteadyProductModeCommercialOpsRhythmPermanence ? (
              <Badge
                variant={
                  strip.era25PostSteadyProductModeCommercialOpsRhythmPermanence
                    .era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-post-steady-product-mode-commercial-ops-rhythm-permanence"
              >
                Ops rhythm permanence{" "}
                {strip.era25PostSteadyProductModeCommercialOpsRhythmPermanence.progressLabel}
              </Badge>
            ) : null}
            {strip.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness ? (
              <Badge
                variant={
                  strip.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness
                    .era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness"
              >
                Band A terminal closure{" "}
                {strip.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness.progressLabel}
              </Badge>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Progress value={strip.progressPercent} className="h-1.5 max-w-md" />
            <p className="text-sm font-medium text-foreground">{strip.headline}</p>
            <p className="text-sm text-muted-foreground">{strip.subline}</p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0 rounded-full">
          <Link href={strip.href} data-testid="launch-wizard-today-strip-cta">
            {strip.ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
