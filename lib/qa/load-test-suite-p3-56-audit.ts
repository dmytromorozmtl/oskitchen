import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOAD_TEST_SUITE_P3_56_DOC,
  LOAD_TEST_SUITE_P3_56_FLOW_HELPER,
  LOAD_TEST_SUITE_P3_56_FLOW_STEPS,
  LOAD_TEST_SUITE_P3_56_MODULE_COUNT,
  LOAD_TEST_SUITE_P3_56_MODULES,
  LOAD_TEST_SUITE_P3_56_POLICY_ID,
  LOAD_TEST_SUITE_P3_56_READY_HELPER,
  LOAD_TEST_SUITE_P3_56_SPEC,
  LOAD_TEST_SUITE_P3_56_WIRING_PATHS,
} from "@/lib/qa/load-test-suite-p3-56-policy";
import { validateLoadTestSuiteContract } from "@/lib/qa/load-test-suite-p3-56-measurement";

export type LoadTestSuiteP3_56AuditSummary = {
  policyId: typeof LOAD_TEST_SUITE_P3_56_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  flowWired: boolean;
  contractValid: boolean;
  threeModulesPresent: boolean;
  k6ScriptsPresent: boolean;
  passed: boolean;
};

export function auditLoadTestSuiteP3_56(root = process.cwd()): LoadTestSuiteP3_56AuditSummary {
  const wiringComplete = LOAD_TEST_SUITE_P3_56_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, LOAD_TEST_SUITE_P3_56_DOC))) {
    const source = readFileSync(join(root, LOAD_TEST_SUITE_P3_56_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("webhook burst") &&
      source.includes("kds refresh") &&
      source.includes("pos checkout") &&
      source.includes("k6");
  }

  let specWired = false;
  if (existsSync(join(root, LOAD_TEST_SUITE_P3_56_SPEC))) {
    const source = readFileSync(join(root, LOAD_TEST_SUITE_P3_56_SPEC), "utf8");
    specWired =
      source.includes("load-test-suite-p3-56-v1") &&
      source.includes("runLoadTestSuiteContractStep") &&
      source.includes("webhook_burst");
  }

  let flowWired = false;
  if (existsSync(join(root, LOAD_TEST_SUITE_P3_56_FLOW_HELPER))) {
    const source = readFileSync(join(root, LOAD_TEST_SUITE_P3_56_FLOW_HELPER), "utf8");
    flowWired =
      source.includes("runLoadTestSuiteContractStep") &&
      source.includes("listLoadTestSuiteModules") &&
      existsSync(join(root, LOAD_TEST_SUITE_P3_56_READY_HELPER));
  }

  const contract = validateLoadTestSuiteContract(root);
  const threeModulesPresent =
    LOAD_TEST_SUITE_P3_56_MODULES.length === LOAD_TEST_SUITE_P3_56_MODULE_COUNT;
  const k6ScriptsPresent = LOAD_TEST_SUITE_P3_56_MODULES.every((module) =>
    existsSync(join(root, module.k6Script)),
  );

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    flowWired &&
    contract.passed &&
    threeModulesPresent &&
    k6ScriptsPresent &&
    LOAD_TEST_SUITE_P3_56_FLOW_STEPS.length === 4;

  return {
    policyId: LOAD_TEST_SUITE_P3_56_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    flowWired,
    contractValid: contract.passed,
    threeModulesPresent,
    k6ScriptsPresent,
    passed,
  };
}

export function formatLoadTestSuiteP3_56AuditLines(
  summary: LoadTestSuiteP3_56AuditSummary,
): string[] {
  return [
    `Load test suite audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${LOAD_TEST_SUITE_P3_56_DOC})`,
    `Spec wired: ${summary.specWired ? "yes" : "no"} (${LOAD_TEST_SUITE_P3_56_SPEC})`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Three modules: ${summary.threeModulesPresent ? "yes" : "no"}`,
    `k6 scripts: ${summary.k6ScriptsPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
