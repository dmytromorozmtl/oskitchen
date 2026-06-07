"use client";

import type { OnboardingStepNavigationProps } from "@/components/onboarding/onboarding-wizard/onboarding-wizard-types";
import { Button } from "@/components/ui/button";

export function OnboardingStepNavigation({
  stepIndex,
  pending,
  onBack,
}: OnboardingStepNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-full"
        disabled={stepIndex === 0 || pending}
        onClick={onBack}
      >
        Back
      </Button>
      <span className="text-xs text-muted-foreground">Autosave on Continue</span>
    </div>
  );
}
