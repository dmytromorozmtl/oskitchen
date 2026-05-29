import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, AlertTriangle, Rocket } from "lucide-react";

import { LaunchWizardCommercialBlockersPanel } from "@/components/dashboard/launch-wizard/launch-wizard-commercial-blockers-panel";
import { LaunchWizardFromGoLiveBanner } from "@/components/dashboard/launch-wizard/launch-wizard-from-go-live-banner";
import type { LaunchWizardFromGoLiveBannerModel } from "@/lib/launch-wizard/launch-wizard-from-go-live-era21";
import { LaunchWizardGoldenPathPanel } from "@/components/dashboard/launch-wizard/launch-wizard-golden-path-panel";
import { LaunchWizardCommercialGoClosurePanel } from "@/components/dashboard/launch-wizard/launch-wizard-commercial-go-closure-panel";
import { LaunchWizardPilotWeek1Panel } from "@/components/dashboard/launch-wizard/launch-wizard-pilot-week1-panel";
import { LaunchWizardMonth2Panel } from "@/components/dashboard/launch-wizard/launch-wizard-month2-panel";
import { LaunchWizardScalePanel } from "@/components/dashboard/launch-wizard/launch-wizard-scale-panel";
import { LaunchWizardSeriesAPanel } from "@/components/dashboard/launch-wizard/launch-wizard-series-a-panel";
import { LaunchWizardMarketLeaderPanel } from "@/components/dashboard/launch-wizard/launch-wizard-market-leader-panel";
import { LaunchWizardSustainedOpsPanel } from "@/components/dashboard/launch-wizard/launch-wizard-sustained-ops-panel";
import { LaunchWizardImprovementLoopPanel } from "@/components/dashboard/launch-wizard/launch-wizard-improvement-loop-panel";
import { LaunchWizardCommercialInflectionPanel } from "@/components/dashboard/launch-wizard/launch-wizard-commercial-inflection-panel";
import { LaunchWizardTier2StatusPanel } from "@/components/dashboard/launch-wizard/launch-wizard-tier2-status-panel";
import { LaunchWizardOnboardingHero } from "@/components/dashboard/launch-wizard/launch-wizard-onboarding-hero";
import { LaunchWizardProductionGradeBanner } from "@/components/dashboard/launch-wizard/launch-wizard-production-grade-banner";
import { LaunchWizardProgressStrip } from "@/components/dashboard/launch-wizard/launch-wizard-progress-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LaunchWizardStep, LaunchWizardStepStatus } from "@/lib/launch-wizard/launch-wizard-era19";
import type { LaunchWizardOperatorLink } from "@/lib/launch-wizard/launch-wizard-kds-production-era19";
import {
  buildLaunchWizardOnboardingHeroModel,
} from "@/lib/launch-wizard/launch-wizard-onboarding-convergence-era19";
import {
  launchWizardProgressAriaLabel,
  launchWizardStepStatusAriaLabel,
  launchWizardToggleModeHref,
} from "@/lib/launch-wizard/launch-wizard-ux-era19";
import type { LaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";
import { cn } from "@/lib/utils";

function statusBadge(status: LaunchWizardStepStatus): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  switch (status) {
    case "complete":
      return { label: "Complete", variant: "default" };
    case "in_progress":
      return { label: "In progress", variant: "secondary" };
    case "blocked":
      return { label: "Blocked", variant: "destructive" };
    default:
      return { label: "Not started", variant: "outline" };
  }
}

function statusIcon(status: LaunchWizardStepStatus) {
  if (status === "complete") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />;
  }
  if (status === "blocked") {
    return <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />;
  }
  return <Circle className="h-5 w-5 text-muted-foreground" aria-hidden />;
}

export function LaunchWizardView(props: {
  model: LaunchWizardModel;
  compact?: boolean;
  fromGoLiveBanner?: LaunchWizardFromGoLiveBannerModel | null;
}) {
  const { model, compact = false, fromGoLiveBanner = null } = props;
  const { progress, nextStep } = model;
  const onboardingHero = buildLaunchWizardOnboardingHeroModel({
    progress,
    nextStep,
    compact,
  });

  return (
    <div className="space-y-6" data-testid="launch-wizard-view">
      {fromGoLiveBanner ? <LaunchWizardFromGoLiveBanner model={fromGoLiveBanner} /> : null}

      <LaunchWizardProgressStrip model={model} compact={compact} />

      <LaunchWizardProductionGradeBanner snapshot={model.productionGrade} compact={compact} />

      {onboardingHero ? <LaunchWizardOnboardingHero model={onboardingHero} /> : null}

      <Card className="border-primary/20 bg-primary/[0.03] shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Rocket className="h-5 w-5 shrink-0 text-muted-foreground sm:h-6 sm:w-6" aria-hidden />
                Launch wizard
              </CardTitle>
              <CardDescription className="mt-1 max-w-2xl">{model.headline}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full tabular-nums">
                {progress.completedCount}/{progress.totalCount} complete
              </Badge>
              <Button asChild variant="ghost" size="sm" className="hidden rounded-full lg:inline-flex">
                <Link href={launchWizardToggleModeHref(compact)} data-testid="launch-wizard-mode-toggle-desktop">
                  {compact ? "Switch to full view" : "Switch to compact view"}
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Launch progress</span>
              <span className="font-medium tabular-nums">{progress.percent}%</span>
            </div>
            <Progress
              value={progress.percent}
              className="h-2"
              aria-label={launchWizardProgressAriaLabel(progress)}
            />
          </div>
          {!onboardingHero && nextStep ? (
            <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Next best setup step
              </p>
              <p className="mt-1 font-medium">{nextStep.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{nextStep.summary}</p>
              <Button asChild size="sm" className="mt-3 w-full rounded-full sm:w-auto">
                <Link href={nextStep.href} data-testid="launch-wizard-next-step">
                  {nextStep.ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : !onboardingHero ? (
            <p className="text-sm text-muted-foreground">
              All wizard steps are complete — confirm commercial GO/NO-GO before paid pilot cutover.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {model.commercialInflection ? (
        <LaunchWizardCommercialInflectionPanel slice={model.commercialInflection} />
      ) : null}

      {model.commercialGoClosureIntegrity ? (
        <LaunchWizardCommercialGoClosurePanel slice={model.commercialGoClosureIntegrity} />
      ) : null}

      {model.pilotWeek1Integrity ? (
        <LaunchWizardPilotWeek1Panel slice={model.pilotWeek1Integrity} />
      ) : null}

      {model.month2MarketReadinessIntegrity ? (
        <LaunchWizardMonth2Panel slice={model.month2MarketReadinessIntegrity} />
      ) : null}

      {model.scaleReadinessIntegrity ? (
        <LaunchWizardScalePanel slice={model.scaleReadinessIntegrity} />
      ) : null}

      {model.seriesAPartnerExpansionIntegrity ? (
        <LaunchWizardSeriesAPanel slice={model.seriesAPartnerExpansionIntegrity} />
      ) : null}

      {model.marketLeaderPositioningIntegrity ? (
        <LaunchWizardMarketLeaderPanel slice={model.marketLeaderPositioningIntegrity} />
      ) : null}

      {model.sustainedOperationalExcellenceIntegrity ? (
        <LaunchWizardSustainedOpsPanel slice={model.sustainedOperationalExcellenceIntegrity} />
      ) : null}

      {model.continuousImprovementLoopIntegrity ? (
        <LaunchWizardImprovementLoopPanel slice={model.continuousImprovementLoopIntegrity} />
      ) : null}

      <LaunchWizardCommercialBlockersPanel
        slice={model.commercialBlockers}
        setup={model.commercialSetup}
        commercialGoClosure={model.commercialGoClosure}
        pilotWeek1={model.pilotWeek1}
        month2MarketReadiness={model.month2MarketReadiness}
        scaleReadiness={model.scaleReadiness}
        seriesAPartnerExpansion={model.seriesAPartnerExpansion}
        marketLeaderPositioning={model.marketLeaderPositioning}
        sustainedOperationalExcellence={model.sustainedOperationalExcellence}
        paidPilotGoConvergence={model.paidPilotGoConvergence}
        pilotWeek1ExecutionConvergence={
          model.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence ?? null
        }
        month2MarketReadinessConvergence={
          model.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
            ?.month2MarketReadinessConvergence ?? null
        }
        scaleReadinessConvergence={
          model.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
            ?.month2MarketReadinessConvergence?.scaleReadinessConvergence ?? null
        }
        seriesAPartnerExpansionConvergence={
          model.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
            ?.month2MarketReadinessConvergence?.scaleReadinessConvergence
            ?.seriesAPartnerExpansionConvergence ?? null
        }
        marketLeaderPositioningConvergence={
          model.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
            ?.month2MarketReadinessConvergence?.scaleReadinessConvergence
            ?.seriesAPartnerExpansionConvergence?.marketLeaderPositioningConvergence ?? null
        }
        sustainedOperationalExcellenceConvergence={
          model.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
            ?.month2MarketReadinessConvergence?.scaleReadinessConvergence
            ?.seriesAPartnerExpansionConvergence?.marketLeaderPositioningConvergence
            ?.sustainedOperationalExcellenceConvergence ?? null
        }
        pureOperationalModeEra25Active={
          model.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
            ?.month2MarketReadinessConvergence?.scaleReadinessConvergence
            ?.seriesAPartnerExpansionConvergence?.marketLeaderPositioningConvergence
            ?.sustainedOperationalExcellenceConvergence?.pureOperationalModeTerminus
            ?.pureOperationalModeEra25Active ?? false
        }
        compact={compact}
      />

      <LaunchWizardTier2StatusPanel slice={model.tier2Status} />

      <LaunchWizardGoldenPathPanel steps={model.steps} compact={compact} />

      <div
        className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2")}
        role="list"
        aria-label="Launch setup steps"
      >
        {model.steps.map((step) => (
          <LaunchWizardStepCard key={step.id} step={step} compact={compact} />
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Advanced launch validation (go-live projects, simulations):{" "}
        <Link
          href="/dashboard/go-live?mode=advanced"
          className="font-medium text-primary underline-offset-4 hover:underline"
          data-testid="launch-wizard-advanced-go-live-link"
        >
          Open go-live hub
        </Link>
      </p>
    </div>
  );
}

function LaunchWizardStepCard(props: { step: LaunchWizardStep; compact?: boolean }) {
  const { step, compact = false } = props;
  const badge = statusBadge(step.status);
  const titleId = `launch-wizard-step-title-${step.id}`;

  return (
    <Card
      className={cn(
        "border-border/80 shadow-sm scroll-mt-28 lg:scroll-mt-24",
        step.status === "blocked" && "border-amber-200/80 bg-amber-50/20 dark:border-amber-900/40",
        step.status === "complete" && "border-emerald-200/60 bg-emerald-50/10 dark:border-emerald-900/30",
      )}
      data-testid={`launch-wizard-step-${step.id}`}
      id={`launch-wizard-step-${step.id}`}
      role="listitem"
      aria-labelledby={titleId}
    >
      <CardHeader className={cn("pb-2", compact && "py-3")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span aria-label={launchWizardStepStatusAriaLabel(step.status)}>{statusIcon(step.status)}</span>
            <div className="min-w-0">
              <CardTitle id={titleId} className="text-base">
                <span className="mr-2 text-xs font-normal text-muted-foreground tabular-nums">
                  {step.order}.
                </span>
                {step.title}
              </CardTitle>
              {!compact ? (
                <CardDescription className="mt-1">{step.summary}</CardDescription>
              ) : null}
            </div>
          </div>
          <Badge variant={badge.variant} className="shrink-0 rounded-full text-[10px]">
            {badge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "pt-0")}>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full capitalize">
            {step.ownerRole}
          </Badge>
          <span className="truncate">Evidence: {step.evidenceSource}</span>
        </div>
        {step.missingItems.length > 0 ? (
          <ul className="space-y-1 text-sm text-muted-foreground" aria-label="Missing items">
            {step.missingItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No missing items for this step.</p>
        )}
        {step.setupGuidance ? (
          <p className="text-sm text-muted-foreground">{step.setupGuidance}</p>
        ) : null}
        {step.operatorLinks && step.operatorLinks.length > 0 ? (
          <LaunchWizardOperatorLinksPanel
            stepId={step.id}
            links={step.operatorLinks}
            anchor={step.operatorLinksAnchor}
          />
        ) : null}
        <Button
          asChild
          variant={step.status === "blocked" ? "default" : "outline"}
          size="sm"
          className="w-full rounded-full sm:w-auto"
        >
          <Link href={step.href} data-testid={`launch-wizard-step-cta-${step.id}`}>
            {step.ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LaunchWizardOperatorLinksPanel(props: {
  stepId: string;
  links: readonly LaunchWizardOperatorLink[];
  anchor?: string;
}) {
  const panelId = props.anchor ?? `launch-wizard-step-${props.stepId}-operator-links`;

  return (
    <div
      id={panelId}
      className="space-y-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-3"
      data-testid={`launch-wizard-step-${props.stepId}-operator-links`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Operator workflows
      </p>
      <ul className="space-y-2" aria-label="Operator workflow links">
        {props.links.map((link) => (
          <li key={link.id} className="space-y-1">
            {link.blocked ? (
              <div className="text-sm">
                <p className="font-medium text-muted-foreground">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.blockedReason ?? link.detail}</p>
              </div>
            ) : (
              <Link
                href={link.href}
                className="group block rounded-md text-sm transition-colors hover:bg-background/80"
                data-testid={`launch-wizard-operator-link-${link.id}`}
              >
                <span className="font-medium text-foreground group-hover:underline">{link.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{link.detail}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
