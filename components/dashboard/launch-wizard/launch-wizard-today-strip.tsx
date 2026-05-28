import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { launchWizardTodayStripHref } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import type { LaunchWizardModel } from "@/services/launch-wizard/launch-wizard-service";

export function LaunchWizardTodayStrip(props: { model: LaunchWizardModel }) {
  const { model } = props;
  const { progress, nextStep, commercialBlockers } = model;
  const href = launchWizardTodayStripHref(nextStep?.id ?? null);
  const blockerCount = commercialBlockers.blockers.length;

  return (
    <Card
      className="border-primary/20 bg-primary/[0.03] shadow-sm"
      data-testid="launch-wizard-today-strip"
    >
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Rocket className="h-4 w-4 text-muted-foreground" aria-hidden />
            <p className="font-medium">Launch wizard</p>
            <Badge variant="outline" className="rounded-full tabular-nums">
              {progress.completedCount}/{progress.totalCount}
            </Badge>
            {blockerCount > 0 ? (
              <Badge variant="destructive" className="rounded-full tabular-nums">
                {blockerCount} commercial blocker{blockerCount === 1 ? "" : "s"}
              </Badge>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Progress value={progress.percent} className="h-1.5 max-w-md" />
            <p className="text-sm text-muted-foreground">
              {nextStep
                ? `Next: ${nextStep.title}`
                : "Setup steps complete — confirm commercial GO/NO-GO before cutover."}
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0 rounded-full">
          <Link href={href} data-testid="launch-wizard-today-strip-cta">
            {nextStep ? nextStep.ctaLabel : "Open launch wizard"}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
