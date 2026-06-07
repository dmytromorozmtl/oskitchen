"use client";

import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import type { OnboardingStepIndicatorProps } from "@/components/onboarding/onboarding-wizard/onboarding-wizard-types";

export function OnboardingStepIndicator({
  steps,
  currentStepIndex,
  launchProgressPercent,
  onStepClick,
}: OnboardingStepIndicatorProps) {
  return (
    <OnboardingStepper
      steps={steps}
      currentStepIndex={currentStepIndex}
      launchProgressPercent={launchProgressPercent}
      onStepClick={onStepClick}
    />
  );
}
