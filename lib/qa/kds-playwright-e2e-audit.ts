import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_KITCHEN_PATH,
  KDS_PLAYWRIGHT_AUDIT_SCRIPT,
  KDS_PLAYWRIGHT_E2E_POLICY_ID,
  KDS_PLAYWRIGHT_E2E_SPEC,
  KDS_PLAYWRIGHT_FLOW_HELPER,
  KDS_PLAYWRIGHT_FLOW_STEPS,
  KDS_PLAYWRIGHT_NPM_SCRIPT,
  KDS_PLAYWRIGHT_READY_HELPER,
  KDS_PLAYWRIGHT_UNIT_TEST,
} from "@/lib/qa/kds-playwright-e2e-policy";

export type KdsPlaywrightE2EAuditSummary = {
  policyId: typeof KDS_PLAYWRIGHT_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  shiftFlowWired: boolean;
  bumpExpoFlowWired: boolean;
  completeStepWired: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditKdsPlaywrightE2E(root = process.cwd()): KdsPlaywrightE2EAuditSummary {
  const specPath = join(root, KDS_PLAYWRIGHT_E2E_SPEC);
  const flowPath = join(root, KDS_PLAYWRIGHT_FLOW_HELPER);
  const readyPath = join(root, KDS_PLAYWRIGHT_READY_HELPER);
  const shiftFlowPath = join(root, "e2e/helpers/pos-checkout-shift-flow.ts");
  const bumpExpoFlowPath = join(root, "e2e/helpers/kds-bump-expo-flow.ts");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);

  let shiftFlowWired = false;
  if (existsSync(shiftFlowPath)) {
    const source = readFileSync(shiftFlowPath, "utf8");
    shiftFlowWired =
      source.includes("ensureOpenShift") &&
      source.includes("completePosCashSale") &&
      source.includes("preparePosTerminal");
  }

  let bumpExpoFlowWired = false;
  if (existsSync(bumpExpoFlowPath)) {
    const source = readFileSync(bumpExpoFlowPath, "utf8");
    bumpExpoFlowWired =
      source.includes("bumpOrderToReadyOnKds") &&
      source.includes("assertOrderOnExpoReadyLane") &&
      (source.includes("KDS_EXPO_PATH") || source.includes("kds-expo-lane-ready"));
  }

  let completeStepWired = false;
  if (flowHelperPresent) {
    const source = readFileSync(flowPath, "utf8");
    completeStepWired =
      source.includes("complete_order") &&
      (source.includes("Complete order") || source.includes("KDS_PLAYWRIGHT_COMPLETE_ORDER_BUTTON")) &&
      source.includes("ensureOpenShift");
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(KDS_PLAYWRIGHT_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("KDS_PLAYWRIGHT_E2E_POLICY_ID"));
  const flowReferencesKitchen =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes(KDS_KITCHEN_PATH) ||
      readFileSync(flowPath, "utf8").includes("assertKdsKitchenReadyOrSkip"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    shiftFlowWired &&
    bumpExpoFlowWired &&
    completeStepWired &&
    specReferencesPolicy &&
    flowReferencesKitchen &&
    KDS_PLAYWRIGHT_FLOW_STEPS.length === 6;

  return {
    policyId: KDS_PLAYWRIGHT_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    shiftFlowWired,
    bumpExpoFlowWired,
    completeStepWired,
    flowStepCount: KDS_PLAYWRIGHT_FLOW_STEPS.length,
    passed,
  };
}

export function formatKdsPlaywrightAuditLines(summary: KdsPlaywrightE2EAuditSummary): string[] {
  return [
    `KDS Playwright E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${KDS_PLAYWRIGHT_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Shift flow wired: ${summary.shiftFlowWired ? "yes" : "no"}`,
    `Bump → expo flow wired: ${summary.bumpExpoFlowWired ? "yes" : "no"}`,
    `Complete step wired: ${summary.completeStepWired ? "yes" : "no"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${KDS_PLAYWRIGHT_UNIT_TEST}`,
    `Audit script: ${KDS_PLAYWRIGHT_AUDIT_SCRIPT}`,
    `NPM script: ${KDS_PLAYWRIGHT_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
