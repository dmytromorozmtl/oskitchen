import { describe, expect, it } from "vitest";

import { buildOnboardingFlow } from "@/lib/onboarding/onboarding-flow-builder";
import { resolveInitialWizardStepIndex } from "@/services/onboarding/onboarding-service";

describe("resolveInitialWizardStepIndex", () => {
  const flow = buildOnboardingFlow({
    businessType: "MEAL_PREP",
    operatingModel: "WEEKLY_PREORDERS",
  });

  it("uses adaptive onboardingStep as direct index (not legacy fulfillment jump)", () => {
    const idx = resolveInitialWizardStepIndex({
      onboardingStep: 1,
      onboardingCompleted: false,
      businessName: "Test Kitchen",
      adaptive: { schemaVersion: 1, welcomeSeenAt: new Date().toISOString() },
      stepIds: flow.stepIds,
    });
    expect(flow.stepIds[idx]).toBe("business_profile");
  });

  it("resumes at first incomplete step when completedStepIds present", () => {
    const idx = resolveInitialWizardStepIndex({
      onboardingStep: 3,
      onboardingCompleted: false,
      businessName: "Test Kitchen",
      adaptive: {
        schemaVersion: 2,
        completedStepIds: ["welcome", "business_profile", "operating_model"],
      },
      stepIds: flow.stepIds,
    });
    expect(flow.stepIds[idx]).toBe("fulfillment");
  });

  it("advances past skipped steps on refresh", () => {
    const idx = resolveInitialWizardStepIndex({
      onboardingStep: 4,
      onboardingCompleted: false,
      businessName: "Test Kitchen",
      adaptive: {
        schemaVersion: 2,
        completedStepIds: ["welcome", "business_profile", "operating_model"],
        skippedStepIds: ["fulfillment"],
      },
      stepIds: flow.stepIds,
    });
    expect(flow.stepIds[idx]).not.toBe("fulfillment");
    expect(flow.stepIds[idx]).toBe("weekly_menu");
  });
});
