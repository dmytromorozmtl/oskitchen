import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Absolute Final Task 38 — split onboarding-wizard into StepIndicator, StepContent, StepNavigation.
 */

export const ONBOARDING_WIZARD_SPLIT_POLICY_ID = "onboarding-wizard-split-absolute-final-v1" as const;

export const ONBOARDING_WIZARD_PATH = "components/onboarding/onboarding-wizard.tsx" as const;

export const ONBOARDING_WIZARD_SECTIONS = [
  "components/onboarding/onboarding-wizard/step-indicator.tsx",
  "components/onboarding/onboarding-wizard/step-content.tsx",
  "components/onboarding/onboarding-wizard/step-navigation.tsx",
] as const;

export const ONBOARDING_WIZARD_SPLIT_BASELINE_LINES = 940 as const;

export const ONBOARDING_WIZARD_SPLIT_CI_SCRIPTS = ["test:ci:onboarding-wizard-split"] as const;

export type OnboardingWizardSplitAudit = {
  policyId: typeof ONBOARDING_WIZARD_SPLIT_POLICY_ID;
  sectionCount: number;
  sectionLineCounts: Record<(typeof ONBOARDING_WIZARD_SECTIONS)[number], number>;
  wizardLineCount: number;
  wizardUsesSectionComposition: boolean;
  passed: boolean;
};

function countLines(root: string, relativePath: string): number {
  return readFileSync(join(root, relativePath), "utf8").split("\n").length;
}

export function auditOnboardingWizardSplitFromRoot(root = process.cwd()): OnboardingWizardSplitAudit {
  const wizardSource = readFileSync(join(root, ONBOARDING_WIZARD_PATH), "utf8");
  const sectionLineCounts = Object.fromEntries(
    ONBOARDING_WIZARD_SECTIONS.map((path) => [path, countLines(root, path)]),
  ) as OnboardingWizardSplitAudit["sectionLineCounts"];

  const wizardUsesSectionComposition =
    wizardSource.includes("<OnboardingStepIndicator") &&
    wizardSource.includes("<OnboardingStepContent") &&
    wizardSource.includes("<OnboardingStepNavigation");

  const wizardLineCount = countLines(root, ONBOARDING_WIZARD_PATH);

  return {
    policyId: ONBOARDING_WIZARD_SPLIT_POLICY_ID,
    sectionCount: ONBOARDING_WIZARD_SECTIONS.length,
    sectionLineCounts,
    wizardLineCount,
    wizardUsesSectionComposition,
    passed:
      ONBOARDING_WIZARD_SECTIONS.length === 3 &&
      wizardUsesSectionComposition &&
      wizardLineCount < ONBOARDING_WIZARD_SPLIT_BASELINE_LINES,
  };
}
