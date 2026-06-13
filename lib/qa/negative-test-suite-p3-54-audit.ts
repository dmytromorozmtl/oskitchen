import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  NEGATIVE_TEST_SUITE_P3_54_DOC,
  NEGATIVE_TEST_SUITE_P3_54_FLOW_HELPER,
  NEGATIVE_TEST_SUITE_P3_54_FLOW_STEPS,
  NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT,
  NEGATIVE_TEST_SUITE_P3_54_MODULES,
  NEGATIVE_TEST_SUITE_P3_54_POLICY_ID,
  NEGATIVE_TEST_SUITE_P3_54_READY_HELPER,
  NEGATIVE_TEST_SUITE_P3_54_SPEC,
  NEGATIVE_TEST_SUITE_P3_54_WIRING_PATHS,
} from "@/lib/qa/negative-test-suite-p3-54-policy";
import {
  uniqueNegativeTestSuiteSpecs,
  validateNegativeTestSuiteContract,
} from "@/lib/qa/negative-test-suite-p3-54-measurement";

export type NegativeTestSuiteP3_54AuditSummary = {
  policyId: typeof NEGATIVE_TEST_SUITE_P3_54_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  flowWired: boolean;
  contractValid: boolean;
  fiveModulesPresent: boolean;
  expiredSessionWired: boolean;
  passed: boolean;
};

export function auditNegativeTestSuiteP3_54(
  root = process.cwd(),
): NegativeTestSuiteP3_54AuditSummary {
  const wiringComplete = NEGATIVE_TEST_SUITE_P3_54_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, NEGATIVE_TEST_SUITE_P3_54_DOC))) {
    const source = readFileSync(join(root, NEGATIVE_TEST_SUITE_P3_54_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("invalid signature") &&
      source.includes("replay") &&
      source.includes("wrong tenant") &&
      source.includes("expired session") &&
      source.includes("no permission");
  }

  let specWired = false;
  if (existsSync(join(root, NEGATIVE_TEST_SUITE_P3_54_SPEC))) {
    const source = readFileSync(join(root, NEGATIVE_TEST_SUITE_P3_54_SPEC), "utf8");
    specWired =
      source.includes("negative-test-suite-p3-54-v1") &&
      source.includes("runNegativeTestSuiteContractStep") &&
      source.includes("invalid_signature");
  }

  let flowWired = false;
  if (existsSync(join(root, NEGATIVE_TEST_SUITE_P3_54_FLOW_HELPER))) {
    const source = readFileSync(join(root, NEGATIVE_TEST_SUITE_P3_54_FLOW_HELPER), "utf8");
    flowWired =
      source.includes("runNegativeTestSuiteContractStep") &&
      source.includes("listNegativeTestSuiteModules") &&
      existsSync(join(root, NEGATIVE_TEST_SUITE_P3_54_READY_HELPER));
  }

  const contract = validateNegativeTestSuiteContract(root);
  const fiveModulesPresent =
    NEGATIVE_TEST_SUITE_P3_54_MODULES.length === NEGATIVE_TEST_SUITE_P3_54_MODULE_COUNT;

  const expiredSessionWired = NEGATIVE_TEST_SUITE_P3_54_MODULES.some(
    (module) => module.id === "expired_session" && module.policyId === "expired-session-e2e-v1",
  );

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    flowWired &&
    contract.passed &&
    fiveModulesPresent &&
    expiredSessionWired &&
    uniqueNegativeTestSuiteSpecs().length >= 5 &&
    NEGATIVE_TEST_SUITE_P3_54_FLOW_STEPS.length === 6;

  return {
    policyId: NEGATIVE_TEST_SUITE_P3_54_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    flowWired,
    contractValid: contract.passed,
    fiveModulesPresent,
    expiredSessionWired,
    passed,
  };
}

export function formatNegativeTestSuiteP3_54AuditLines(
  summary: NegativeTestSuiteP3_54AuditSummary,
): string[] {
  return [
    `Negative test suite audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${NEGATIVE_TEST_SUITE_P3_54_DOC})`,
    `Spec wired: ${summary.specWired ? "yes" : "no"} (${NEGATIVE_TEST_SUITE_P3_54_SPEC})`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Five modules: ${summary.fiveModulesPresent ? "yes" : "no"}`,
    `Expired session module: ${summary.expiredSessionWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
