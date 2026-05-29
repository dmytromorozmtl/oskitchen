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
