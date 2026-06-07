"use client";

import { OnboardingStepper } from "@/components/onboarding/onboarding-stepper";
import type { OnboardingStepIndicatorProps } from "@/components/onboarding/onboarding-wizard/onboarding-wizard-types";

export function OnboardingStepIndicator(props: OnboardingStepIndicatorProps) {
  return (
    <OnboardingStepper
      steps={liveFlow.steps}
      currentStepIndex={stepIndex}
      launchProgressPercent={launchProgress}
      onStepClick={(index) => setStepIndex(index)}
    />
  );
}
