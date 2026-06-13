import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT,
  BUTTON_REGRESSION_P3_52_CRITICAL_PAGES,
  BUTTON_REGRESSION_P3_52_DOC,
  BUTTON_REGRESSION_P3_52_FLOW_HELPER,
  BUTTON_REGRESSION_P3_52_FLOW_STEPS,
  BUTTON_REGRESSION_P3_52_POLICY_ID,
  BUTTON_REGRESSION_P3_52_READY_HELPER,
  BUTTON_REGRESSION_P3_52_SPEC,
  BUTTON_REGRESSION_P3_52_WIRING_PATHS,
} from "@/lib/qa/button-regression-p3-52-policy";
import {
  BUTTON_REGRESSION_P3_52_SHELL_BUTTONS,
  countButtonRegressionProbes,
  validateButtonRegressionContract,
} from "@/lib/qa/button-regression-p3-52-measurement";

export type ButtonRegressionP3_52AuditSummary = {
  policyId: typeof BUTTON_REGRESSION_P3_52_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  flowWired: boolean;
  contractValid: boolean;
  thirtyPagesPresent: boolean;
  probeCount: number;
  passed: boolean;
};

export function auditButtonRegressionP3_52(
  root = process.cwd(),
): ButtonRegressionP3_52AuditSummary {
  const wiringComplete = BUTTON_REGRESSION_P3_52_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, BUTTON_REGRESSION_P3_52_DOC))) {
    const source = readFileSync(join(root, BUTTON_REGRESSION_P3_52_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("30") &&
      source.includes("button") &&
      source.includes("critical") &&
      source.includes("shell");
  }

  let specWired = false;
  if (existsSync(join(root, BUTTON_REGRESSION_P3_52_SPEC))) {
    const source = readFileSync(join(root, BUTTON_REGRESSION_P3_52_SPEC), "utf8");
    specWired =
      source.includes("button-regression-p3-52-v1") &&
      source.includes("runButtonRegressionFlow") &&
      source.includes("authed_page_button_smoke");
  }

  let flowWired = false;
  if (existsSync(join(root, BUTTON_REGRESSION_P3_52_FLOW_HELPER))) {
    const source = readFileSync(join(root, BUTTON_REGRESSION_P3_52_FLOW_HELPER), "utf8");
    flowWired =
      source.includes("runButtonRegressionAuthedSmokeStep") &&
      source.includes("probePageButtons") &&
      existsSync(join(root, BUTTON_REGRESSION_P3_52_READY_HELPER));
  }

  const contract = validateButtonRegressionContract();
  const thirtyPagesPresent =
    BUTTON_REGRESSION_P3_52_CRITICAL_PAGES.length === BUTTON_REGRESSION_P3_52_CRITICAL_PAGE_COUNT;
  const probeCount = countButtonRegressionProbes();

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    flowWired &&
    contract.passed &&
    thirtyPagesPresent &&
    probeCount >= 90 &&
    BUTTON_REGRESSION_P3_52_SHELL_BUTTONS.length === 3 &&
    BUTTON_REGRESSION_P3_52_FLOW_STEPS.length === 2;

  return {
    policyId: BUTTON_REGRESSION_P3_52_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    flowWired,
    contractValid: contract.passed,
    thirtyPagesPresent,
    probeCount,
    passed,
  };
}

export function formatButtonRegressionP3_52AuditLines(
  summary: ButtonRegressionP3_52AuditSummary,
): string[] {
  return [
    `Button regression audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${BUTTON_REGRESSION_P3_52_DOC})`,
    `Spec wired: ${summary.specWired ? "yes" : "no"} (${BUTTON_REGRESSION_P3_52_SPEC})`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Thirty pages: ${summary.thirtyPagesPresent ? "yes" : "no"}`,
    `Button probes: ${summary.probeCount}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
