import type { BusinessType } from "@prisma/client";

import { buildOnboardingStepOrder } from "./onboarding-business-modes";
import { describeOnboardingSteps } from "./onboarding-steps";
import type { OnboardingFlowStep, OnboardingStepId, OperatingModelId } from "./onboarding-types";

export type BuiltOnboardingFlow = {
  stepIds: readonly OnboardingStepId[];
  steps: OnboardingFlowStep[];
};

export function buildOnboardingFlow(input: {
  businessType: BusinessType | null | undefined;
  operatingModel: OperatingModelId | null | undefined;
}): BuiltOnboardingFlow {
  const stepIds = buildOnboardingStepOrder(input);
  return { stepIds, steps: describeOnboardingSteps(stepIds) };
}
