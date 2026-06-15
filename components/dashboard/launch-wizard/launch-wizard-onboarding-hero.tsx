import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { LaunchWizardOnboardingHeroModel } from "@/lib/launch-wizard/launch-wizard-onboarding-convergence-era19";

export function LaunchWizardOnboardingHero(props: { model: LaunchWizardOnboardingHeroModel }) {
  const { model } = props;

  return (
    <Card
      id="launch-wizard-onboarding-hero"
      className="scroll-mt-28 border-primary/20 bg-primary/[0.03] shadow-sm lg:scroll-mt-24"
      data-testid="launch-wizard-onboarding-hero"
    >
      <CardContent className="space-y-4 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <Compass className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Onboarding path
            </p>
            <h2 className="text-base font-semibold leading-snug sm:text-lg">{model.headline}</h2>
            <p className="text-sm text-muted-foreground">{model.subline}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild size="sm" className="w-full rounded-full sm:w-auto">
            <Link href={model.workflowHref} data-testid="launch-wizard-onboarding-hero-continue">
              {model.ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full rounded-full sm:w-auto">
            <Link href={model.stepAnchorHref} data-testid="launch-wizard-onboarding-hero-step">
              View step checklist
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
