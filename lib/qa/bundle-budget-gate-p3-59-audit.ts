import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  BUNDLE_BUDGET_GATE_P3_59_CI_WORKFLOW,
  BUNDLE_BUDGET_GATE_P3_59_DOC,
  BUNDLE_BUDGET_GATE_P3_59_E2E_SPEC,
  BUNDLE_BUDGET_GATE_P3_59_FAIL_KB,
  BUNDLE_BUDGET_GATE_P3_59_FLOW_HELPER,
  BUNDLE_BUDGET_GATE_P3_59_FLOW_STEPS,
  BUNDLE_BUDGET_GATE_P3_59_NPM_SCRIPTS,
  BUNDLE_BUDGET_GATE_P3_59_POLICY_ID,
  BUNDLE_BUDGET_GATE_P3_59_READY_HELPER,
  BUNDLE_BUDGET_GATE_P3_59_WARN_KB,
  BUNDLE_BUDGET_GATE_P3_59_WIRING_PATHS,
} from "@/lib/qa/bundle-budget-gate-p3-59-policy";
import { validateBundleBudgetGateContract } from "@/lib/qa/bundle-budget-gate-p3-59-measurement";

export type BundleBudgetGateP3_59AuditSummary = {
  policyId: typeof BUNDLE_BUDGET_GATE_P3_59_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  flowWired: boolean;
  contractValid: boolean;
  failGate1000Kb: boolean;
  ciWorkflowWired: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditBundleBudgetGateP3_59(root = process.cwd()): BundleBudgetGateP3_59AuditSummary {
  const wiringComplete = BUNDLE_BUDGET_GATE_P3_59_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, BUNDLE_BUDGET_GATE_P3_59_DOC))) {
    const source = readFileSync(join(root, BUNDLE_BUDGET_GATE_P3_59_DOC), "utf8");
    docWired =
      source.includes(BUNDLE_BUDGET_GATE_P3_59_POLICY_ID) &&
      source.includes("1000") &&
      source.includes("check:bundle-size-regression");
  }

  let specWired = false;
  if (existsSync(join(root, BUNDLE_BUDGET_GATE_P3_59_E2E_SPEC))) {
    const source = readFileSync(join(root, BUNDLE_BUDGET_GATE_P3_59_E2E_SPEC), "utf8");
    specWired =
      source.includes(BUNDLE_BUDGET_GATE_P3_59_POLICY_ID) &&
      source.includes("runBundleBudgetGateContractStep");
  }

  let flowWired = false;
  if (existsSync(join(root, BUNDLE_BUDGET_GATE_P3_59_FLOW_HELPER))) {
    const source = readFileSync(join(root, BUNDLE_BUDGET_GATE_P3_59_FLOW_HELPER), "utf8");
    flowWired =
      source.includes("runBundleBudgetGateContractStep") &&
      source.includes("failThresholdKb") &&
      existsSync(join(root, BUNDLE_BUDGET_GATE_P3_59_READY_HELPER));
  }

  const contract = validateBundleBudgetGateContract(root);
  const failGate1000Kb = BUNDLE_BUDGET_GATE_P3_59_FAIL_KB === 1000;

  let ciWorkflowWired = false;
  if (existsSync(join(root, BUNDLE_BUDGET_GATE_P3_59_CI_WORKFLOW))) {
    const workflow = readFileSync(join(root, BUNDLE_BUDGET_GATE_P3_59_CI_WORKFLOW), "utf8");
    ciWorkflowWired =
      workflow.includes("Performance regression (bundle size)") &&
      workflow.includes("bundle-size-regression");
  }

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = BUNDLE_BUDGET_GATE_P3_59_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    flowWired &&
    contract.passed &&
    failGate1000Kb &&
    ciWorkflowWired &&
    npmScriptsWired &&
    BUNDLE_BUDGET_GATE_P3_59_FLOW_STEPS.length === 4 &&
    BUNDLE_BUDGET_GATE_P3_59_WARN_KB === 500;

  return {
    policyId: BUNDLE_BUDGET_GATE_P3_59_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    flowWired,
    contractValid: contract.passed,
    failGate1000Kb,
    ciWorkflowWired,
    npmScriptsWired,
    passed,
  };
}

export function formatBundleBudgetGateP3_59AuditLines(
  summary: BundleBudgetGateP3_59AuditSummary,
): string[] {
  return [
    `Bundle budget gate audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${BUNDLE_BUDGET_GATE_P3_59_DOC})`,
    `E2E spec: ${summary.specWired ? "yes" : "no"} (${BUNDLE_BUDGET_GATE_P3_59_E2E_SPEC})`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Fail gate 1000 kB: ${summary.failGate1000Kb ? "yes" : "no"}`,
    `CI workflow: ${summary.ciWorkflowWired ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
