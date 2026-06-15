import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkFifteenMinuteOnboardingLiveWiring,
  loadFifteenMinuteOnboardingRegistry,
  validateFifteenMinuteOnboardingRegistry,
} from "@/lib/onboarding/fifteen-minute-onboarding-p3-142-operations";
import {
  FIFTEEN_MINUTE_ONBOARDING_P3_142_ARTIFACT,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_COMPETITOR,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_DOC,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_HEADLINE,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_HONESTY_MARKERS,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_IMPLEMENTATION_REFS,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_RELATED_DOCS,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_ROUTE,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_TARGET_MINUTES,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_WIRING_PATHS,
} from "@/lib/onboarding/fifteen-minute-onboarding-p3-142-policy";

export type FifteenMinuteOnboardingP3_142AuditSummary = {
  policyId: typeof FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  liveWizardWiringPassed: boolean;
  relatedDocsReferenced: boolean;
  stepsDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditFifteenMinuteOnboardingP3_142(
  root = process.cwd(),
): FifteenMinuteOnboardingP3_142AuditSummary {
  const wiringComplete = FIFTEEN_MINUTE_ONBOARDING_P3_142_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let stepsDocumented = false;

  if (existsSync(join(root, FIFTEEN_MINUTE_ONBOARDING_P3_142_DOC))) {
    const source = readFileSync(join(root, FIFTEEN_MINUTE_ONBOARDING_P3_142_DOC), "utf8");
    docWired =
      source.includes(FIFTEEN_MINUTE_ONBOARDING_P3_142_HEADLINE) &&
      source.includes(FIFTEEN_MINUTE_ONBOARDING_P3_142_COMPETITOR) &&
      source.includes(String(FIFTEEN_MINUTE_ONBOARDING_P3_142_TARGET_MINUTES)) &&
      source.includes(FIFTEEN_MINUTE_ONBOARDING_P3_142_ROUTE) &&
      source.includes(FIFTEEN_MINUTE_ONBOARDING_P3_142_IMPLEMENTATION_REFS.singleOnboardingEntry);
    relatedDocsReferenced = FIFTEEN_MINUTE_ONBOARDING_P3_142_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    stepsDocumented = FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS.every((stepId) =>
      source.includes(stepId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, FIFTEEN_MINUTE_ONBOARDING_P3_142_ARTIFACT))) {
    const registry = loadFifteenMinuteOnboardingRegistry(root);
    registryValid = validateFifteenMinuteOnboardingRegistry(registry).valid;
  }

  const liveWizardWiringPassed = checkFifteenMinuteOnboardingLiveWiring(root);

  const combinedSources = [
    FIFTEEN_MINUTE_ONBOARDING_P3_142_DOC,
    FIFTEEN_MINUTE_ONBOARDING_P3_142_ARTIFACT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = FIFTEEN_MINUTE_ONBOARDING_P3_142_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    liveWizardWiringPassed &&
    relatedDocsReferenced &&
    stepsDocumented &&
    honestyMarkersPresent;

  return {
    policyId: FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    liveWizardWiringPassed,
    relatedDocsReferenced,
    stepsDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatFifteenMinuteOnboardingP3_142AuditLines(
  summary: FifteenMinuteOnboardingP3_142AuditSummary,
): string[] {
  return [
    `15-minute onboarding audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${FIFTEEN_MINUTE_ONBOARDING_P3_142_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live Quick Start wizard: ${summary.liveWizardWiringPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `3 steps documented: ${summary.stepsDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
