import {
  BUNDLE_BUDGET_GATE_P3_59_FAIL_KB,
  BUNDLE_BUDGET_GATE_P3_59_FLOW_STEPS,
  BUNDLE_BUDGET_GATE_P3_59_WARN_KB,
} from "@/lib/qa/bundle-budget-gate-p3-59-policy";
import {
  validateBuildLogWhenPresent,
  validateBundleBudgetGateContract,
} from "@/lib/qa/bundle-budget-gate-p3-59-measurement";

export function runBundleBudgetGateContractStep() {
  const validation = validateBundleBudgetGateContract();
  const buildLog = validateBuildLogWhenPresent();
  return {
    step: BUNDLE_BUDGET_GATE_P3_59_FLOW_STEPS[0],
    passed: validation.passed && buildLog.passed,
    failThresholdKb: BUNDLE_BUDGET_GATE_P3_59_FAIL_KB,
    warnThresholdKb: BUNDLE_BUDGET_GATE_P3_59_WARN_KB,
    buildLogChecked: buildLog.checked,
    failures: validation.failures,
  };
}

export function runBundleBudgetGatePolicyFlow() {
  return {
    steps: [...BUNDLE_BUDGET_GATE_P3_59_FLOW_STEPS],
    contract: runBundleBudgetGateContractStep(),
  };
}
