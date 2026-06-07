import { describe, expect, it } from "vitest";

import {
  ONBOARDING_WIZARD_PATH,
  ONBOARDING_WIZARD_SECTIONS,
  ONBOARDING_WIZARD_SPLIT_BASELINE_LINES,
  ONBOARDING_WIZARD_SPLIT_POLICY_ID,
  auditOnboardingWizardSplitFromRoot,
} from "@/lib/onboarding/onboarding-wizard-split-policy";

describe("onboarding wizard split absolute final (Task 38)", () => {
  it("locks split policy id and three section modules", () => {
    expect(ONBOARDING_WIZARD_SPLIT_POLICY_ID).toBe("onboarding-wizard-split-absolute-final-v1");
    expect(ONBOARDING_WIZARD_SECTIONS).toEqual([
      "components/onboarding/onboarding-wizard/step-indicator.tsx",
      "components/onboarding/onboarding-wizard/step-content.tsx",
      "components/onboarding/onboarding-wizard/step-navigation.tsx",
    ]);
    expect(ONBOARDING_WIZARD_PATH).toBe("components/onboarding/onboarding-wizard.tsx");
  });

  it("composes wizard from StepIndicator, StepContent, and StepNavigation", () => {
    const audit = auditOnboardingWizardSplitFromRoot();
    expect(audit.wizardUsesSectionComposition).toBe(true);
    expect(audit.sectionCount).toBe(3);
  });

  it("shrinks onboarding-wizard below the pre-split baseline", () => {
    const audit = auditOnboardingWizardSplitFromRoot();
    expect(audit.wizardLineCount).toBeLessThan(ONBOARDING_WIZARD_SPLIT_BASELINE_LINES);
    expect(audit.passed).toBe(true);
  });
});
