import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VISUAL_REGRESSION_DARK_MODE_P3_58_CI_WORKFLOW,
  VISUAL_REGRESSION_DARK_MODE_P3_58_DOC,
  VISUAL_REGRESSION_DARK_MODE_P3_58_E2E_SPEC,
  VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_HELPER,
  VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_STEPS,
  VISUAL_REGRESSION_DARK_MODE_P3_58_NPM_SCRIPTS,
  VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID,
  VISUAL_REGRESSION_DARK_MODE_P3_58_READY_HELPER,
  VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_SPEC,
  VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT,
  VISUAL_REGRESSION_DARK_MODE_P3_58_WIRING_PATHS,
} from "@/lib/qa/visual-regression-dark-mode-p3-58-policy";
import { validateVisualRegressionDarkModeContract } from "@/lib/qa/visual-regression-dark-mode-p3-58-measurement";

export type VisualRegressionDarkModeP3_58AuditSummary = {
  policyId: typeof VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  flowWired: boolean;
  contractValid: boolean;
  fiveTargetsPresent: boolean;
  tenSnapshotPairs: boolean;
  chromaticWorkflowWired: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditVisualRegressionDarkModeP3_58(
  root = process.cwd(),
): VisualRegressionDarkModeP3_58AuditSummary {
  const wiringComplete = VISUAL_REGRESSION_DARK_MODE_P3_58_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_DOC))) {
    const source = readFileSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_DOC), "utf8");
    docWired =
      source.includes(VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID) &&
      source.includes("light") &&
      source.includes("dark") &&
      source.includes("Chromatic");
  }

  let specWired = false;
  if (existsSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_E2E_SPEC))) {
    const source = readFileSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_E2E_SPEC), "utf8");
    specWired =
      source.includes(VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID) &&
      source.includes("runVisualRegressionContractStep") &&
      source.includes("light");
  }

  let flowWired = false;
  if (existsSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_HELPER))) {
    const source = readFileSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_HELPER), "utf8");
    flowWired =
      source.includes("runVisualRegressionContractStep") &&
      source.includes("listVisualRegressionTargets") &&
      existsSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_READY_HELPER));
  }

  const contract = validateVisualRegressionDarkModeContract(root);
  const fiveTargetsPresent = contract.targetCount === VISUAL_REGRESSION_DARK_MODE_P3_58_TARGET_COUNT;
  const tenSnapshotPairs =
    contract.snapshotPairCount === VISUAL_REGRESSION_DARK_MODE_P3_58_SNAPSHOT_PAIR_COUNT;

  let chromaticWorkflowWired = false;
  if (existsSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_CI_WORKFLOW))) {
    const workflow = readFileSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_CI_WORKFLOW), "utf8");
    chromaticWorkflowWired =
      workflow.includes("Visual regression") && workflow.includes("dark-mode-parity");
  }

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = VISUAL_REGRESSION_DARK_MODE_P3_58_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    flowWired &&
    contract.passed &&
    fiveTargetsPresent &&
    tenSnapshotPairs &&
    chromaticWorkflowWired &&
    npmScriptsWired &&
    VISUAL_REGRESSION_DARK_MODE_P3_58_FLOW_STEPS.length === 4 &&
    existsSync(join(root, VISUAL_REGRESSION_DARK_MODE_P3_58_SPEC));

  return {
    policyId: VISUAL_REGRESSION_DARK_MODE_P3_58_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    flowWired,
    contractValid: contract.passed,
    fiveTargetsPresent,
    tenSnapshotPairs,
    chromaticWorkflowWired,
    npmScriptsWired,
    passed,
  };
}

export function formatVisualRegressionDarkModeP3_58AuditLines(
  summary: VisualRegressionDarkModeP3_58AuditSummary,
): string[] {
  return [
    `Visual regression dark mode audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${VISUAL_REGRESSION_DARK_MODE_P3_58_DOC})`,
    `E2E spec: ${summary.specWired ? "yes" : "no"} (${VISUAL_REGRESSION_DARK_MODE_P3_58_E2E_SPEC})`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Five targets: ${summary.fiveTargetsPresent ? "yes" : "no"}`,
    `Ten snapshot pairs: ${summary.tenSnapshotPairs ? "yes" : "no"}`,
    `Chromatic workflow: ${summary.chromaticWorkflowWired ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
