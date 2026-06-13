import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BUNDLE_SIZE_BASELINE_ARTIFACT,
  BUNDLE_SIZE_BUDGET_POLICY_ID,
  findAbsoluteBundleBudgetFails,
  parseFirstLoadJsFromBuildLog,
  type BundleSizeBaseline,
} from "@/lib/performance/bundle-size-budget-policy";
import {
  BUNDLE_BUDGET_GATE_P3_59_BUILD_LOG,
  BUNDLE_BUDGET_GATE_P3_59_CHECK_SCRIPT,
  BUNDLE_BUDGET_GATE_P3_59_CI_WORKFLOW,
  BUNDLE_BUDGET_GATE_P3_59_FAIL_KB,
  BUNDLE_BUDGET_GATE_P3_59_WARN_KB,
} from "@/lib/qa/bundle-budget-gate-p3-59-policy";

export type BundleBudgetGateContractValidation = {
  passed: boolean;
  baselinePresent: boolean;
  checkScriptPresent: boolean;
  ciWorkflowWired: boolean;
  failThresholdKb: number;
  warnThresholdKb: number;
  failures: string[];
};

export function validateBundleBudgetGateContract(
  root = process.cwd(),
): BundleBudgetGateContractValidation {
  const failures: string[] = [];

  const baselinePath = join(root, BUNDLE_SIZE_BASELINE_ARTIFACT);
  if (!existsSync(baselinePath)) {
    failures.push(`missing baseline: ${BUNDLE_SIZE_BASELINE_ARTIFACT}`);
  } else {
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as BundleSizeBaseline;
    if (baseline.policyId !== BUNDLE_SIZE_BUDGET_POLICY_ID) {
      failures.push(`baseline policy mismatch: ${baseline.policyId}`);
    }
  }

  if (!existsSync(join(root, BUNDLE_BUDGET_GATE_P3_59_CHECK_SCRIPT))) {
    failures.push(`missing check script: ${BUNDLE_BUDGET_GATE_P3_59_CHECK_SCRIPT}`);
  } else {
    const script = readFileSync(join(root, BUNDLE_BUDGET_GATE_P3_59_CHECK_SCRIPT), "utf8");
    if (!script.includes("BUNDLE_FIRST_LOAD_FAIL_KB")) {
      failures.push("check script missing 1000 kB fail gate");
    }
  }

  let ciWorkflowWired = false;
  const workflowPath = join(root, BUNDLE_BUDGET_GATE_P3_59_CI_WORKFLOW);
  if (!existsSync(workflowPath)) {
    failures.push(`missing CI workflow: ${BUNDLE_BUDGET_GATE_P3_59_CI_WORKFLOW}`);
  } else {
    const workflow = readFileSync(workflowPath, "utf8");
    ciWorkflowWired =
      workflow.includes("Performance regression (bundle size)") &&
      workflow.includes("bundle-size-regression") &&
      workflow.includes("build-route-sizes.log");
    if (!ciWorkflowWired) {
      failures.push("ci.yml missing bundle size regression gate");
    }
  }

  return {
    passed: failures.length === 0,
    baselinePresent: existsSync(baselinePath),
    checkScriptPresent: existsSync(join(root, BUNDLE_BUDGET_GATE_P3_59_CHECK_SCRIPT)),
    ciWorkflowWired,
    failThresholdKb: BUNDLE_BUDGET_GATE_P3_59_FAIL_KB,
    warnThresholdKb: BUNDLE_BUDGET_GATE_P3_59_WARN_KB,
    failures,
  };
}

export function simulateBundleBudgetGateFromLog(
  log: string,
): { failCount: number; routesOverFailKb: string[] } {
  const measured = parseFirstLoadJsFromBuildLog(log);
  const fails = findAbsoluteBundleBudgetFails(measured);
  return {
    failCount: fails.length,
    routesOverFailKb: fails.map((fail) => fail.route),
  };
}

export function validateBuildLogWhenPresent(root = process.cwd()): {
  checked: boolean;
  passed: boolean;
  failCount: number;
} {
  const logPath = join(root, BUNDLE_BUDGET_GATE_P3_59_BUILD_LOG);
  if (!existsSync(logPath)) {
    return { checked: false, passed: true, failCount: 0 };
  }

  const result = simulateBundleBudgetGateFromLog(readFileSync(logPath, "utf8"));
  return {
    checked: true,
    passed: result.failCount === 0,
    failCount: result.failCount,
  };
}
