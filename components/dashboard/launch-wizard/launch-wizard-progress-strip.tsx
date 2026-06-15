"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  buildLaunchWizardStepNavItems,
  launchWizardProgressAriaLabel,
  launchWizardStepStatusAriaLabel,
  launchWizardToggleModeHref,
  pickLaunchWizardStickyNextStepLabel,
} from "@/lib/launch-wizard/launch-wizard-ux-era19";
import type { LaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";
import { cn } from "@/lib/utils";

function stepNavTone(status: string, isNext: boolean): string {
  if (isNext) {
    return "border-primary bg-primary/10 text-primary";
  }
  if (status === "complete") {
    return "border-emerald-200/80 bg-emerald-50/40 text-emerald-900 dark:border-emerald-900/40 dark:text-emerald-100";
  }
  if (status === "blocked") {
    return "border-amber-200/80 bg-amber-50/40 text-amber-900 dark:border-amber-900/40 dark:text-amber-100";
  }
  return "border-border/70 bg-background/80 text-muted-foreground";
}

export function LaunchWizardProgressStrip(props: {
  model: LaunchWizardModel;
  compact: boolean;
}) {
  const { model, compact } = props;
  const { progress, nextStep } = model;
  const navItems = buildLaunchWizardStepNavItems({
    steps: model.steps,
    nextStepId: nextStep?.id ?? null,
    compact,
  });

  return (
    <div
      className="sticky top-0 z-20 -mx-4 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
      data-testid="launch-wizard-progress-strip"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full tabular-nums">
                {progress.completedCount}/{progress.totalCount}
              </Badge>
              {progress.blockedCount > 0 ? (
                <Badge variant="destructive" className="rounded-full tabular-nums">
                  {progress.blockedCount} blocked
                </Badge>
              ) : null}
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {progress.percent}%
              </span>
            </div>
            <Progress
              value={progress.percent}
              className="h-1.5"
              aria-label={launchWizardProgressAriaLabel(progress)}
            />
            <p className="text-sm text-muted-foreground line-clamp-1">
              {pickLaunchWizardStickyNextStepLabel(nextStep)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs">
              <Link href={launchWizardToggleModeHref(compact)} data-testid="launch-wizard-mode-toggle">
                {compact ? "Full view" : "Compact"}
              </Link>
            </Button>
            {nextStep ? (
              <Button asChild size="sm" className="rounded-full">
                <Link href={nextStep.href} data-testid="launch-wizard-sticky-next-step">
                  Continue
                  <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <nav
          aria-label="Launch wizard steps"
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              data-testid={`launch-wizard-step-nav-${item.id}`}
              aria-label={`${item.order}. ${item.title} — ${launchWizardStepStatusAriaLabel(item.status)}`}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-90",
                stepNavTone(item.status, item.isNext),
              )}
            >
              <span className="tabular-nums">{item.order}</span>
              <span>{item.shortTitle}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
