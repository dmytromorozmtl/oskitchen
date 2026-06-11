import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_BUMP_EXPO_AUDIT_SCRIPT,
  KDS_BUMP_EXPO_E2E_POLICY_ID,
  KDS_BUMP_EXPO_E2E_SPEC,
  KDS_BUMP_EXPO_FLOW_HELPER,
  KDS_BUMP_EXPO_FLOW_STEPS,
  KDS_BUMP_EXPO_NPM_SCRIPT,
  KDS_BUMP_EXPO_READY_HELPER,
  KDS_BUMP_EXPO_UNIT_TEST,
  KDS_EXPO_PATH,
  KDS_EXPO_VIEW_ROOT_TEST_ID,
  KDS_KITCHEN_PATH,
} from "@/lib/kitchen/kds-bump-expo-e2e-policy";

export type KdsBumpExpoE2EAuditSummary = {
  policyId: typeof KDS_BUMP_EXPO_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  expoViewWired: boolean;
  kitchenPagePresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditKdsBumpExpoE2E(root = process.cwd()): KdsBumpExpoE2EAuditSummary {
  const specPath = join(root, KDS_BUMP_EXPO_E2E_SPEC);
  const flowPath = join(root, KDS_BUMP_EXPO_FLOW_HELPER);
  const readyPath = join(root, KDS_BUMP_EXPO_READY_HELPER);
  const expoClientPath = join(root, "components/kitchen/expo-view-client.tsx");
  const kitchenPagePath = join(root, "app/dashboard/kitchen/page.tsx");
  const expoPagePath = join(root, "app/dashboard/kitchen/expo/page.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const kitchenPagePresent = existsSync(kitchenPagePath) && existsSync(expoPagePath);

  let expoViewWired = false;
  if (existsSync(expoClientPath)) {
    const expoSource = readFileSync(expoClientPath, "utf8");
    expoViewWired =
      expoSource.includes(KDS_EXPO_VIEW_ROOT_TEST_ID) &&
      expoSource.includes("kds-expo-lane-") &&
      expoSource.includes("kds-expo-ticket");
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(KDS_BUMP_EXPO_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("KDS_BUMP_EXPO_E2E_POLICY_ID"));
  const flowReferencesKitchen =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(KDS_KITCHEN_PATH) ||
      readFileSync(flowPath, "utf8").includes("KDS_KITCHEN_PATH") ||
      readFileSync(flowPath, "utf8").includes("assertKdsKitchenReadyOrSkip"));
  const flowReferencesExpo =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(KDS_EXPO_PATH) ||
      readFileSync(flowPath, "utf8").includes("KDS_EXPO_PATH") ||
      readFileSync(flowPath, "utf8").includes("kds-expo-lane-ready"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    kitchenPagePresent &&
    expoViewWired &&
    specReferencesPolicy &&
    flowReferencesKitchen &&
    flowReferencesExpo &&
    KDS_BUMP_EXPO_FLOW_STEPS.length >= 4;

  return {
    policyId: KDS_BUMP_EXPO_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    expoViewWired,
    kitchenPagePresent,
    flowStepCount: KDS_BUMP_EXPO_FLOW_STEPS.length,
    passed,
  };
}

export function formatKdsBumpExpoAuditLines(summary: KdsBumpExpoE2EAuditSummary): string[] {
  return [
    `KDS bump → expo E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${KDS_BUMP_EXPO_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Expo view testids wired: ${summary.expoViewWired ? "yes" : "no"}`,
    `Kitchen + expo pages: ${summary.kitchenPagePresent ? "present" : "missing"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${KDS_BUMP_EXPO_UNIT_TEST}`,
    `Audit script: ${KDS_BUMP_EXPO_AUDIT_SCRIPT}`,
    `NPM script: ${KDS_BUMP_EXPO_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
