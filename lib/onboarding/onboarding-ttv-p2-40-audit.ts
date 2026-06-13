import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computeOnboardingTtvMinutes,
  evaluateOnboardingTtvStatus,
} from "@/lib/onboarding/onboarding-ttv-p2-40-measurement";
import {
  ONBOARDING_TTV_P2_40_ARTIFACT,
  ONBOARDING_TTV_P2_40_DOC,
  ONBOARDING_TTV_P2_40_FLOW_STEPS,
  ONBOARDING_TTV_P2_40_HONESTY_MARKERS,
  ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT,
  ONBOARDING_TTV_P2_40_ORDER_HOOK,
  ONBOARDING_TTV_P2_40_POLICY_ID,
  ONBOARDING_TTV_P2_40_SERVICE,
  ONBOARDING_TTV_P2_40_STRIP,
  ONBOARDING_TTV_P2_40_STRIP_TEST_ID,
  ONBOARDING_TTV_P2_40_TARGET_MINUTES,
  ONBOARDING_TTV_P2_40_TODAY_ROUTE,
  ONBOARDING_TTV_P2_40_WIRING_PATHS,
} from "@/lib/onboarding/onboarding-ttv-p2-40-policy";

export type OnboardingTtvP2_40AuditSummary = {
  policyId: typeof ONBOARDING_TTV_P2_40_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  measurementWired: boolean;
  recordHookWired: boolean;
  serviceWired: boolean;
  stripWired: boolean;
  todayPageWired: boolean;
  goldenTtvOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditOnboardingTtvP2_40(root = process.cwd()): OnboardingTtvP2_40AuditSummary {
  const wiringComplete = ONBOARDING_TTV_P2_40_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, ONBOARDING_TTV_P2_40_DOC))) {
    const source = readFileSync(join(root, ONBOARDING_TTV_P2_40_DOC), "utf8");
    docWired =
      source.includes(ONBOARDING_TTV_P2_40_TODAY_ROUTE) &&
      source.includes(String(ONBOARDING_TTV_P2_40_TARGET_MINUTES)) &&
      source.includes(ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT);
  }

  let measurementWired = false;
  const measurementPath = join(root, "lib/onboarding/onboarding-ttv-p2-40-measurement.ts");
  if (existsSync(measurementPath)) {
    const source = readFileSync(measurementPath, "utf8");
    measurementWired =
      source.includes("computeOnboardingTtvMinutes") &&
      source.includes("evaluateOnboardingTtvStatus") &&
      source.includes("formatOnboardingTtvHeadline");
  }

  let recordHookWired = false;
  if (existsSync(join(root, ONBOARDING_TTV_P2_40_ORDER_HOOK))) {
    const source = readFileSync(join(root, ONBOARDING_TTV_P2_40_ORDER_HOOK), "utf8");
    recordHookWired =
      source.includes("recordOnboardingTtvOnFirstOrder") &&
      source.includes("runCanonicalOrderSideEffects");
  }

  let serviceWired = false;
  if (existsSync(join(root, ONBOARDING_TTV_P2_40_SERVICE))) {
    const source = readFileSync(join(root, ONBOARDING_TTV_P2_40_SERVICE), "utf8");
    serviceWired =
      source.includes("loadOnboardingTtvMeasurement") &&
      source.includes("evaluateOnboardingTtvStatus");
  }

  let stripWired = false;
  if (existsSync(join(root, ONBOARDING_TTV_P2_40_STRIP))) {
    const source = readFileSync(join(root, ONBOARDING_TTV_P2_40_STRIP), "utf8");
    stripWired =
      source.includes(ONBOARDING_TTV_P2_40_STRIP_TEST_ID) &&
      source.includes("targetMinutes") &&
      source.includes("ttvMinutes");
  }

  let todayPageWired = false;
  const todayPath = join(root, "app/dashboard/today/page.tsx");
  if (existsSync(todayPath)) {
    const source = readFileSync(todayPath, "utf8");
    todayPageWired =
      source.includes("OnboardingTtvStrip") &&
      source.includes("loadOnboardingTtvMeasurement");
  }

  const signupAt = new Date("2026-06-14T10:00:00.000Z");
  const firstOrderAt = new Date("2026-06-14T10:22:00.000Z");
  const goldenTtvOk =
    computeOnboardingTtvMinutes(signupAt, firstOrderAt) === 22 &&
    evaluateOnboardingTtvStatus({ signupAt, firstOrderAt }).status === "met_target";

  const combined = [ONBOARDING_TTV_P2_40_DOC, ONBOARDING_TTV_P2_40_STRIP]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = ONBOARDING_TTV_P2_40_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const registryPresent = existsSync(join(root, ONBOARDING_TTV_P2_40_ARTIFACT));

  const passed =
    wiringComplete &&
    docWired &&
    measurementWired &&
    recordHookWired &&
    serviceWired &&
    stripWired &&
    todayPageWired &&
    goldenTtvOk &&
    honestyMarkersPresent &&
    registryPresent &&
    ONBOARDING_TTV_P2_40_FLOW_STEPS.length === 4;

  return {
    policyId: ONBOARDING_TTV_P2_40_POLICY_ID,
    wiringComplete,
    docWired,
    measurementWired,
    recordHookWired,
    serviceWired,
    stripWired,
    todayPageWired,
    goldenTtvOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatOnboardingTtvP2_40AuditLines(summary: OnboardingTtvP2_40AuditSummary): string[] {
  return [
    `Onboarding TTV audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${ONBOARDING_TTV_P2_40_DOC})`,
    `Measurement module: ${summary.measurementWired ? "wired" : "missing"}`,
    `Order creation hook: ${summary.recordHookWired ? "wired" : "missing"}`,
    `TTV service: ${summary.serviceWired ? "wired" : "missing"}`,
    `TTV strip: ${summary.stripWired ? "wired" : "missing"}`,
    `Today page: ${summary.todayPageWired ? "yes" : "no"}`,
    `Golden TTV (22 min met): ${summary.goldenTtvOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
