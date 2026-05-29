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
  const displayMode: LaunchWizardTodayStripDisplayMode = resolveLaunchWizardTodayStripDisplayMode({
    briefingActive: props.briefingActive ?? false,
    rolePack: props.rolePack ?? null,
    commercialBlockerCount: props.model.commercialBlockers.blockers.length,
  });

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
    nextStep: props.model.nextStep,
    progress: props.model.progress,
    displayMode,
  });

  return (
    <Card
      className="border-primary/20 bg-primary/[0.03] shadow-sm"
      data-testid="launch-wizard-today-strip"
      data-strip-mode={view.mode}
      data-strip-display={view.displayMode}
    >
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Rocket className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="font-medium">
              {view.mode === "commercial_unblock" ? "Commercial unblock" : "Launch wizard"}
            </p>
            <Badge variant="outline" className="rounded-full tabular-nums">
              {view.progressLabel}
            </Badge>
            {view.displayMode === "full" ? (
              <Badge
                variant={decisionBadgeVariant(view.decisionTone)}
                className="rounded-full"
                data-testid="launch-wizard-today-strip-decision"
              >
                {view.decisionLabel}
              </Badge>
            ) : null}
            {view.blockerCount > 0 ? (
              <Badge variant="destructive" className="rounded-full tabular-nums">
                {view.blockerCount} commercial blocker{view.blockerCount === 1 ? "" : "s"}
              </Badge>
            ) : null}
            {view.commercialInflection ? (
              <Badge
                variant="outline"
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-inflection"
              >
                {view.commercialInflection.milestoneLabel}
              </Badge>
            ) : null}
            {view.pilotWeek1 ? (
              <Badge
                variant={view.pilotWeek1.week1IntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-week1"
              >
                Week 1 {view.pilotWeek1.progressLabel}
              </Badge>
            ) : null}
            {view.month2 ? (
              <Badge
                variant={view.month2.month2IntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-month2"
              >
                Month 2 {view.month2.progressLabel}
              </Badge>
            ) : null}
            {view.scale ? (
              <Badge
                variant={view.scale.scaleIntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-scale"
              >
                Scale {view.scale.progressLabel}
              </Badge>
            ) : null}
            {view.seriesA ? (
              <Badge
                variant={view.seriesA.seriesAIntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-series-a"
              >
                Series A {view.seriesA.progressLabel}
              </Badge>
            ) : null}
            {view.marketLeader ? (
              <Badge
                variant={view.marketLeader.marketLeaderIntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-market-leader"
              >
                Market leader {view.marketLeader.progressLabel}
              </Badge>
            ) : null}
            {view.sustainedOps ? (
              <Badge
                variant={view.sustainedOps.sustainedOpsIntegrityFailed ? "destructive" : "outline"}
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-sustained-ops"
              >
                Sustained ops {view.sustainedOps.progressLabel}
              </Badge>
            ) : null}
            {view.improvementLoop ? (
              <Badge
                variant={
                  view.improvementLoop.improvementLoopIntegrityFailed ? "destructive" : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-improvement-loop"
              >
                Improvement loop {view.improvementLoop.progressLabel}
              </Badge>
            ) : null}
            {view.productEvolution ? (
              <Badge
                variant={
                  view.productEvolution.productEvolutionIntegrityFailed ? "destructive" : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-product-evolution"
              >
                Product evolution {view.productEvolution.progressLabel}
              </Badge>
            ) : null}
            {view.maintenanceMode ? (
              <Badge
                variant={
                  view.maintenanceMode.maintenanceModeIntegrityFailed ? "destructive" : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-maintenance-mode"
              >
                Maintenance mode {view.maintenanceMode.progressLabel}
              </Badge>
            ) : null}
            {view.engineeringTerminus ? (
              <Badge
                variant={
                  view.engineeringTerminus.engineeringTerminusIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-engineering-terminus"
              >
                Engineering path {view.engineeringTerminus.progressLabel}
              </Badge>
            ) : null}
            {view.postTerminusSteadyState ? (
              <Badge
                variant={
                  view.postTerminusSteadyState.postTerminusSteadyStateIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-post-terminus-steady-state"
              >
                Steady state {view.postTerminusSteadyState.progressLabel}
              </Badge>
            ) : null}
            {view.commercialPilotPathAbsoluteEnd ? (
              <Badge
                variant={
                  view.commercialPilotPathAbsoluteEnd.commercialPilotPathAbsoluteEndIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-commercial-pilot-path-absolute-end"
              >
                Absolute end {view.commercialPilotPathAbsoluteEnd.progressLabel}
              </Badge>
            ) : null}
            {view.linearPathPermanentlyClosed ? (
              <Badge
                variant={
                  view.linearPathPermanentlyClosed.linearPathPermanentlyClosedIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-linear-path-permanently-closed"
              >
                Linear path {view.linearPathPermanentlyClosed.progressLabel}
              </Badge>
            ) : null}
            {view.linearChainTerminusGuard ? (
              <Badge
                variant={
                  view.linearChainTerminusGuard.linearChainTerminusGuardIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-linear-chain-terminus-guard"
              >
                Step 17 {view.linearChainTerminusGuard.progressLabel}
              </Badge>
            ) : null}
            {view.era25CharterExit ? (
              <Badge
                variant={
                  view.era25CharterExit.era25CharterExitIntegrityFailed ? "destructive" : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-charter-exit"
              >
                Era25 {view.era25CharterExit.progressLabel}
              </Badge>
            ) : null}
            {view.era25FirstCharterSliceReadiness ? (
              <Badge
                variant={
                  view.era25FirstCharterSliceReadiness.era25FirstCharterSliceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-first-charter-slice"
              >
                First slice {view.era25FirstCharterSliceReadiness.progressLabel}
              </Badge>
            ) : null}
            {view.era25EngineeringGates ? (
              <Badge
                variant={
                  view.era25EngineeringGates.era25EngineeringGatesIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-engineering-gates"
              >
                Gates {view.era25EngineeringGates.progressLabel}
              </Badge>
            ) : null}
            {view.era25FirstProductSliceBlueprint ? (
              <Badge
                variant={
                  view.era25FirstProductSliceBlueprint.era25FirstProductSliceBlueprintIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-first-product-slice-blueprint"
              >
                Blueprint {view.era25FirstProductSliceBlueprint.progressLabel}
              </Badge>
            ) : null}
            {view.era25OwnerDailyBriefingBreakthrough ? (
              <Badge
                variant={
                  view.era25OwnerDailyBriefingBreakthrough.ownerDailyBriefingBreakthroughIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-owner-daily-briefing-breakthrough"
              >
                Breakthrough {view.era25OwnerDailyBriefingBreakthrough.progressLabel}
              </Badge>
            ) : null}
            {view.era25PaidPilotGoConvergence ? (
              <Badge
                variant={
                  view.era25PaidPilotGoConvergence.paidPilotGoConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-paid-pilot-go-convergence"
              >
                GO convergence {view.era25PaidPilotGoConvergence.progressLabel}
              </Badge>
            ) : null}
            {view.era25PilotWeek1ExecutionConvergence ? (
              <Badge
                variant={
                  view.era25PilotWeek1ExecutionConvergence.pilotWeek1ExecutionConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-pilot-week1-execution-convergence"
              >
                Week 1 {view.era25PilotWeek1ExecutionConvergence.progressLabel}
              </Badge>
            ) : null}
            {view.era25Month2MarketReadinessConvergence ? (
              <Badge
                variant={
                  view.era25Month2MarketReadinessConvergence.month2MarketReadinessConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-month2-market-readiness-convergence"
              >
                Month 2 {view.era25Month2MarketReadinessConvergence.progressLabel}
              </Badge>
            ) : null}
            {view.era25ScaleReadinessConvergence ? (
              <Badge
                variant={
                  view.era25ScaleReadinessConvergence.scaleReadinessConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-scale-readiness-convergence"
              >
                Scale {view.era25ScaleReadinessConvergence.progressLabel}
              </Badge>
            ) : null}
            {view.era25SeriesAPartnerExpansionConvergence ? (
              <Badge
                variant={
                  view.era25SeriesAPartnerExpansionConvergence
                    .seriesAPartnerExpansionConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-series-a-partner-expansion-convergence"
              >
                Series A {view.era25SeriesAPartnerExpansionConvergence.progressLabel}
              </Badge>
            ) : null}
            {view.era25MarketLeaderPositioningConvergence ? (
              <Badge
                variant={
                  view.era25MarketLeaderPositioningConvergence
                    .marketLeaderPositioningConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-market-leader-positioning-convergence"
              >
                Market leader {view.era25MarketLeaderPositioningConvergence.progressLabel}
              </Badge>
            ) : null}
            {view.era25SustainedOperationalExcellenceConvergence ? (
              <Badge
                variant={
                  view.era25SustainedOperationalExcellenceConvergence
                    .sustainedOperationalExcellenceConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-sustained-operational-excellence-convergence"
              >
                Sustained ops {view.era25SustainedOperationalExcellenceConvergence.progressLabel}
              </Badge>
            ) : null}
            {view.era25PureOperationalModeTerminus ? (
              <Badge
                variant={
                  view.era25PureOperationalModeTerminus.pureOperationalModeTerminusConvergenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-pure-operational-mode-terminus"
              >
                Pure ops {view.era25PureOperationalModeTerminus.progressLabel}
              </Badge>
            ) : null}
            {view.era25CommercialPilotConvergenceTrainClosure ? (
              <Badge
                variant={
                  view.era25CommercialPilotConvergenceTrainClosure
                    .era25CommercialPilotConvergenceTrainClosureIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-commercial-pilot-convergence-train-closure"
              >
                Train closure {view.era25CommercialPilotConvergenceTrainClosure.progressLabel}
              </Badge>
            ) : null}
            {view.era25SustainedProductEvolutionReentrant ? (
              <Badge
                variant={
                  view.era25SustainedProductEvolutionReentrant
                    .sustainedProductEvolutionReentrantIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-sustained-product-evolution-re-entrant"
              >
                Re-entrant {view.era25SustainedProductEvolutionReentrant.progressLabel}
              </Badge>
            ) : null}
            {view.era25PostReentrantCharterLock ? (
              <Badge
                variant={
                  view.era25PostReentrantCharterLock.era25PostReentrantCharterLockIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-post-re-entrant-charter-lock"
              >
                Charter lock {view.era25PostReentrantCharterLock.progressLabel}
              </Badge>
            ) : null}
            {view.era25SteadyStateOperatorLoopLock ? (
              <Badge
                variant={
                  view.era25SteadyStateOperatorLoopLock.era25SteadyStateOperatorLoopLockIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-steady-state-operator-loop-lock"
              >
                Steady-state {view.era25SteadyStateOperatorLoopLock.progressLabel}
              </Badge>
            ) : null}
            {view.era25CommercialPilotConvergenceTrainCapstone ? (
              <Badge
                variant={
                  view.era25CommercialPilotConvergenceTrainCapstone
                    .era25CommercialPilotConvergenceTrainCapstoneIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-commercial-pilot-convergence-train-capstone"
              >
                Capstone {view.era25CommercialPilotConvergenceTrainCapstone.progressLabel}
              </Badge>
            ) : null}
            {view.era25ConvergenceGovernanceTerminusFreeze ? (
              <Badge
                variant={
                  view.era25ConvergenceGovernanceTerminusFreeze
                    .era25ConvergenceGovernanceTerminusFreezeIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-convergence-governance-terminus-freeze"
              >
                Terminus {view.era25ConvergenceGovernanceTerminusFreeze.progressLabel}
              </Badge>
            ) : null}
            {view.era25BandAMarketProofExecutionSolePath ? (
              <Badge
                variant={
                  view.era25BandAMarketProofExecutionSolePath
                    .era25BandAMarketProofExecutionSolePathIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-band-a-market-proof-execution-sole-path"
              >
                Band A {view.era25BandAMarketProofExecutionSolePath.progressLabel}
              </Badge>
            ) : null}
            {view.era25P0MarketProofHonestClosureCapstone ? (
              <Badge
                variant={
                  view.era25P0MarketProofHonestClosureCapstone
                    .era25P0MarketProofHonestClosureCapstoneIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-p0-market-proof-honest-closure-capstone"
              >
                P0 closure {view.era25P0MarketProofHonestClosureCapstone.progressLabel}
              </Badge>
            ) : null}
            {view.era25PostMarketProofSteadyOperationalWitness ? (
              <Badge
                variant={
                  view.era25PostMarketProofSteadyOperationalWitness
                    .era25PostMarketProofSteadyOperationalWitnessIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-post-market-proof-steady-operational-witness"
              >
                Steady witness {view.era25PostMarketProofSteadyOperationalWitness.progressLabel}
              </Badge>
            ) : null}
            {view.era25GovernanceTrainTerminalSeal ? (
              <Badge
                variant={
                  view.era25GovernanceTrainTerminalSeal.era25GovernanceTrainTerminalSealIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-governance-train-terminal-seal"
              >
                Train seal {view.era25GovernanceTrainTerminalSeal.progressLabel}
              </Badge>
            ) : null}
            {view.era25PostTerminalSealCommercialOpsPermanence ? (
              <Badge
                variant={
                  view.era25PostTerminalSealCommercialOpsPermanence
                    .era25PostTerminalSealCommercialOpsPermanenceIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-post-terminal-seal-commercial-ops-permanence"
              >
                Ops permanence {view.era25PostTerminalSealCommercialOpsPermanence.progressLabel}
              </Badge>
            ) : null}
            {view.era25BandAGovernanceChainCapstoneWitness ? (
              <Badge
                variant={
                  view.era25BandAGovernanceChainCapstoneWitness
                    .era25BandAGovernanceChainCapstoneWitnessIntegrityFailed
                    ? "destructive"
                    : "outline"
                }
                className="rounded-full text-[10px] font-normal"
                data-testid="launch-wizard-today-strip-era25-band-a-governance-chain-capstone-witness"
              >
                Band A capstone {view.era25BandAGovernanceChainCapstoneWitness.progressLabel}
              </Badge>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Progress value={view.progressPercent} className="h-1.5 max-w-md" />
            <p className="text-sm font-medium text-foreground">{view.headline}</p>
            <p className="text-sm text-muted-foreground">{view.subline}</p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0 rounded-full">
          <Link href={view.href} data-testid="launch-wizard-today-strip-cta">
            {view.ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
