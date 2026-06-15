import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FIFTEEN_MINUTE_ONBOARDING_P3_142_COMPETITOR,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_E2E_SPEC,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_HEADLINE,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_PAGE_MODULE,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_ROUTE,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_TARGET_MINUTES,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_WIZARD_MODULE,
} from "@/lib/onboarding/fifteen-minute-onboarding-p3-142-policy";

export type FifteenMinuteOnboardingStepRecord = {
  id: string;
  label: string;
  status: string;
};

export type FifteenMinuteOnboardingRegistry = {
  version: string;
  policyId: typeof FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  competitor: string;
  targetMinutes: number;
  route: string;
  completedCount: number;
  steps: FifteenMinuteOnboardingStepRecord[];
};

export function loadFifteenMinuteOnboardingRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/fifteen-minute-onboarding-registry.json",
): FifteenMinuteOnboardingRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as FifteenMinuteOnboardingRegistry;
}

export function validateFifteenMinuteOnboardingRegistry(
  registry: FifteenMinuteOnboardingRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  competitorMatches: boolean;
  stepsComplete: boolean;
  zeroCompleted: boolean;
} {
  const policyIdMatches = registry.policyId === FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID;

  const competitorMatches = registry.competitor === FIFTEEN_MINUTE_ONBOARDING_P3_142_COMPETITOR;

  const stepsComplete =
    registry.targetMinutes === FIFTEEN_MINUTE_ONBOARDING_P3_142_TARGET_MINUTES &&
    registry.route === FIFTEEN_MINUTE_ONBOARDING_P3_142_ROUTE &&
    registry.steps.length === FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS.length &&
    FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS.every((stepId, index) => {
      const step = registry.steps[index];
      return step?.id === stepId && step.status === "shipped";
    });

  const zeroCompleted = registry.completedCount === 0;

  const valid = policyIdMatches && competitorMatches && stepsComplete && zeroCompleted;

  return {
    valid,
    policyIdMatches,
    competitorMatches,
    stepsComplete,
    zeroCompleted,
  };
}

export function checkFifteenMinuteOnboardingLiveWiring(root = process.cwd()): boolean {
  const wizardPath = join(root, FIFTEEN_MINUTE_ONBOARDING_P3_142_WIZARD_MODULE);
  const pagePath = join(root, FIFTEEN_MINUTE_ONBOARDING_P3_142_PAGE_MODULE);
  const e2ePath = join(root, FIFTEEN_MINUTE_ONBOARDING_P3_142_E2E_SPEC);

  if (!existsSync(wizardPath) || !existsSync(pagePath) || !existsSync(e2ePath)) {
    return false;
  }

  const wizardSource = readFileSync(wizardPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");
  const e2eSource = readFileSync(e2ePath, "utf8");

  const wizardWired =
    wizardSource.includes(`TARGET_MINUTES = ${FIFTEEN_MINUTE_ONBOARDING_P3_142_TARGET_MINUTES}`) &&
    FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS.every((stepId) => wizardSource.includes(`"${stepId}"`)) &&
    wizardSource.includes(FIFTEEN_MINUTE_ONBOARDING_P3_142_HEADLINE) &&
    wizardSource.includes("quick-start-timer");

  const pageWired =
    pageSource.includes(FIFTEEN_MINUTE_ONBOARDING_P3_142_ROUTE.replace("/dashboard/", "")) ||
    pageSource.includes("QuickStartWizard");

  const e2eWired =
    e2eSource.includes(FIFTEEN_MINUTE_ONBOARDING_P3_142_ROUTE) &&
    e2eSource.includes("quick-start-timer") &&
    e2eSource.toLowerCase().includes("first order in about 15 minutes");

  return wizardWired && pageWired && e2eWired;
}
